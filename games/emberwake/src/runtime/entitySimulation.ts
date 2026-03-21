import type { WorldPoint } from "@engine/geometry/primitives";
import {
  sampleDeterministicSignature,
  tileCoordinateToWorldOrigin,
  worldContract,
  worldPointToTileCoordinate
} from "@engine/world/worldContract";
import { createGenericMoverEntity } from "@game/content/entities/entityContract";
import { obstacleDefinitions, sampleWorldPointLayers, sampleWorldTileLayers } from "@game/content/world/worldGeneration";
import type { SingleEntityControlState } from "@game/input/singleEntityControlContract";
import { singleEntityControlContract } from "@game/input/singleEntityControlContract";
import type { EntityState, WorldEntity } from "@game/content/entities/entityContract";
import {
  deterministicRuntimeSupportEntities,
  emberwakeRuntimeBootstrap
} from "@game/runtime/emberwakeRuntimeBootstrap";
import { hostileCombatContract } from "@game/runtime/hostileCombatContract";
import { resolvePseudoPhysicalMovement } from "@game/runtime/pseudoPhysics";
import type { MovementSurfaceModifierKind } from "@game/content/world/worldData";

export const entitySimulationContract = {
  fixedStepMs: 1000 / 60,
  maxCatchUpStepsPerFrame: 6,
  speedOptions: [0.5, 1, 2] as const
} as const;

export type SimulatedEntityRole = "hostile" | "player" | "support";

export type EntityCombatState = {
  currentHealth: number;
  maxHealth: number;
};

export type AutomaticAttackProfile = {
  arcRadians: number;
  cooldownTicks: number;
  damage: number;
  lastAttackTick: number | null;
  rangeWorldUnits: number;
};

export type ContactDamageProfile = {
  cooldownTicks: number;
  damage: number;
  lastDamageTick: number | null;
};

export type FocusState = {
  acquisitionRadiusWorldUnits: number;
  targetEntityId: string | null;
};

export type SimulatedEntity = WorldEntity & {
  automaticAttack?: AutomaticAttackProfile;
  combat: EntityCombatState;
  contactDamageProfile?: ContactDamageProfile;
  focusState?: FocusState;
  movementSurfaceModifier: MovementSurfaceModifierKind;
  role: SimulatedEntityRole;
  spawnedAtTick: number;
  velocity: WorldPoint;
};

export type EntitySimulationState = {
  entities: SimulatedEntity[];
  entity: SimulatedEntity;
  nextHostileSequence: number;
  tick: number;
  worldSeed: string;
};

export type SimulationSpeedOption = (typeof entitySimulationContract.speedOptions)[number];

type SimulationCommand = {
  controlState?: SingleEntityControlState;
  worldSeed?: string;
};

type ScriptedPhase = {
  state: EntityState;
  velocity: WorldPoint;
};

type ResolvedEntityIntent = {
  focusTargetEntityId?: string | null;
  state: EntityState;
  velocity: WorldPoint;
};

const scriptedPhases: Array<{
  durationTicks: number;
  phase: ScriptedPhase;
}> = [
  {
    durationTicks: 60,
    phase: {
      state: "idle",
      velocity: { x: 0, y: 0 }
    }
  },
  {
    durationTicks: 120,
    phase: {
      state: "moving",
      velocity: { x: 120, y: 0 }
    }
  },
  {
    durationTicks: 60,
    phase: {
      state: "idle",
      velocity: { x: 0, y: 0 }
    }
  },
  {
    durationTicks: 120,
    phase: {
      state: "moving",
      velocity: { x: 0, y: 120 }
    }
  }
];

const totalCycleTicks = scriptedPhases.reduce(
  (currentTotal, phase) => currentTotal + phase.durationTicks,
  0
);

const createCombatState = (maxHealth: number): EntityCombatState => ({
  currentHealth: maxHealth,
  maxHealth
});

const createPlayerEntity = (): SimulatedEntity => ({
  ...createGenericMoverEntity({
    archetype: emberwakeRuntimeBootstrap.playerEntity.archetype,
    id: emberwakeRuntimeBootstrap.playerEntity.id,
    visual: {
      kind: emberwakeRuntimeBootstrap.playerEntity.visualKind,
      tint: emberwakeRuntimeBootstrap.playerEntity.tint
    },
    worldPosition: emberwakeRuntimeBootstrap.playerEntity.worldPosition
  }),
  automaticAttack: {
    ...hostileCombatContract.player.automaticConeAttack,
    lastAttackTick: null
  },
  combat: createCombatState(hostileCombatContract.player.maxHealth),
  movementSurfaceModifier: "normal",
  role: "player",
  spawnedAtTick: 0,
  velocity: {
    x: 0,
    y: 0
  }
});

const createHostileEntity = (
  hostileSequence: number,
  worldPosition: WorldPoint,
  spawnedAtTick: number
): SimulatedEntity => ({
  ...createGenericMoverEntity({
    archetype: "generic-mover",
    id: `entity:hostile:${hostileSequence}`,
    visual: {
      kind: "debug-sentinel",
      tint: "#ff6d78"
    },
    worldPosition
  }),
  combat: createCombatState(hostileCombatContract.hostile.maxHealth),
  contactDamageProfile: {
    cooldownTicks: hostileCombatContract.hostile.contactDamageCooldownTicks,
    damage: hostileCombatContract.hostile.contactDamage,
    lastDamageTick: null
  },
  focusState: {
    acquisitionRadiusWorldUnits: hostileCombatContract.hostile.acquisitionRadiusWorldUnits,
    targetEntityId: null
  },
  movementSurfaceModifier: "normal",
  role: "hostile",
  spawnedAtTick,
  velocity: {
    x: 0,
    y: 0
  }
});

const isAlive = (entity: SimulatedEntity) => entity.combat.currentHealth > 0;

const getPlayerEntity = (entities: readonly SimulatedEntity[]) =>
  entities.find((entity) => entity.role === "player") ?? entities[0];

const distanceBetweenWorldPoints = (left: WorldPoint, right: WorldPoint) =>
  Math.hypot(left.x - right.x, left.y - right.y);

const createVelocityTowardTarget = (
  source: WorldPoint,
  target: WorldPoint,
  moveSpeedWorldUnitsPerSecond: number
) => {
  const deltaX = target.x - source.x;
  const deltaY = target.y - source.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance === 0) {
    return {
      x: 0,
      y: 0
    };
  }

  return {
    x: (deltaX / distance) * moveSpeedWorldUnitsPerSecond,
    y: (deltaY / distance) * moveSpeedWorldUnitsPerSecond
  };
};

export const createInitialSimulationState = (): EntitySimulationState => {
  const playerEntity = createPlayerEntity();

  return {
    entities: [playerEntity],
    entity: playerEntity,
    nextHostileSequence: 0,
    tick: 0,
    worldSeed: emberwakeRuntimeBootstrap.worldSeed
  };
};

export const getScriptedEntityPhase = (tick: number): ScriptedPhase => {
  const normalizedTick = tick % totalCycleTicks;
  let remainingTick = normalizedTick;

  for (const scriptedPhase of scriptedPhases) {
    if (remainingTick < scriptedPhase.durationTicks) {
      return scriptedPhase.phase;
    }

    remainingTick -= scriptedPhase.durationTicks;
  }

  return scriptedPhases[0].phase;
};

const resolveEntityIntent = ({
  command,
  entity,
  playerEntity,
  tick
}: {
  command: SimulationCommand;
  entity: SimulatedEntity;
  playerEntity: SimulatedEntity;
  tick: number;
}): ResolvedEntityIntent => {
  if (entity.role === "player") {
    const controlledEntity =
      command.controlState?.controlledEntityId === entity.id ? command.controlState : null;

    if (controlledEntity) {
      return {
        state: controlledEntity.movementIntent.isActive ? "moving" : "idle",
        velocity: {
          x:
            controlledEntity.movementIntent.vector.x *
            controlledEntity.movementIntent.magnitude *
            singleEntityControlContract.desktopMoveSpeedWorldUnitsPerSecond,
          y:
            controlledEntity.movementIntent.vector.y *
            controlledEntity.movementIntent.magnitude *
            singleEntityControlContract.desktopMoveSpeedWorldUnitsPerSecond
        }
      };
    }

    return getScriptedEntityPhase(tick);
  }

  if (entity.role !== "hostile" || !entity.focusState || !isAlive(playerEntity)) {
    return {
      focusTargetEntityId: null,
      state: "idle",
      velocity: { x: 0, y: 0 }
    };
  }

  const distanceToPlayer = distanceBetweenWorldPoints(
    entity.worldPosition,
    playerEntity.worldPosition
  );

  if (distanceToPlayer > entity.focusState.acquisitionRadiusWorldUnits) {
    return {
      focusTargetEntityId: null,
      state: "idle",
      velocity: { x: 0, y: 0 }
    };
  }

  return {
    focusTargetEntityId: playerEntity.id,
    state: "moving",
    velocity: createVelocityTowardTarget(
      entity.worldPosition,
      playerEntity.worldPosition,
      hostileCombatContract.hostile.moveSpeedWorldUnitsPerSecond
    )
  };
};

const circleIntersectsTileRect = (
  worldPosition: WorldPoint,
  footprintRadius: number,
  tileOrigin: WorldPoint
) => {
  const nearestPointX = Math.max(
    tileOrigin.x,
    Math.min(worldPosition.x, tileOrigin.x + worldContract.tileSizeInWorldUnits)
  );
  const nearestPointY = Math.max(
    tileOrigin.y,
    Math.min(worldPosition.y, tileOrigin.y + worldContract.tileSizeInWorldUnits)
  );
  const deltaX = worldPosition.x - nearestPointX;
  const deltaY = worldPosition.y - nearestPointY;

  return deltaX * deltaX + deltaY * deltaY < footprintRadius * footprintRadius;
};

const isWorldPositionBlockedByObstacle = (
  worldPosition: WorldPoint,
  footprintRadius: number,
  worldSeed: string
) => {
  const minTile = worldPointToTileCoordinate({
    x: worldPosition.x - footprintRadius,
    y: worldPosition.y - footprintRadius
  });
  const maxTile = worldPointToTileCoordinate({
    x: worldPosition.x + footprintRadius,
    y: worldPosition.y + footprintRadius
  });

  for (let tileX = minTile.x; tileX <= maxTile.x; tileX += 1) {
    for (let tileY = minTile.y; tileY <= maxTile.y; tileY += 1) {
      const tileSample = sampleWorldTileLayers(tileX, tileY, worldSeed);

      if (!obstacleDefinitions[tileSample.obstacleKind].blocksMovement) {
        continue;
      }

      if (
        circleIntersectsTileRect(
          worldPosition,
          footprintRadius,
          tileCoordinateToWorldOrigin({ x: tileX, y: tileY })
        )
      ) {
        return true;
      }
    }
  }

  return false;
};

const resolveEntityMovement = ({
  dynamicColliders,
  entity,
  intent,
  worldSeed
}: {
  dynamicColliders: readonly SimulatedEntity[];
  entity: SimulatedEntity;
  intent: ResolvedEntityIntent;
  worldSeed: string;
}) => {
  const stepSeconds = entitySimulationContract.fixedStepMs / 1000;
  const surfaceSample = sampleWorldPointLayers(entity.worldPosition, worldSeed);
  const resolvedMovement = resolvePseudoPhysicalMovement({
    currentPosition: entity.worldPosition,
    currentVelocity: entity.velocity,
    desiredVelocity: intent.velocity,
    footprintRadius: entity.footprint.radius,
    isBlockedAtPosition: (worldPosition, footprintRadius) =>
      isWorldPositionBlockedByObstacle(worldPosition, footprintRadius, worldSeed),
    staticColliders: [...deterministicRuntimeSupportEntities, ...dynamicColliders],
    stepSeconds,
    surfaceModifierKind: surfaceSample.modifierKind
  });
  const orientation =
    resolvedMovement.velocity.x === 0 && resolvedMovement.velocity.y === 0
      ? entity.orientation
      : Math.atan2(resolvedMovement.velocity.y, resolvedMovement.velocity.x);

  return {
    ...entity,
    focusState: entity.focusState
      ? {
          ...entity.focusState,
          targetEntityId: intent.focusTargetEntityId ?? null
        }
      : undefined,
    movementSurfaceModifier: resolvedMovement.surfaceModifierKind,
    orientation,
    state:
      resolvedMovement.velocity.x === 0 && resolvedMovement.velocity.y === 0
        ? "idle"
        : intent.state,
    velocity: resolvedMovement.velocity,
    worldPosition: resolvedMovement.worldPosition
  } satisfies SimulatedEntity;
};

const normalizeAngleDelta = (angleRadians: number) => {
  let normalizedAngle = angleRadians;

  while (normalizedAngle <= -Math.PI) {
    normalizedAngle += Math.PI * 2;
  }

  while (normalizedAngle > Math.PI) {
    normalizedAngle -= Math.PI * 2;
  }

  return normalizedAngle;
};

const applyDamage = (entity: SimulatedEntity, damage: number): SimulatedEntity => ({
  ...entity,
  combat: {
    ...entity.combat,
    currentHealth: Math.max(0, entity.combat.currentHealth - damage)
  }
});

const resolveAutomaticPlayerAttack = (
  entities: readonly SimulatedEntity[],
  tick: number
): SimulatedEntity[] => {
  const playerEntity = getPlayerEntity(entities);

  if (!playerEntity || !playerEntity.automaticAttack || !isAlive(playerEntity)) {
    return [...entities];
  }

  const { automaticAttack } = playerEntity;

  if (
    automaticAttack.lastAttackTick !== null &&
    tick - automaticAttack.lastAttackTick < automaticAttack.cooldownTicks
  ) {
    return [...entities];
  }

  const hitTargetIds = new Set(
    entities
      .filter((entity) => entity.role === "hostile" && isAlive(entity))
      .filter((hostileEntity) => {
        const distanceToHostile = distanceBetweenWorldPoints(
          playerEntity.worldPosition,
          hostileEntity.worldPosition
        );

        if (
          distanceToHostile >
          automaticAttack.rangeWorldUnits + hostileEntity.footprint.radius
        ) {
          return false;
        }

        const deltaX = hostileEntity.worldPosition.x - playerEntity.worldPosition.x;
        const deltaY = hostileEntity.worldPosition.y - playerEntity.worldPosition.y;
        const angleToHostile = Math.atan2(deltaY, deltaX);

        return (
          Math.abs(normalizeAngleDelta(angleToHostile - playerEntity.orientation)) <=
          automaticAttack.arcRadians / 2
        );
      })
      .map((entity) => entity.id)
  );

  if (hitTargetIds.size === 0) {
    return [...entities];
  }

  return entities.map((entity) => {
    if (entity.id === playerEntity.id) {
      return {
        ...entity,
        automaticAttack: {
          ...automaticAttack,
          lastAttackTick: tick
        }
      };
    }

    if (!hitTargetIds.has(entity.id)) {
      return entity;
    }

    return applyDamage(entity, automaticAttack.damage);
  });
};

const isEntityPairOverlapping = (leftEntity: SimulatedEntity, rightEntity: SimulatedEntity) =>
  distanceBetweenWorldPoints(leftEntity.worldPosition, rightEntity.worldPosition) <=
  leftEntity.footprint.radius + rightEntity.footprint.radius + 0.5;

const resolveHostileContactDamage = (
  entities: readonly SimulatedEntity[],
  previousEntities: readonly SimulatedEntity[],
  tick: number
): SimulatedEntity[] => {
  const playerEntity = getPlayerEntity(entities);
  const previousPlayerEntity = getPlayerEntity(previousEntities);

  if (!playerEntity || !isAlive(playerEntity)) {
    return [...entities];
  }

  let nextPlayerEntity = playerEntity;
  const nextEntities = entities.map((entity) => ({ ...entity }));

  for (let index = 0; index < nextEntities.length; index += 1) {
    const hostileEntity = nextEntities[index];

    if (
      hostileEntity.role !== "hostile" ||
      !hostileEntity.contactDamageProfile ||
      !isAlive(hostileEntity) ||
      !isAlive(nextPlayerEntity)
    ) {
      continue;
    }

    const previousHostileEntity = previousEntities.find(
      (entity) => entity.id === hostileEntity.id
    );
    const hadContactBeforeSeparation =
      previousPlayerEntity && previousHostileEntity
        ? isEntityPairOverlapping(previousHostileEntity, previousPlayerEntity)
        : false;

    if (!hadContactBeforeSeparation && !isEntityPairOverlapping(hostileEntity, nextPlayerEntity)) {
      continue;
    }

    const { contactDamageProfile } = hostileEntity;

    if (
      contactDamageProfile.lastDamageTick !== null &&
      tick - contactDamageProfile.lastDamageTick < contactDamageProfile.cooldownTicks
    ) {
      continue;
    }

    nextPlayerEntity = applyDamage(nextPlayerEntity, contactDamageProfile.damage);
    nextEntities[index] = {
      ...hostileEntity,
      contactDamageProfile: {
        ...contactDamageProfile,
        lastDamageTick: tick
      }
    };
  }

  return nextEntities.map((entity) =>
    entity.id === nextPlayerEntity.id ? nextPlayerEntity : entity
  );
};

const countLocalHostiles = (entities: readonly SimulatedEntity[], playerEntity: SimulatedEntity) =>
  entities.filter(
    (entity) =>
      entity.role === "hostile" &&
      isAlive(entity) &&
      distanceBetweenWorldPoints(entity.worldPosition, playerEntity.worldPosition) <=
        hostileCombatContract.hostile.acquisitionRadiusWorldUnits
  ).length;

const sampleHostileSpawnPosition = ({
  playerEntity,
  sequence,
  worldSeed
}: {
  playerEntity: SimulatedEntity;
  sequence: number;
  worldSeed: string;
}) => {
  const angleSignature = sampleDeterministicSignature(
    `${worldSeed}:hostile-angle:${sequence}:${playerEntity.worldPosition.x}:${playerEntity.worldPosition.y}`
  );
  const distanceSignature = sampleDeterministicSignature(
    `${worldSeed}:hostile-distance:${sequence}:${playerEntity.worldPosition.x}:${playerEntity.worldPosition.y}`
  );
  const angleRadians = ((angleSignature % 360) * Math.PI) / 180;
  const distanceRatio = 0.75 + (distanceSignature % 55) / 100;
  const radialDistance =
    hostileCombatContract.hostile.safeSpawnDistanceWorldUnits * distanceRatio;

  return {
    x: playerEntity.worldPosition.x + Math.cos(angleRadians) * radialDistance,
    y: playerEntity.worldPosition.y + Math.sin(angleRadians) * radialDistance
  };
};

const canSpawnHostileAtPosition = ({
  entities,
  footprintRadius,
  worldPosition,
  worldSeed
}: {
  entities: readonly SimulatedEntity[];
  footprintRadius: number;
  worldPosition: WorldPoint;
  worldSeed: string;
}) => {
  if (isWorldPositionBlockedByObstacle(worldPosition, footprintRadius, worldSeed)) {
    return false;
  }

  return ![...entities, ...deterministicRuntimeSupportEntities].some((entity) => {
    const requiredDistance = footprintRadius + entity.footprint.radius;

    return distanceBetweenWorldPoints(worldPosition, entity.worldPosition) < requiredDistance;
  });
};

const maintainLocalHostilePopulation = ({
  entities,
  nextHostileSequence,
  tick,
  worldSeed
}: Pick<EntitySimulationState, "entities" | "nextHostileSequence" | "worldSeed"> & {
  tick: number;
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
      playerEntity,
      sequence: hostileSequence,
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
      !canSpawnHostileAtPosition({
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

export const advanceSimulationState = (
  simulationState: EntitySimulationState,
  command: SimulationCommand = {}
): EntitySimulationState => {
  const worldSeed = command.worldSeed ?? simulationState.worldSeed;
  const nextTick = simulationState.tick + 1;
  const spawnMaintainedState = maintainLocalHostilePopulation({
    entities: simulationState.entities,
    nextHostileSequence: simulationState.nextHostileSequence,
    tick: nextTick,
    worldSeed
  });
  const playerEntity = getPlayerEntity(spawnMaintainedState.entities);
  const movedEntities = spawnMaintainedState.entities.map((entity) =>
    resolveEntityMovement({
      dynamicColliders: spawnMaintainedState.entities.filter(
        (colliderEntity) => colliderEntity.id !== entity.id && isAlive(colliderEntity)
      ),
      entity,
      intent: resolveEntityIntent({
        command,
        entity,
        playerEntity,
        tick: simulationState.tick
      }),
      worldSeed
    })
  );
  const attackResolvedEntities = resolveAutomaticPlayerAttack(movedEntities, nextTick);
  const combatResolvedEntities = resolveHostileContactDamage(
    attackResolvedEntities,
    spawnMaintainedState.entities,
    nextTick
  );
  const survivingEntities = combatResolvedEntities.filter(
    (entity) => entity.role === "player" || isAlive(entity)
  );
  const nextPlayerEntity = getPlayerEntity(survivingEntities);

  return {
    entities: survivingEntities,
    entity: nextPlayerEntity,
    nextHostileSequence: spawnMaintainedState.nextHostileSequence,
    tick: nextTick,
    worldSeed
  };
};
