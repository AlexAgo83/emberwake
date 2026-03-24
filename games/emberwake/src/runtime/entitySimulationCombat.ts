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
  CombatSkillFeedbackEvent,
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

const projectWorldPoint = (
  originWorldPoint: WorldPoint,
  orientationRadians: number,
  distanceWorldUnits: number
) => ({
  x: originWorldPoint.x + Math.cos(orientationRadians) * distanceWorldUnits,
  y: originWorldPoint.y + Math.sin(orientationRadians) * distanceWorldUnits
});

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

const applyCrystalXpGain = (runStats: RunStats, stackCount = 1): RunStats => {
  let nextLevel = Math.max(1, runStats.currentLevel);
  let nextXp = Math.max(0, runStats.currentXp);
  const resolvedStackCount = Math.max(1, stackCount);

  for (let crystalIndex = 0; crystalIndex < resolvedStackCount; crystalIndex += 1) {
    nextXp += pickupContract.crystal.xpValue;

    while (nextXp >= resolveXpRequiredForLevel(nextLevel)) {
      nextXp -= resolveXpRequiredForLevel(nextLevel);
      nextLevel += 1;
    }
  }

  return {
    ...runStats,
    crystalsCollected: runStats.crystalsCollected + resolvedStackCount,
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
  floatingDamageNumbers.filter((floatingDamageNumber) => {
    if (
      !Number.isFinite(tick) ||
      !Number.isFinite(floatingDamageNumber.amount) ||
      !Number.isFinite(floatingDamageNumber.driftX) ||
      !Number.isFinite(floatingDamageNumber.spawnedAtTick) ||
      !Number.isFinite(floatingDamageNumber.worldPosition.x) ||
      !Number.isFinite(floatingDamageNumber.worldPosition.y)
    ) {
      return false;
    }

    const ageTicks = tick - floatingDamageNumber.spawnedAtTick;

    return (
      ageTicks >= 0 &&
      ageTicks < entityCombatPresentationContract.floatingDamageNumberLifetimeTicks
    );
  });

export const resolveAutomaticPlayerAttack = (
  entities: readonly SimulatedEntity[],
  tick: number,
  buildState: BuildState,
  runStats: RunStats
): {
  buildState: BuildState;
  combatSkillFeedbackEvents: CombatSkillFeedbackEvent[];
  entities: SimulatedEntity[];
  floatingDamageNumbers: FloatingDamageNumber[];
  runStats: RunStats;
} => {
  const playerEntity = getPlayerEntity(entities);

  if (!playerEntity || !isAlive(playerEntity)) {
    return {
      buildState,
      combatSkillFeedbackEvents: [],
      entities: [...entities],
      floatingDamageNumbers: [],
      runStats
    };
  }

  let nextBuildState = buildState;
  const nextRunStats: RunStats = {
    ...runStats,
    activeWeaponPerformance: Object.fromEntries(
      Object.entries(runStats.activeWeaponPerformance).map(([weaponId, performance]) => [
        weaponId,
        { ...performance }
      ])
    ) as RunStats["activeWeaponPerformance"]
  };
  let nextEntities = [...entities];
  const combatSkillFeedbackEvents: CombatSkillFeedbackEvent[] = [];
  const floatingDamageNumbers: FloatingDamageNumber[] = [];

  const applyDamageToTargetIds = (
    targetIds: string[],
    damage: number,
    weaponId: keyof RunStats["activeWeaponPerformance"]
  ) => {
    if (targetIds.length === 0) {
      return;
    }

    const targetIdSet = new Set(targetIds);
    let totalDamageDealt = 0;
    let hostileDefeats = 0;

    nextEntities = nextEntities.map((entity) => {
      if (!targetIdSet.has(entity.id)) {
        return entity;
      }

      totalDamageDealt += Math.min(damage, entity.combat.currentHealth);
      const damagedEntity = applyDamage(entity, damage, tick);

      if (entity.combat.currentHealth > 0 && damagedEntity.combat.currentHealth <= 0) {
        hostileDefeats += 1;
      }

      floatingDamageNumbers.push(createFloatingDamageNumber(damagedEntity, damage, tick));
      return damagedEntity;
    });

    nextRunStats.activeWeaponPerformance[weaponId] = {
      ...nextRunStats.activeWeaponPerformance[weaponId],
      hostileDefeats:
        nextRunStats.activeWeaponPerformance[weaponId].hostileDefeats + hostileDefeats,
      totalDamage: nextRunStats.activeWeaponPerformance[weaponId].totalDamage + totalDamageDealt
    };
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
        .slice(0, runtimeStats.targetCount);

    const pickTargetCluster = () => {
      const anchorTarget = currentLivingHostiles.find(
        (hostileEntity) =>
          distanceBetweenWorldPoints(currentPlayerEntity.worldPosition, hostileEntity.worldPosition) <=
          runtimeStats.rangeWorldUnits
      );

      if (!anchorTarget) {
        return {
          anchorTarget: null,
          targets: []
        };
      }

      return {
        anchorTarget,
        targets: currentLivingHostiles
          .filter(
            (hostileEntity) =>
              distanceBetweenWorldPoints(anchorTarget.worldPosition, hostileEntity.worldPosition) <=
              runtimeStats.areaRadiusWorldUnits + hostileEntity.footprint.radius
          )
          .slice(0, runtimeStats.targetCount)
      };
    };

    const clusteredTargets = pickTargetCluster();
    const previewWorldPoint = projectWorldPoint(
      currentPlayerEntity.worldPosition,
      currentPlayerEntity.orientation,
      runtimeStats.attackKind === "lob"
        ? Math.max(84, runtimeStats.rangeWorldUnits * 0.82)
        : Math.max(64, runtimeStats.rangeWorldUnits * 0.7)
    );
    const targetEntities =
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
            : clusteredTargets.targets;

    const canEmitPreviewWithoutTargets =
      runtimeStats.attackKind === "lob" ||
      runtimeStats.attackKind === "orbit" ||
      runtimeStats.attackKind === "zone";

    if (targetEntities.length === 0) {
      if (!canEmitPreviewWithoutTargets) {
        continue;
      }

      nextBuildState = recordActiveWeaponAttack(nextBuildState, activeSlot.weaponId, tick);
      nextRunStats.activeWeaponPerformance[activeSlot.weaponId] = {
        ...nextRunStats.activeWeaponPerformance[activeSlot.weaponId],
        attacksTriggered:
          nextRunStats.activeWeaponPerformance[activeSlot.weaponId].attacksTriggered + 1
      };

      if (runtimeStats.attackKind === "lob") {
        combatSkillFeedbackEvents.push({
          arcRadians: null,
          durationTicks: 14,
          fusionId: runtimeStats.fusionId,
          id: `skill-feedback:${activeSlot.weaponId}:${tick}:travel`,
          kind: "cinder-travel",
          orientationRadians: currentPlayerEntity.orientation,
          originWorldPoint: currentPlayerEntity.worldPosition,
          radiusWorldUnits: runtimeStats.areaRadiusWorldUnits,
          sourceEntityId: currentPlayerEntity.id,
          spawnedAtTick: tick,
          targetWorldPoints: [previewWorldPoint],
          weaponId: activeSlot.weaponId
        });
      }

      combatSkillFeedbackEvents.push({
        arcRadians: runtimeStats.arcRadians,
        durationTicks:
          runtimeStats.attackKind === "zone"
            ? 34
            : runtimeStats.attackKind === "orbit"
              ? 28
              : 18,
        fusionId: runtimeStats.fusionId,
        id: `skill-feedback:${activeSlot.weaponId}:${tick}:${combatSkillFeedbackEvents.length}`,
        kind:
          runtimeStats.attackKind === "orbit"
            ? "orbit-pulse"
            : runtimeStats.attackKind === "zone"
              ? "zone-seal"
              : "cinder-burst",
        orientationRadians:
          runtimeStats.attackKind === "zone" ? currentPlayerEntity.orientation : null,
        originWorldPoint:
          runtimeStats.attackKind === "orbit"
            ? currentPlayerEntity.worldPosition
            : previewWorldPoint,
        radiusWorldUnits: runtimeStats.areaRadiusWorldUnits,
        sourceEntityId: currentPlayerEntity.id,
        spawnedAtTick: tick,
        targetWorldPoints:
          runtimeStats.attackKind === "orbit" ? [] : [previewWorldPoint],
        weaponId: activeSlot.weaponId
      });

      continue;
    }

    const targetIds = targetEntities.map((entity) => entity.id);
    nextBuildState = recordActiveWeaponAttack(nextBuildState, activeSlot.weaponId, tick);
    nextRunStats.activeWeaponPerformance[activeSlot.weaponId] = {
      ...nextRunStats.activeWeaponPerformance[activeSlot.weaponId],
      attacksTriggered:
        nextRunStats.activeWeaponPerformance[activeSlot.weaponId].attacksTriggered + 1
    };
    applyDamageToTargetIds(targetIds, runtimeStats.damage, activeSlot.weaponId);

    if (runtimeStats.attackKind === "lob") {
      combatSkillFeedbackEvents.push({
        arcRadians: null,
        durationTicks: 14,
        fusionId: runtimeStats.fusionId,
        id: `skill-feedback:${activeSlot.weaponId}:${tick}:travel`,
        kind: "cinder-travel",
        orientationRadians: currentPlayerEntity.orientation,
        originWorldPoint: currentPlayerEntity.worldPosition,
        radiusWorldUnits: runtimeStats.areaRadiusWorldUnits,
        sourceEntityId: currentPlayerEntity.id,
        spawnedAtTick: tick,
        targetWorldPoints: [clusteredTargets.anchorTarget?.worldPosition ?? targetEntities[0]!.worldPosition],
        weaponId: activeSlot.weaponId
      });
    }

    combatSkillFeedbackEvents.push({
      arcRadians: runtimeStats.arcRadians,
      durationTicks:
        runtimeStats.attackKind === "zone"
          ? 34
          : runtimeStats.attackKind === "orbit"
            ? 28
            : runtimeStats.attackKind === "lob"
              ? 18
              : 12,
      fusionId: runtimeStats.fusionId,
      id: `skill-feedback:${activeSlot.weaponId}:${tick}:${combatSkillFeedbackEvents.length}`,
      kind:
        runtimeStats.attackKind === "cone"
          ? "slash-ribbon"
          : runtimeStats.attackKind === "fan"
            ? "kunai-fan"
            : runtimeStats.attackKind === "auto-target"
              ? "needle-trace"
              : runtimeStats.attackKind === "orbit"
                ? "orbit-pulse"
                : runtimeStats.attackKind === "zone"
                  ? "zone-seal"
                  : "cinder-burst",
      orientationRadians:
        runtimeStats.attackKind === "cone" ||
        runtimeStats.attackKind === "fan" ||
        runtimeStats.attackKind === "zone"
          ? currentPlayerEntity.orientation
          : null,
      originWorldPoint:
        runtimeStats.attackKind === "lob" || runtimeStats.attackKind === "zone"
          ? clusteredTargets.anchorTarget?.worldPosition ?? targetEntities[0]!.worldPosition
          : currentPlayerEntity.worldPosition,
      radiusWorldUnits:
        runtimeStats.attackKind === "orbit" ||
        runtimeStats.attackKind === "lob" ||
        runtimeStats.attackKind === "zone"
          ? runtimeStats.areaRadiusWorldUnits
          : runtimeStats.attackKind === "cone" || runtimeStats.attackKind === "fan"
            ? runtimeStats.rangeWorldUnits
            : null,
      sourceEntityId: currentPlayerEntity.id,
      spawnedAtTick: tick,
      targetWorldPoints: targetEntities.map((targetEntity) => targetEntity.worldPosition),
      weaponId: activeSlot.weaponId
    });
  }

  return {
    buildState: nextBuildState,
    combatSkillFeedbackEvents,
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
    floatingDamageNumbers,
    runStats: nextRunStats
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

    const pickupStackCount = Math.max(1, entity.pickupProfile.stackCount ?? 1);

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
        Object.assign(nextRunStats, applyCrystalXpGain(nextRunStats, pickupStackCount));
        break;
      case "cache":
        nextBuildState = resolveChestReward(nextBuildState, nextRunStats.hostileDefeats);
        break;
      case "gold":
        nextRunStats.goldCollected += pickupContract.gold.value * pickupStackCount;
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
