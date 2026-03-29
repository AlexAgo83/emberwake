import type { WorldPoint } from "@engine/geometry/primitives";
import { sampleDeterministicSignature } from "@engine/world/worldContract";

import { pickupContract, resolveXpRequiredForLevel } from "./pickupContract";
import {
  recordActiveWeaponAttack,
  resolveBossDamageMultiplier,
  resolveEmergencyAegisChargeCount,
  resolveExecuteThresholdRatio,
  resolveGoldGainMultiplier,
  resolveActiveWeaponRuntimeStats,
  resolvePickupRadiusMultiplier,
  resolveRetaliationDamage,
  resolveXpGainMultiplier,
  type BuildState
} from "./buildSystem";
import { systemTuning } from "@game/config/systemTuning";
import { getHostileSpawnProfile } from "./hostilePressure";
import { resolveCrystalLootArchiveId } from "@shared/model/crystalPickups";
import type { LootArchiveId } from "@shared/model/lootArchive";
import type {
  CombatSkillFeedbackEvent,
  FloatingDamageNumber,
  PickupAttractionSource,
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
const fixedStepSeconds = 1 / 60;

const appendDiscoveredLootId = (runStats: RunStats, lootArchiveId: LootArchiveId) => {
  if (runStats.discoveredLootIds.includes(lootArchiveId)) {
    return runStats;
  }

  return {
    ...runStats,
    discoveredLootIds: [...runStats.discoveredLootIds, lootArchiveId]
  };
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

const applyCrystalXpGain = (
  runStats: RunStats,
  stackCount = 1,
  xpGainMultiplier = 1
): RunStats => {
  let nextLevel = Math.max(1, runStats.currentLevel);
  let nextXp = Math.max(0, runStats.currentXp);
  const resolvedStackCount = Math.max(1, stackCount);
  const xpPerCrystal = Math.max(
    1,
    Math.round(pickupContract.crystal.xpValue * xpGainMultiplier)
  );

  for (let crystalIndex = 0; crystalIndex < resolvedStackCount; crystalIndex += 1) {
    nextXp += xpPerCrystal;

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

const moveWorldPointTowardTarget = (
  sourceWorldPoint: WorldPoint,
  targetWorldPoint: WorldPoint,
  maxDistance: number
) => {
  const deltaX = targetWorldPoint.x - sourceWorldPoint.x;
  const deltaY = targetWorldPoint.y - sourceWorldPoint.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance === 0 || distance <= maxDistance) {
    return { ...targetWorldPoint };
  }

  return {
    x: sourceWorldPoint.x + (deltaX / distance) * maxDistance,
    y: sourceWorldPoint.y + (deltaY / distance) * maxDistance
  };
};

const distanceBetweenSegmentAndPoint = (
  segmentStart: WorldPoint,
  segmentEnd: WorldPoint,
  point: WorldPoint
) => {
  const segmentDeltaX = segmentEnd.x - segmentStart.x;
  const segmentDeltaY = segmentEnd.y - segmentStart.y;
  const segmentLengthSquared =
    segmentDeltaX * segmentDeltaX + segmentDeltaY * segmentDeltaY;

  if (segmentLengthSquared === 0) {
    return distanceBetweenWorldPoints(segmentStart, point);
  }

  const projectedRatio = Math.max(
    0,
    Math.min(
      1,
      ((point.x - segmentStart.x) * segmentDeltaX +
        (point.y - segmentStart.y) * segmentDeltaY) /
        segmentLengthSquared
    )
  );
  const nearestPoint = {
    x: segmentStart.x + segmentDeltaX * projectedRatio,
    y: segmentStart.y + segmentDeltaY * projectedRatio
  };

  return distanceBetweenWorldPoints(nearestPoint, point);
};

const createFloatingDamageNumber = (
  entity: SimulatedEntity,
  damage: number,
  tick: number
): FloatingDamageNumber => {
  const driftSeed = sampleDeterministicSignature(`${entity.id}:damage:${tick}:${damage}`);
  const worldPositionX = Math.round(entity.worldPosition.x);
  const worldPositionY = Math.round(entity.worldPosition.y);

  return {
    amount: Math.max(0, Math.round(damage)),
    driftX: ((driftSeed % 13) - 6) * 1.75,
    id: `floating-damage:${entity.id}:${tick}:${damage}:${entity.combat.currentHealth}:${worldPositionX}:${worldPositionY}:${driftSeed}`,
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
  runStats: RunStats,
  currentPickupPulseUntilTick = 0
): {
  buildState: BuildState;
  combatSkillFeedbackEvents: CombatSkillFeedbackEvent[];
  entities: SimulatedEntity[];
  floatingDamageNumbers: FloatingDamageNumber[];
  pickupPulseUntilTick: number;
  runStats: RunStats;
} => {
  const playerEntity = getPlayerEntity(entities);

  if (!playerEntity || !isAlive(playerEntity)) {
    return {
      buildState,
      combatSkillFeedbackEvents: [],
      entities: [...entities],
      floatingDamageNumbers: [],
      pickupPulseUntilTick: currentPickupPulseUntilTick,
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
  let nextPickupPulseUntilTick = currentPickupPulseUntilTick;
  const bossDamageMultiplier = resolveBossDamageMultiplier(buildState);
  const executeThresholdRatio = resolveExecuteThresholdRatio(buildState);

  const applyDamageToTargetIds = (
    targetIds: string[],
    damage: number,
    weaponId: keyof RunStats["activeWeaponPerformance"],
    options?: {
      freezeDurationTicks?: number;
      pickupPulseDurationTicks?: number;
    }
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

      const hostileProfile =
        entity.role === "hostile" && entity.hostileProfileId
          ? getHostileSpawnProfile(entity.hostileProfileId)
          : null;
      const executeDamage =
        executeThresholdRatio > 0 &&
        entity.combat.maxHealth > 0 &&
        entity.combat.currentHealth / entity.combat.maxHealth <= executeThresholdRatio
          ? entity.combat.currentHealth
          : 0;
      const resolvedDamage = Math.max(
        damage,
        executeDamage,
        hostileProfile?.isMiniBoss ? Math.round(damage * bossDamageMultiplier) : damage
      );

      totalDamageDealt += Math.min(resolvedDamage, entity.combat.currentHealth);
      const damagedEntity = applyDamage(entity, resolvedDamage, tick);

      if (entity.combat.currentHealth > 0 && damagedEntity.combat.currentHealth <= 0) {
        hostileDefeats += 1;
      }

      floatingDamageNumbers.push(createFloatingDamageNumber(damagedEntity, resolvedDamage, tick));

      if (options?.freezeDurationTicks && entity.role === "hostile") {
        return {
          ...damagedEntity,
          hostileControlState: {
            frozenUntilTick: Math.max(
              damagedEntity.hostileControlState?.frozenUntilTick ?? 0,
              tick + options.freezeDurationTicks
            )
          }
        };
      }

      return damagedEntity;
    });

    nextRunStats.activeWeaponPerformance[weaponId] = {
      ...nextRunStats.activeWeaponPerformance[weaponId],
      hostileDefeats:
        nextRunStats.activeWeaponPerformance[weaponId].hostileDefeats + hostileDefeats,
      totalDamage: nextRunStats.activeWeaponPerformance[weaponId].totalDamage + totalDamageDealt
    };

    if (options?.pickupPulseDurationTicks) {
      nextPickupPulseUntilTick = Math.max(
        nextPickupPulseUntilTick,
        tick + options.pickupPulseDurationTicks
      );
    }
  };

  const resolveFeedbackKind = (
    attackKind: ReturnType<typeof resolveActiveWeaponRuntimeStats>["attackKind"]
  ): CombatSkillFeedbackEvent["kind"] =>
    attackKind === "cone"
      ? "slash-ribbon"
      : attackKind === "fan"
        ? "kunai-fan"
        : attackKind === "auto-target"
          ? "needle-trace"
          : attackKind === "orbit"
            ? "orbit-pulse"
            : attackKind === "zone"
              ? "zone-seal"
              : attackKind === "chain"
                ? "chain-arc"
                : attackKind === "boomerang"
                  ? "boomerang-arc"
                  : attackKind === "trail"
                    ? "trail-burn"
                    : attackKind === "nova"
                      ? "halo-burst"
                      : attackKind === "vacuum"
                        ? "vacuum-pulse"
                        : "cinder-burst";

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

    const pickNovaTargets = () =>
      currentLivingHostiles
        .filter(
          (hostileEntity) =>
            distanceBetweenWorldPoints(
              currentPlayerEntity.worldPosition,
              hostileEntity.worldPosition
            ) <= runtimeStats.areaRadiusWorldUnits + hostileEntity.footprint.radius
        )
        .slice(0, runtimeStats.targetCount);

    const pickChainTargets = () => {
      const chainedTargets: SimulatedEntity[] = [];
      let lastAnchor =
        currentLivingHostiles.find(
          (hostileEntity) =>
            distanceBetweenWorldPoints(
              currentPlayerEntity.worldPosition,
              hostileEntity.worldPosition
            ) <= runtimeStats.rangeWorldUnits
        ) ?? null;

      while (lastAnchor && chainedTargets.length < runtimeStats.targetCount) {
        chainedTargets.push(lastAnchor);
        const anchorWorldPoint = lastAnchor.worldPosition;
        lastAnchor =
          currentLivingHostiles
            .filter(
              (hostileEntity) =>
                !chainedTargets.some((targetEntity) => targetEntity.id === hostileEntity.id) &&
                distanceBetweenWorldPoints(anchorWorldPoint, hostileEntity.worldPosition) <=
                  runtimeStats.areaRadiusWorldUnits + hostileEntity.footprint.radius
            )
            .sort(
              (leftEntity, rightEntity) =>
                distanceBetweenWorldPoints(anchorWorldPoint, leftEntity.worldPosition) -
                distanceBetweenWorldPoints(anchorWorldPoint, rightEntity.worldPosition)
            )[0] ?? null;
      }

      return chainedTargets;
    };

    const pickBoomerangTargets = () => {
      const boomerangEndPoint = projectWorldPoint(
        currentPlayerEntity.worldPosition,
        currentPlayerEntity.orientation,
        runtimeStats.rangeWorldUnits
      );

      return currentLivingHostiles
        .filter(
          (hostileEntity) =>
            distanceBetweenSegmentAndPoint(
              currentPlayerEntity.worldPosition,
              boomerangEndPoint,
              hostileEntity.worldPosition
            ) <= runtimeStats.areaRadiusWorldUnits + hostileEntity.footprint.radius
        )
        .sort(
          (leftEntity, rightEntity) =>
            distanceBetweenWorldPoints(currentPlayerEntity.worldPosition, leftEntity.worldPosition) -
            distanceBetweenWorldPoints(currentPlayerEntity.worldPosition, rightEntity.worldPosition)
        )
        .slice(0, runtimeStats.targetCount);
    };

    const pickTrailTargets = () => {
      const trailEndPoint = projectWorldPoint(
        currentPlayerEntity.worldPosition,
        currentPlayerEntity.orientation + Math.PI,
        runtimeStats.rangeWorldUnits
      );

      return currentLivingHostiles
        .filter(
          (hostileEntity) =>
            distanceBetweenSegmentAndPoint(
              currentPlayerEntity.worldPosition,
              trailEndPoint,
              hostileEntity.worldPosition
            ) <= runtimeStats.areaRadiusWorldUnits + hostileEntity.footprint.radius
        )
        .slice(0, runtimeStats.targetCount);
    };

    const clusteredTargets = pickTargetCluster();
    const previewWorldPoint = projectWorldPoint(
      currentPlayerEntity.worldPosition,
      runtimeStats.attackKind === "trail"
        ? currentPlayerEntity.orientation + Math.PI
        : currentPlayerEntity.orientation,
      runtimeStats.attackKind === "lob"
        ? Math.max(84, runtimeStats.rangeWorldUnits * 0.82)
        : runtimeStats.attackKind === "trail"
          ? runtimeStats.rangeWorldUnits
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
          : runtimeStats.attackKind === "chain"
            ? pickChainTargets()
            : runtimeStats.attackKind === "boomerang"
              ? pickBoomerangTargets()
              : runtimeStats.attackKind === "trail"
                ? pickTrailTargets()
                : runtimeStats.attackKind === "nova" || runtimeStats.attackKind === "vacuum"
                  ? pickNovaTargets()
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
      runtimeStats.attackKind === "zone" ||
      runtimeStats.attackKind === "trail" ||
      runtimeStats.attackKind === "nova" ||
      runtimeStats.attackKind === "vacuum";

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

      if (runtimeStats.attackKind === "vacuum") {
        nextPickupPulseUntilTick = Math.max(
          nextPickupPulseUntilTick,
          tick +
            runtimeStats.visibleTicks *
              (activeSlot.fusionId === "event-horizon" ? 2 : 1)
        );
      }

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
              : runtimeStats.attackKind === "trail"
                ? 20
                : runtimeStats.attackKind === "nova" || runtimeStats.attackKind === "vacuum"
                  ? 18
              : 18,
        fusionId: runtimeStats.fusionId,
        id: `skill-feedback:${activeSlot.weaponId}:${tick}:${combatSkillFeedbackEvents.length}`,
        kind: resolveFeedbackKind(runtimeStats.attackKind),
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
    applyDamageToTargetIds(targetIds, runtimeStats.damage, activeSlot.weaponId, {
      freezeDurationTicks:
        activeSlot.weaponId === "frost-nova"
          ? Math.max(18, runtimeStats.visibleTicks)
          : activeSlot.fusionId === "event-horizon"
            ? Math.max(36, runtimeStats.visibleTicks * 2)
            : undefined,
      pickupPulseDurationTicks:
        runtimeStats.attackKind === "vacuum"
          ? runtimeStats.visibleTicks *
            (activeSlot.fusionId === "event-horizon" ? 2 : 1)
          : undefined
    });

    if (activeSlot.fusionId === "afterimage-pyre") {
      applyDamageToTargetIds(
        targetIds,
        Math.max(1, Math.round(runtimeStats.damage * 0.45)),
        activeSlot.weaponId
      );
    }

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
              : runtimeStats.attackKind === "trail"
                ? 20
                : runtimeStats.attackKind === "nova" || runtimeStats.attackKind === "vacuum"
                  ? 18
              : 12,
      fusionId: runtimeStats.fusionId,
      id: `skill-feedback:${activeSlot.weaponId}:${tick}:${combatSkillFeedbackEvents.length}`,
      kind: resolveFeedbackKind(runtimeStats.attackKind),
      orientationRadians:
        runtimeStats.attackKind === "cone" ||
        runtimeStats.attackKind === "fan" ||
        runtimeStats.attackKind === "zone"
          ? currentPlayerEntity.orientation
          : null,
      originWorldPoint:
        runtimeStats.attackKind === "lob" || runtimeStats.attackKind === "zone"
          ? clusteredTargets.anchorTarget?.worldPosition ?? targetEntities[0]!.worldPosition
          : runtimeStats.attackKind === "nova" || runtimeStats.attackKind === "vacuum"
            ? currentPlayerEntity.worldPosition
          : currentPlayerEntity.worldPosition,
      radiusWorldUnits:
        runtimeStats.attackKind === "orbit" ||
        runtimeStats.attackKind === "lob" ||
        runtimeStats.attackKind === "zone" ||
        runtimeStats.attackKind === "trail" ||
        runtimeStats.attackKind === "nova" ||
        runtimeStats.attackKind === "vacuum" ||
        runtimeStats.attackKind === "boomerang" ||
        runtimeStats.attackKind === "chain"
          ? runtimeStats.areaRadiusWorldUnits
          : runtimeStats.attackKind === "cone" || runtimeStats.attackKind === "fan"
            ? runtimeStats.rangeWorldUnits
            : null,
      sourceEntityId: currentPlayerEntity.id,
      spawnedAtTick: tick,
      targetWorldPoints:
        runtimeStats.attackKind === "trail"
          ? [previewWorldPoint, ...targetEntities.map((targetEntity) => targetEntity.worldPosition)]
          : targetEntities.map((targetEntity) => targetEntity.worldPosition),
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
    pickupPulseUntilTick: nextPickupPulseUntilTick,
    runStats: nextRunStats
  };
};

const isEntityPairOverlapping = (leftEntity: SimulatedEntity, rightEntity: SimulatedEntity) =>
  distanceBetweenWorldPoints(leftEntity.worldPosition, rightEntity.worldPosition) <=
  leftEntity.footprint.radius + rightEntity.footprint.radius + 0.5;

export const resolveHostileContactDamage = (
  {
    buildState,
    currentEmergencyAegisChargesSpent = 0,
    enemyDamageSuppressed = false,
    entities,
    previousEntities,
    tick,
    playerInvincible = false
  }: {
    buildState: BuildState;
    currentEmergencyAegisChargesSpent?: number;
    enemyDamageSuppressed?: boolean;
    entities: readonly SimulatedEntity[];
    previousEntities: readonly SimulatedEntity[];
    tick: number;
    playerInvincible?: boolean;
  }
): {
  combatSkillFeedbackEvents: CombatSkillFeedbackEvent[];
  emergencyAegisChargesSpent: number;
  entities: SimulatedEntity[];
  floatingDamageNumbers: FloatingDamageNumber[];
} => {
  const playerEntity = getPlayerEntity(entities);
  const previousPlayerEntity = getPlayerEntity(previousEntities);

  if (!playerEntity || !isAlive(playerEntity)) {
    return {
      combatSkillFeedbackEvents: [],
      emergencyAegisChargesSpent: currentEmergencyAegisChargesSpent,
      entities: [...entities],
      floatingDamageNumbers: []
    };
  }

  if (playerInvincible || enemyDamageSuppressed) {
    return {
      combatSkillFeedbackEvents: [],
      emergencyAegisChargesSpent: currentEmergencyAegisChargesSpent,
      entities: [...entities],
      floatingDamageNumbers: []
    };
  }

  let nextPlayerEntity = playerEntity;
  const nextEntities = entities.map((entity) => ({ ...entity }));
  const combatSkillFeedbackEvents: CombatSkillFeedbackEvent[] = [];
  const floatingDamageNumbers: FloatingDamageNumber[] = [];
  const retaliationDamage = resolveRetaliationDamage(buildState);
  const emergencyAegisChargeCount = resolveEmergencyAegisChargeCount(buildState);
  let nextEmergencyAegisChargesSpent = currentEmergencyAegisChargesSpent;

  for (let index = 0; index < nextEntities.length; index += 1) {
    const hostileEntity = nextEntities[index];

    if (
      hostileEntity.role !== "hostile" ||
      !hostileEntity.contactDamageProfile ||
      !isAlive(hostileEntity) ||
      (hostileEntity.hostileControlState?.frozenUntilTick ?? 0) > tick ||
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
    const distanceToPlayer = distanceBetweenWorldPoints(
      hostileEntity.worldPosition,
      nextPlayerEntity.worldPosition
    );

    if (
      contactDamageProfile.lastDamageTick !== null &&
      tick - contactDamageProfile.lastDamageTick < contactDamageProfile.cooldownTicks
    ) {
      continue;
    }

    if (hostileEntity.hostileProfileId === "watchglass" && distanceToPlayer <= 220) {
      const laserDamage = Math.max(1, Math.round(contactDamageProfile.damage * 0.38));

      nextPlayerEntity = applyDamage(nextPlayerEntity, laserDamage, tick);
      floatingDamageNumbers.push(
        createFloatingDamageNumber(nextPlayerEntity, laserDamage, tick)
      );
      nextEntities[index] = {
        ...hostileEntity,
        contactDamageProfile: {
          ...contactDamageProfile,
          lastDamageTick: tick
        }
      };
      combatSkillFeedbackEvents.push({
        arcRadians: null,
        durationTicks: 14,
        fusionId: null,
        id: `hostile-skill-feedback:watchglass:${hostileEntity.id}:${tick}`,
        kind: "watchglass-laser",
        orientationRadians: Math.atan2(
          nextPlayerEntity.worldPosition.y - hostileEntity.worldPosition.y,
          nextPlayerEntity.worldPosition.x - hostileEntity.worldPosition.x
        ),
        originWorldPoint: hostileEntity.worldPosition,
        radiusWorldUnits: distanceToPlayer,
        sourceEntityId: hostileEntity.id,
        spawnedAtTick: tick,
        targetWorldPoints: [nextPlayerEntity.worldPosition],
        weaponId: "guided-senbon"
      });
      continue;
    }

    nextPlayerEntity = applyDamage(nextPlayerEntity, contactDamageProfile.damage, tick);
    floatingDamageNumbers.push(
      createFloatingDamageNumber(nextPlayerEntity, contactDamageProfile.damage, tick)
    );
    let nextHostileEntity: SimulatedEntity = {
      ...hostileEntity,
      contactDamageProfile: {
        ...contactDamageProfile,
        lastDamageTick: tick
      }
    };

    if (retaliationDamage > 0) {
      nextHostileEntity = applyDamage(nextHostileEntity, retaliationDamage, tick);
      floatingDamageNumbers.push(
        createFloatingDamageNumber(nextHostileEntity, retaliationDamage, tick)
      );
    }

    if (
      nextPlayerEntity.combat.currentHealth <= 0 &&
      nextEmergencyAegisChargesSpent < emergencyAegisChargeCount
    ) {
      nextEmergencyAegisChargesSpent += 1;
      nextPlayerEntity = {
        ...nextPlayerEntity,
        combat: {
          ...nextPlayerEntity.combat,
          currentHealth: Math.max(
            1,
            Math.ceil(nextPlayerEntity.combat.maxHealth * 0.34)
          )
        }
      };
    }

    nextEntities[index] = nextHostileEntity;
  }

  return {
    combatSkillFeedbackEvents,
    emergencyAegisChargesSpent: nextEmergencyAegisChargesSpent,
    entities: nextEntities.map((entity) =>
      entity.id === nextPlayerEntity.id ? nextPlayerEntity : entity
    ),
    floatingDamageNumbers
  };
};

export const resolvePickupCollection = ({
  buildState,
  enemyTimeStopUntilTick,
  entities,
  pickupPulseUntilTick,
  tick,
  runStats
}: {
  buildState: BuildState;
  enemyTimeStopUntilTick: number;
  entities: readonly SimulatedEntity[];
  pickupPulseUntilTick: number;
  tick: number;
  runStats: RunStats;
}) => {
  const playerEntity = getPlayerEntity(entities);

  if (!playerEntity || !isAlive(playerEntity)) {
    return {
      buildState,
      enemyTimeStopUntilTick,
      entities: [...entities],
      pickupPulseUntilTick,
      runStats
    };
  }

  let nextPlayerEntity = playerEntity;
  let nextEnemyTimeStopUntilTick = enemyTimeStopUntilTick;
  const nextRunStats = { ...runStats };
  const retainedEntities: SimulatedEntity[] = [];
  const goldGainMultiplier = resolveGoldGainMultiplier(buildState);
  const xpGainMultiplier = resolveXpGainMultiplier(buildState);
  const pickupRadiusWorldUnits =
    pickupContract.pickup.pickupRadiusWorldUnits * resolvePickupRadiusMultiplier(buildState);
  const crystalAttractionRadiusWorldUnits =
    pickupRadiusWorldUnits * pickupContract.crystalFlow.attractionRadiusMultiplier;
  const crystalCollectDistanceWorldUnits =
    pickupRadiusWorldUnits + nextPlayerEntity.footprint.radius;
  const magnetPulseTriggered = entities.some(
    (entity) =>
      entity.role === "pickup" &&
      entity.pickupProfile?.kind === "magnet" &&
      distanceBetweenWorldPoints(entity.worldPosition, nextPlayerEntity.worldPosition) <=
        crystalCollectDistanceWorldUnits
  ) || pickupPulseUntilTick >= tick;

  for (const entity of entities) {
    if (entity.role !== "pickup" || !entity.pickupProfile) {
      retainedEntities.push(entity);
      continue;
    }

    const pickupStackCount = Math.max(1, entity.pickupProfile.stackCount ?? 1);
    const distanceToPlayer = distanceBetweenWorldPoints(
      entity.worldPosition,
      nextPlayerEntity.worldPosition
    );

    if (entity.pickupProfile.kind === "crystal") {
      const attractionSource: PickupAttractionSource | null = magnetPulseTriggered
        ? "magnet"
        : entity.pickupProfile.attractionState?.source ??
          (distanceToPlayer <= crystalAttractionRadiusWorldUnits ? "proximity" : null);

      if (!attractionSource) {
        retainedEntities.push(entity);
        continue;
      }

      const movedWorldPosition = moveWorldPointTowardTarget(
        entity.worldPosition,
        nextPlayerEntity.worldPosition,
        fixedStepSeconds *
          (attractionSource === "magnet"
            ? pickupContract.crystalFlow.magnetAttractionSpeedWorldUnitsPerSecond
            : pickupContract.crystalFlow.proximityAttractionSpeedWorldUnitsPerSecond)
      );
      const movedDistanceToPlayer = distanceBetweenWorldPoints(
        movedWorldPosition,
        nextPlayerEntity.worldPosition
      );

      if (movedDistanceToPlayer <= crystalCollectDistanceWorldUnits) {
        Object.assign(
          nextRunStats,
          applyCrystalXpGain(nextRunStats, pickupStackCount, xpGainMultiplier)
        );
        Object.assign(
          nextRunStats,
          appendDiscoveredLootId(nextRunStats, resolveCrystalLootArchiveId(pickupStackCount))
        );
        continue;
      }

      retainedEntities.push({
        ...entity,
        pickupProfile: {
          ...entity.pickupProfile,
          attractionState: {
            source: attractionSource,
            startedAtTick: entity.pickupProfile.attractionState?.startedAtTick ?? tick
          }
        },
        worldPosition: movedWorldPosition
      });
      continue;
    }

    if (distanceToPlayer > crystalCollectDistanceWorldUnits) {
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
        Object.assign(nextRunStats, appendDiscoveredLootId(nextRunStats, "healing-kit"));
        break;
      case "gold":
        nextRunStats.goldCollected += Math.max(
          1,
          Math.round(pickupContract.gold.value * pickupStackCount * goldGainMultiplier)
        );
        Object.assign(nextRunStats, appendDiscoveredLootId(nextRunStats, "gold"));
        break;
      case "hourglass":
        nextEnemyTimeStopUntilTick =
          nextEnemyTimeStopUntilTick >= tick
            ? nextEnemyTimeStopUntilTick
            : tick + pickupContract.hourglass.durationTicks;
        Object.assign(nextRunStats, appendDiscoveredLootId(nextRunStats, "hourglass"));
        break;
      case "cache":
        nextRunStats.missionItemsCollected += 1;
        Object.assign(
          nextRunStats,
          appendDiscoveredLootId(
            nextRunStats,
            entity.pickupProfile.lootArchiveId ??
              (entity.pickupProfile.missionItemStageIndex === undefined
                ? "cache-gift"
                : "cache-gift")
          )
        );
        break;
      case "magnet":
        Object.assign(nextRunStats, appendDiscoveredLootId(nextRunStats, "magnet"));
        break;
    }
  }

  return {
    buildState,
    enemyTimeStopUntilTick: nextEnemyTimeStopUntilTick,
    entities: retainedEntities.map((entity) => {
      if (entity.id === nextPlayerEntity.id) {
        return nextPlayerEntity;
      }

      if (entity.role !== "hostile" || nextEnemyTimeStopUntilTick <= tick) {
        return entity;
      }

      return {
        ...entity,
        hostileControlState: {
          frozenUntilTick: Math.max(
            entity.hostileControlState?.frozenUntilTick ?? 0,
            nextEnemyTimeStopUntilTick
          )
        }
      };
    }),
    pickupPulseUntilTick,
    runStats: nextRunStats
  };
};
