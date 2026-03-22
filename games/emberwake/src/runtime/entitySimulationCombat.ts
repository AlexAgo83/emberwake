import type { WorldPoint } from "@engine/geometry/primitives";
import { sampleDeterministicSignature } from "@engine/world/worldContract";

import { pickupContract, resolveXpRequiredForLevel } from "./pickupContract";
import { systemTuning } from "@game/config/systemTuning";
import type {
  FloatingDamageNumber,
  RunStats,
  SimulatedEntity
} from "./entitySimulation";

export const entityCombatPresentationContract = systemTuning.runtimePresentation;

const isAlive = (entity: SimulatedEntity) => entity.combat.currentHealth > 0;

const getPlayerEntity = (entities: readonly SimulatedEntity[]) =>
  entities.find((entity) => entity.role === "player") ?? entities[0];

const distanceBetweenWorldPoints = (left: WorldPoint, right: WorldPoint) =>
  Math.hypot(right.x - left.x, right.y - left.y);

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

const applyDamage = (
  entity: SimulatedEntity,
  damage: number,
  tick: number
): SimulatedEntity => ({
  ...entity,
  combat: {
    ...entity.combat,
    currentHealth: Math.max(0, entity.combat.currentHealth - damage)
  },
  damageReactionState: {
    lastDamageAmount: damage,
    lastDamageTick: tick
  }
});

const applyHealing = (entity: SimulatedEntity, healing: number): SimulatedEntity => ({
  ...entity,
  combat: {
    ...entity.combat,
    currentHealth: Math.min(entity.combat.maxHealth, entity.combat.currentHealth + healing)
  }
});

const applyCrystalXpGain = (runStats: RunStats): RunStats => {
  let nextLevel = Math.max(1, runStats.currentLevel);
  let nextXp = Math.max(0, runStats.currentXp) + pickupContract.crystal.xpValue;

  while (nextXp >= resolveXpRequiredForLevel(nextLevel)) {
    nextXp -= resolveXpRequiredForLevel(nextLevel);
    nextLevel += 1;
  }

  return {
    ...runStats,
    crystalsCollected: runStats.crystalsCollected + 1,
    currentLevel: nextLevel,
    currentXp: nextXp
  };
};

const createFloatingDamageNumber = (
  entity: SimulatedEntity,
  damage: number,
  tick: number
): FloatingDamageNumber => {
  const driftSeed = sampleDeterministicSignature(`${entity.id}:damage:${tick}:${damage}`);

  return {
    amount: Math.max(0, Math.round(damage)),
    driftX: ((driftSeed % 13) - 6) * 1.75,
    id: `floating-damage:${entity.id}:${tick}:${damage}:${driftSeed % 17}`,
    sourceEntityId: entity.id,
    spawnedAtTick: tick,
    worldPosition: {
      x: entity.worldPosition.x,
      y: entity.worldPosition.y - entity.footprint.radius - 18
    }
  };
};

export const pruneFloatingDamageNumbers = (
  floatingDamageNumbers: readonly FloatingDamageNumber[],
  tick: number
) =>
  floatingDamageNumbers.filter(
    (floatingDamageNumber) =>
      tick - floatingDamageNumber.spawnedAtTick <
      entityCombatPresentationContract.floatingDamageNumberLifetimeTicks
  );

export const resolveAutomaticPlayerAttack = (
  entities: readonly SimulatedEntity[],
  tick: number
): {
  entities: SimulatedEntity[];
  floatingDamageNumbers: FloatingDamageNumber[];
} => {
  const playerEntity = getPlayerEntity(entities);

  if (!playerEntity || !playerEntity.automaticAttack || !isAlive(playerEntity)) {
    return {
      entities: [...entities],
      floatingDamageNumbers: []
    };
  }

  const { automaticAttack } = playerEntity;

  if (
    automaticAttack.lastAttackTick !== null &&
    tick - automaticAttack.lastAttackTick < automaticAttack.cooldownTicks
  ) {
    return {
      entities: [...entities],
      floatingDamageNumbers: []
    };
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
    return {
      entities: [...entities],
      floatingDamageNumbers: []
    };
  }

  const floatingDamageNumbers: FloatingDamageNumber[] = [];
  const nextEntities = entities.map((entity) => {
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

    const damagedEntity = applyDamage(entity, automaticAttack.damage, tick);

    floatingDamageNumbers.push(
      createFloatingDamageNumber(damagedEntity, automaticAttack.damage, tick)
    );

    return damagedEntity;
  });

  return {
    entities: nextEntities,
    floatingDamageNumbers
  };
};

const isEntityPairOverlapping = (leftEntity: SimulatedEntity, rightEntity: SimulatedEntity) =>
  distanceBetweenWorldPoints(leftEntity.worldPosition, rightEntity.worldPosition) <=
  leftEntity.footprint.radius + rightEntity.footprint.radius + 0.5;

export const resolveHostileContactDamage = (
  entities: readonly SimulatedEntity[],
  previousEntities: readonly SimulatedEntity[],
  tick: number
): {
  entities: SimulatedEntity[];
  floatingDamageNumbers: FloatingDamageNumber[];
} => {
  const playerEntity = getPlayerEntity(entities);
  const previousPlayerEntity = getPlayerEntity(previousEntities);

  if (!playerEntity || !isAlive(playerEntity)) {
    return {
      entities: [...entities],
      floatingDamageNumbers: []
    };
  }

  let nextPlayerEntity = playerEntity;
  const nextEntities = entities.map((entity) => ({ ...entity }));
  const floatingDamageNumbers: FloatingDamageNumber[] = [];

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

    nextPlayerEntity = applyDamage(nextPlayerEntity, contactDamageProfile.damage, tick);
    floatingDamageNumbers.push(
      createFloatingDamageNumber(nextPlayerEntity, contactDamageProfile.damage, tick)
    );
    nextEntities[index] = {
      ...hostileEntity,
      contactDamageProfile: {
        ...contactDamageProfile,
        lastDamageTick: tick
      }
    };
  }

  return {
    entities: nextEntities.map((entity) =>
      entity.id === nextPlayerEntity.id ? nextPlayerEntity : entity
    ),
    floatingDamageNumbers
  };
};

export const resolvePickupCollection = ({
  entities,
  runStats
}: {
  entities: readonly SimulatedEntity[];
  runStats: RunStats;
}) => {
  const playerEntity = getPlayerEntity(entities);

  if (!playerEntity || !isAlive(playerEntity)) {
    return {
      entities: [...entities],
      runStats
    };
  }

  let nextPlayerEntity = playerEntity;
  const nextRunStats = { ...runStats };
  const retainedEntities: SimulatedEntity[] = [];

  for (const entity of entities) {
    if (entity.role !== "pickup" || !entity.pickupProfile) {
      retainedEntities.push(entity);
      continue;
    }

    if (!isEntityPairOverlapping(entity, nextPlayerEntity)) {
      retainedEntities.push(entity);
      continue;
    }

    if (entity.pickupProfile.kind === "healing-kit") {
      nextPlayerEntity = applyHealing(
        nextPlayerEntity,
        Math.ceil(nextPlayerEntity.combat.maxHealth * pickupContract.healingKit.healRatio)
      );
      nextRunStats.healingKitsCollected += 1;
      continue;
    }

    if (entity.pickupProfile.kind === "crystal") {
      Object.assign(nextRunStats, applyCrystalXpGain(nextRunStats));
      continue;
    }

    nextRunStats.goldCollected += pickupContract.gold.value;
  }

  return {
    entities: retainedEntities.map((entity) =>
      entity.id === nextPlayerEntity.id ? nextPlayerEntity : entity
    ),
    runStats: nextRunStats
  };
};
