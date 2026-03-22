import type { WorldPoint } from "@engine/geometry/primitives";
import { sampleDeterministicSignature } from "@engine/world/worldContract";

import { hostileCombatContract } from "./hostileCombatContract";
import { pickupContract } from "./pickupContract";
import { gameplayTuning } from "@game/config/gameplayTuning";
import type { SingleEntityControlState } from "@game/input/singleEntityControlContract";
import type { SimulatedEntity, SimulatedPickupKind } from "./entitySimulation";

type SpawnCommand = {
  controlState?: SingleEntityControlState;
};

const isAlive = (entity: SimulatedEntity) => entity.combat.currentHealth > 0;

const getPlayerEntity = (entities: readonly SimulatedEntity[]) =>
  entities.find((entity) => entity.role === "player") ?? entities[0];

const distanceBetweenWorldPoints = (left: WorldPoint, right: WorldPoint) =>
  Math.hypot(right.x - left.x, right.y - left.y);

const countLocalHostiles = (entities: readonly SimulatedEntity[], playerEntity: SimulatedEntity) =>
  entities.filter(
    (entity) =>
      entity.role === "hostile" &&
      isAlive(entity) &&
      distanceBetweenWorldPoints(entity.worldPosition, playerEntity.worldPosition) <=
        hostileCombatContract.hostile.acquisitionRadiusWorldUnits
  ).length;

const resolvePreferredSpawnHeadingRadians = ({
  command,
  playerEntity,
  spawnHeadingMemoryTicks,
  tick
}: {
  command: SpawnCommand;
  playerEntity: SimulatedEntity;
  spawnHeadingMemoryTicks: number;
  tick: number;
}) => {
  const movementIntent = command.controlState?.movementIntent;

  if (
    movementIntent?.isActive &&
    (movementIntent.vector.x !== 0 || movementIntent.vector.y !== 0)
  ) {
    return Math.atan2(movementIntent.vector.y, movementIntent.vector.x);
  }

  if (
    playerEntity.movementHeadingMemory &&
    tick - playerEntity.movementHeadingMemory.lastMeaningfulTick <= spawnHeadingMemoryTicks
  ) {
    return playerEntity.movementHeadingMemory.headingRadians;
  }

  if (Math.hypot(playerEntity.velocity.x, playerEntity.velocity.y) > 0) {
    return Math.atan2(playerEntity.velocity.y, playerEntity.velocity.x);
  }

  return null;
};

const sampleSpawnAngleWithinSector = ({
  baseHeadingRadians,
  sectorCenterOffsetRadians,
  sectorWidthRadians,
  signature
}: {
  baseHeadingRadians: number;
  sectorCenterOffsetRadians: number;
  sectorWidthRadians: number;
  signature: number;
}) => {
  const halfWidth = sectorWidthRadians / 2;
  const normalizedOffset = ((signature % 1000) / 999) * sectorWidthRadians - halfWidth;

  return baseHeadingRadians + sectorCenterOffsetRadians + normalizedOffset;
};

const sampleHostileSpawnPosition = ({
  attempt,
  command,
  playerEntity,
  sequence,
  spawnHeadingMemoryTicks,
  tick,
  worldSeed
}: {
  attempt: number;
  command: SpawnCommand;
  playerEntity: SimulatedEntity;
  sequence: number;
  spawnHeadingMemoryTicks: number;
  tick: number;
  worldSeed: string;
}) => {
  const angleSignature = sampleDeterministicSignature(
    `${worldSeed}:hostile-angle:${sequence}:${playerEntity.worldPosition.x}:${playerEntity.worldPosition.y}`
  );
  const distanceSignature = sampleDeterministicSignature(
    `${worldSeed}:hostile-distance:${sequence}:${playerEntity.worldPosition.x}:${playerEntity.worldPosition.y}`
  );
  const preferredHeadingRadians = resolvePreferredSpawnHeadingRadians({
    command,
    playerEntity,
    spawnHeadingMemoryTicks,
    tick
  });
  const sectorDefinitions =
    preferredHeadingRadians === null ? null : gameplayTuning.hostileSpawn.sectors;
  const sectorDefinition =
    sectorDefinitions?.[attempt % sectorDefinitions.length] ?? null;
  const angleRadians =
    preferredHeadingRadians === null || !sectorDefinition
      ? ((angleSignature % 360) * Math.PI) / 180
      : sampleSpawnAngleWithinSector({
          baseHeadingRadians: preferredHeadingRadians,
          sectorCenterOffsetRadians: sectorDefinition.centerOffsetRadians,
          sectorWidthRadians: sectorDefinition.widthRadians,
          signature: angleSignature
        });
  const distanceRatioRange =
    gameplayTuning.hostileSpawn.distanceRatioMax - gameplayTuning.hostileSpawn.distanceRatioMin;
  const distanceRatio =
    gameplayTuning.hostileSpawn.distanceRatioMin +
    ((distanceSignature % 1000) / 999) * distanceRatioRange;
  const radialDistance =
    hostileCombatContract.hostile.safeSpawnDistanceWorldUnits * distanceRatio;

  return {
    x: playerEntity.worldPosition.x + Math.cos(angleRadians) * radialDistance,
    y: playerEntity.worldPosition.y + Math.sin(angleRadians) * radialDistance
  };
};

export const maintainLocalHostilePopulation = ({
  canSpawnEntityAtPosition,
  command,
  createHostileEntity,
  entities,
  nextHostileSequence,
  spawnHeadingMemoryTicks,
  tick,
  worldSeed
}: {
  canSpawnEntityAtPosition: (args: {
    entities: readonly SimulatedEntity[];
    footprintRadius: number;
    worldPosition: WorldPoint;
    worldSeed: string;
  }) => boolean;
  command: SpawnCommand;
  createHostileEntity: (
    hostileSequence: number,
    worldPosition: WorldPoint,
    spawnedAtTick: number
  ) => SimulatedEntity;
  entities: readonly SimulatedEntity[];
  nextHostileSequence: number;
  spawnHeadingMemoryTicks: number;
  tick: number;
  worldSeed: string;
}) => {
  const playerEntity = getPlayerEntity(entities);

  if (!playerEntity || !isAlive(playerEntity)) {
    return {
      entities: [...entities],
      nextHostileSequence
    };
  }

  const retainedEntities = entities.filter(
    (entity) =>
      entity.role !== "hostile" ||
      !isAlive(entity) ||
      distanceBetweenWorldPoints(entity.worldPosition, playerEntity.worldPosition) <=
        hostileCombatContract.hostile.despawnDistanceWorldUnits
  );

  const localHostileCount = countLocalHostiles(retainedEntities, playerEntity);

  if (
    localHostileCount >= hostileCombatContract.hostile.localPopulationCap ||
    tick % hostileCombatContract.hostile.spawnCooldownTicks !== 0
  ) {
    return {
      entities: retainedEntities,
      nextHostileSequence
    };
  }

  for (
    let attempt = 0;
    attempt < hostileCombatContract.hostile.spawnAttemptCount;
    attempt += 1
  ) {
    const hostileSequence = nextHostileSequence + attempt;
    const candidatePosition = sampleHostileSpawnPosition({
      attempt,
      command,
      playerEntity,
      sequence: hostileSequence,
      spawnHeadingMemoryTicks,
      tick,
      worldSeed
    });

    if (
      distanceBetweenWorldPoints(candidatePosition, playerEntity.worldPosition) <
      hostileCombatContract.hostile.safeSpawnDistanceWorldUnits
    ) {
      continue;
    }

    const hostileEntity = createHostileEntity(hostileSequence, candidatePosition, tick);

    if (
      !canSpawnEntityAtPosition({
        entities: retainedEntities,
        footprintRadius: hostileEntity.footprint.radius,
        worldPosition: candidatePosition,
        worldSeed
      })
    ) {
      continue;
    }

    return {
      entities: [...retainedEntities, hostileEntity],
      nextHostileSequence: hostileSequence + 1
    };
  }

  return {
    entities: retainedEntities,
    nextHostileSequence
  };
};

const countNearbyPickups = (entities: readonly SimulatedEntity[], playerEntity: SimulatedEntity) =>
  entities.filter(
    (entity) =>
      entity.role === "pickup" &&
      distanceBetweenWorldPoints(entity.worldPosition, playerEntity.worldPosition) <=
        pickupContract.pickup.despawnDistanceWorldUnits
  ).length;

const samplePickupSpawnPosition = ({
  playerEntity,
  sequence,
  worldSeed
}: {
  playerEntity: SimulatedEntity;
  sequence: number;
  worldSeed: string;
}) => {
  const angleSignature = sampleDeterministicSignature(
    `${worldSeed}:pickup-angle:${sequence}:${playerEntity.worldPosition.x}:${playerEntity.worldPosition.y}`
  );
  const distanceSignature = sampleDeterministicSignature(
    `${worldSeed}:pickup-distance:${sequence}:${playerEntity.worldPosition.x}:${playerEntity.worldPosition.y}`
  );
  const angleRadians = ((angleSignature % 360) * Math.PI) / 180;
  const distanceRatio = 0.85 + (distanceSignature % 45) / 100;
  const radialDistance =
    pickupContract.pickup.safeSpawnDistanceWorldUnits * distanceRatio;

  return {
    x: playerEntity.worldPosition.x + Math.cos(angleRadians) * radialDistance,
    y: playerEntity.worldPosition.y + Math.sin(angleRadians) * radialDistance
  };
};

const samplePickupKind = ({
  playerEntity,
  sequence,
  worldSeed
}: {
  playerEntity: SimulatedEntity;
  sequence: number;
  worldSeed: string;
}): SimulatedPickupKind => {
  const pickupRoll = sampleDeterministicSignature(
    `${worldSeed}:pickup-kind:${sequence}:${playerEntity.worldPosition.x}:${playerEntity.worldPosition.y}`
  );

  return pickupRoll % 100 < pickupContract.healingKit.spawnChancePercent
    ? "healing-kit"
    : "gold";
};

export const maintainNearbyPickupPopulation = ({
  canSpawnEntityAtPosition,
  createPickupEntity,
  entities,
  nextPickupSequence,
  tick,
  worldSeed
}: {
  canSpawnEntityAtPosition: (args: {
    entities: readonly SimulatedEntity[];
    footprintRadius: number;
    worldPosition: WorldPoint;
    worldSeed: string;
  }) => boolean;
  createPickupEntity: (
    pickupSequence: number,
    pickupKind: SimulatedPickupKind,
    worldPosition: WorldPoint,
    spawnedAtTick: number
  ) => SimulatedEntity;
  entities: readonly SimulatedEntity[];
  nextPickupSequence: number;
  tick: number;
  worldSeed: string;
}) => {
  const playerEntity = getPlayerEntity(entities);

  if (!playerEntity || !isAlive(playerEntity)) {
    return {
      entities: [...entities],
      nextPickupSequence
    };
  }

  const retainedEntities = entities.filter(
    (entity) =>
      entity.role !== "pickup" ||
      distanceBetweenWorldPoints(entity.worldPosition, playerEntity.worldPosition) <=
        pickupContract.pickup.despawnDistanceWorldUnits
  );

  const nearbyPickupCount = countNearbyPickups(retainedEntities, playerEntity);

  if (
    nearbyPickupCount >= pickupContract.pickup.localPopulationCap ||
    tick % pickupContract.pickup.spawnCooldownTicks !== 0
  ) {
    return {
      entities: retainedEntities,
      nextPickupSequence
    };
  }

  for (let attempt = 0; attempt < pickupContract.pickup.spawnAttemptCount; attempt += 1) {
    const pickupSequence = nextPickupSequence + attempt;
    const candidatePosition = samplePickupSpawnPosition({
      playerEntity,
      sequence: pickupSequence,
      worldSeed
    });

    if (
      distanceBetweenWorldPoints(candidatePosition, playerEntity.worldPosition) <
      pickupContract.pickup.safeSpawnDistanceWorldUnits
    ) {
      continue;
    }

    const pickupEntity = createPickupEntity(
      pickupSequence,
      samplePickupKind({
        playerEntity,
        sequence: pickupSequence,
        worldSeed
      }),
      candidatePosition,
      tick
    );

    if (
      !canSpawnEntityAtPosition({
        entities: retainedEntities,
        footprintRadius: pickupEntity.footprint.radius,
        worldPosition: candidatePosition,
        worldSeed
      })
    ) {
      continue;
    }

    return {
      entities: [...retainedEntities, pickupEntity],
      nextPickupSequence: pickupSequence + 1
    };
  }

  return {
    entities: retainedEntities,
    nextPickupSequence
  };
};
