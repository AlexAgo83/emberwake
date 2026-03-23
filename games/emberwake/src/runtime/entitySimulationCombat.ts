import type { WorldPoint } from "@engine/geometry/primitives";
import { sampleDeterministicSignature } from "@engine/world/worldContract";

import { pickupContract, resolveXpRequiredForLevel } from "./pickupContract";
import {
  recordActiveWeaponAttack,
  resolveActiveWeaponRuntimeStats,
  resolveChestReward,
  resolvePickupRadiusMultiplier,
  type BuildState
} from "./buildSystem";
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

const isHostileTarget = (entity: SimulatedEntity) => entity.role === "hostile" && isAlive(entity);

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
  tick: number,
  buildState: BuildState
): {
  buildState: BuildState;
  entities: SimulatedEntity[];
  floatingDamageNumbers: FloatingDamageNumber[];
} => {
  const playerEntity = getPlayerEntity(entities);

  if (!playerEntity || !isAlive(playerEntity)) {
    return {
      buildState,
      entities: [...entities],
      floatingDamageNumbers: []
    };
  }

  const livingHostiles = entities
    .filter(isHostileTarget)
    .sort(
      (leftEntity, rightEntity) =>
        distanceBetweenWorldPoints(playerEntity.worldPosition, leftEntity.worldPosition) -
        distanceBetweenWorldPoints(playerEntity.worldPosition, rightEntity.worldPosition)
    );

  if (livingHostiles.length === 0) {
    return {
      buildState,
      entities: [...entities],
      floatingDamageNumbers: []
    };
  }

  let nextBuildState = buildState;
  let nextEntities = [...entities];
  const floatingDamageNumbers: FloatingDamageNumber[] = [];

  const applyDamageToTargetIds = (targetIds: string[], damage: number) => {
    if (targetIds.length === 0) {
      return;
    }

    const targetIdSet = new Set(targetIds);
    nextEntities = nextEntities.map((entity) => {
      if (!targetIdSet.has(entity.id)) {
        return entity;
      }

      const damagedEntity = applyDamage(entity, damage, tick);
      floatingDamageNumbers.push(createFloatingDamageNumber(damagedEntity, damage, tick));
      return damagedEntity;
    });
  };

  for (const activeSlot of buildState.activeSlots) {
    const runtimeStats = resolveActiveWeaponRuntimeStats(nextBuildState, activeSlot);

    if (
      activeSlot.lastAttackTick !== null &&
      tick - activeSlot.lastAttackTick < runtimeStats.cooldownTicks
    ) {
      continue;
    }

    const currentPlayerEntity = getPlayerEntity(nextEntities);
    const currentLivingHostiles = nextEntities
      .filter(isHostileTarget)
      .sort(
        (leftEntity, rightEntity) =>
          distanceBetweenWorldPoints(currentPlayerEntity.worldPosition, leftEntity.worldPosition) -
          distanceBetweenWorldPoints(currentPlayerEntity.worldPosition, rightEntity.worldPosition)
      );

    if (currentLivingHostiles.length === 0) {
      break;
    }

    const pickConeTargets = () =>
      currentLivingHostiles
        .filter((hostileEntity) => {
          const distanceToHostile = distanceBetweenWorldPoints(
            currentPlayerEntity.worldPosition,
            hostileEntity.worldPosition
          );

          if (distanceToHostile > runtimeStats.rangeWorldUnits + hostileEntity.footprint.radius) {
            return false;
          }

          const deltaX = hostileEntity.worldPosition.x - currentPlayerEntity.worldPosition.x;
          const deltaY = hostileEntity.worldPosition.y - currentPlayerEntity.worldPosition.y;
          const angleToHostile = Math.atan2(deltaY, deltaX);

          return (
            runtimeStats.arcRadians !== null &&
            Math.abs(normalizeAngleDelta(angleToHostile - currentPlayerEntity.orientation)) <=
              runtimeStats.arcRadians / 2
          );
        })
        .slice(0, runtimeStats.targetCount)
        .map((entity) => entity.id);

    const pickTargetCluster = () => {
      const anchorTarget = currentLivingHostiles.find(
        (hostileEntity) =>
          distanceBetweenWorldPoints(currentPlayerEntity.worldPosition, hostileEntity.worldPosition) <=
          runtimeStats.rangeWorldUnits
      );

      if (!anchorTarget) {
        return [];
      }

      return currentLivingHostiles
        .filter(
          (hostileEntity) =>
            distanceBetweenWorldPoints(anchorTarget.worldPosition, hostileEntity.worldPosition) <=
            runtimeStats.areaRadiusWorldUnits + hostileEntity.footprint.radius
        )
        .slice(0, runtimeStats.targetCount)
        .map((entity) => entity.id);
    };

    const targetIds =
      runtimeStats.attackKind === "cone" || runtimeStats.attackKind === "fan"
        ? pickConeTargets()
        : runtimeStats.attackKind === "auto-target"
          ? currentLivingHostiles
              .filter(
                (hostileEntity) =>
                  distanceBetweenWorldPoints(
                    currentPlayerEntity.worldPosition,
                    hostileEntity.worldPosition
                  ) <= runtimeStats.rangeWorldUnits
              )
              .slice(0, runtimeStats.targetCount)
              .map((entity) => entity.id)
          : runtimeStats.attackKind === "orbit"
            ? currentLivingHostiles
                .filter(
                  (hostileEntity) =>
                    distanceBetweenWorldPoints(
                      currentPlayerEntity.worldPosition,
                      hostileEntity.worldPosition
                    ) <= runtimeStats.areaRadiusWorldUnits + hostileEntity.footprint.radius
                )
                .slice(0, runtimeStats.targetCount)
                .map((entity) => entity.id)
            : pickTargetCluster();

    if (targetIds.length === 0) {
      continue;
    }

    nextBuildState = recordActiveWeaponAttack(nextBuildState, activeSlot.weaponId, tick);
    applyDamageToTargetIds(targetIds, runtimeStats.damage);
  }

  return {
    buildState: nextBuildState,
    entities: nextEntities.map((entity) => {
      if (entity.id !== playerEntity.id) {
        return entity;
      }

      return {
        ...entity,
        automaticAttack: {
          ...entity.automaticAttack!,
          damage: resolveActiveWeaponRuntimeStats(
            nextBuildState,
            nextBuildState.activeSlots.find((activeSlot) => activeSlot.weaponId === "ash-lash") ??
              nextBuildState.activeSlots[0]!
          ).damage,
          lastAttackTick:
            nextBuildState.activeSlots.find((activeSlot) => activeSlot.weaponId === "ash-lash")
              ?.lastAttackTick ?? entity.automaticAttack?.lastAttackTick ?? null
        }
      };
    }),
    floatingDamageNumbers
  };
};

const isEntityPairOverlapping = (leftEntity: SimulatedEntity, rightEntity: SimulatedEntity) =>
  distanceBetweenWorldPoints(leftEntity.worldPosition, rightEntity.worldPosition) <=
  leftEntity.footprint.radius + rightEntity.footprint.radius + 0.5;

export const resolveHostileContactDamage = (
  entities: readonly SimulatedEntity[],
  previousEntities: readonly SimulatedEntity[],
  tick: number,
  playerInvincible = false
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

  if (playerInvincible) {
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
  buildState,
  entities,
  runStats
}: {
  buildState: BuildState;
  entities: readonly SimulatedEntity[];
  runStats: RunStats;
}) => {
  const playerEntity = getPlayerEntity(entities);

  if (!playerEntity || !isAlive(playerEntity)) {
    return {
      buildState,
      entities: [...entities],
      runStats
    };
  }

  let nextPlayerEntity = playerEntity;
  let nextBuildState = buildState;
  const nextRunStats = { ...runStats };
  const retainedEntities: SimulatedEntity[] = [];
  const pickupRadiusWorldUnits =
    pickupContract.pickup.pickupRadiusWorldUnits * resolvePickupRadiusMultiplier(buildState);

  for (const entity of entities) {
    if (entity.role !== "pickup" || !entity.pickupProfile) {
      retainedEntities.push(entity);
      continue;
    }

    if (
      distanceBetweenWorldPoints(entity.worldPosition, nextPlayerEntity.worldPosition) >
      pickupRadiusWorldUnits + nextPlayerEntity.footprint.radius
    ) {
      retainedEntities.push(entity);
      continue;
    }

    switch (entity.pickupProfile.kind) {
      case "healing-kit":
        nextPlayerEntity = applyHealing(
          nextPlayerEntity,
          Math.ceil(nextPlayerEntity.combat.maxHealth * pickupContract.healingKit.healRatio)
        );
        nextRunStats.healingKitsCollected += 1;
        break;
      case "crystal":
        Object.assign(nextRunStats, applyCrystalXpGain(nextRunStats));
        break;
      case "cache":
        nextBuildState = resolveChestReward(nextBuildState, nextRunStats.hostileDefeats);
        break;
      case "gold":
        nextRunStats.goldCollected += pickupContract.gold.value;
        break;
    }
  }

  return {
    buildState: nextBuildState,
    entities: retainedEntities.map((entity) =>
      entity.id === nextPlayerEntity.id ? nextPlayerEntity : entity
    ),
    runStats: nextRunStats
  };
};
