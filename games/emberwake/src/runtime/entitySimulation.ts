import type { WorldPoint } from "@engine/geometry/primitives";
import {
  tileCoordinateToWorldOrigin,
  worldContract,
  worldPointToChunkCoordinate,
  worldPointToTileCoordinate
} from "@engine/world/worldContract";
import { createGenericMoverEntity } from "@game/content/entities/entityContract";
import { obstacleDefinitions, sampleWorldPointLayers, sampleWorldTileLayers } from "@game/content/world/worldGeneration";
import type { SingleEntityControlState } from "@game/input/singleEntityControlContract";
import { singleEntityControlContract } from "@game/input/singleEntityControlContract";
import type { EntityState, WorldEntity } from "@game/content/entities/entityContract";
import {
  emberwakeRuntimeBootstrap
} from "@game/runtime/emberwakeRuntimeBootstrap";
import { hostileCombatContract } from "@game/runtime/hostileCombatContract";
import { pickupContract } from "@game/runtime/pickupContract";
import { resolvePseudoPhysicalMovement } from "@game/runtime/pseudoPhysics";
import {
  createInitialMissionState,
  getMissionStage,
  missionExitWorldPosition,
  missionLoopContract,
  normalizeMissionState,
  type MissionBossId,
  type MissionState
} from "@game/runtime/missionLoop";
import {
  entityCombatPresentationContract,
  pruneFloatingDamageNumbers,
  resolveAutomaticPlayerAttack,
  resolveHostileContactDamage,
  resolvePickupCollection
} from "@game/runtime/entitySimulationCombat";
import { resolveEntityIntent } from "@game/runtime/entitySimulationIntent";
import {
  maintainLocalHostilePopulation,
  maintainNearbyPickupPopulation
} from "@game/runtime/entitySimulationSpawn";
import {
  addPendingLevelUps,
  activeWeaponIds,
  applyLevelUpChoice,
  type ActiveWeaponId,
  buildSystemContract,
  createInitialBuildState,
  normalizeBuildState,
  passLevelUpChoices,
  resolveMaxHealthBonus,
  resolveMoveSpeedMultiplier,
  resolveActiveWeaponRuntimeStats,
  rerollLevelUpChoices,
  type FusionId,
  type BuildState
} from "@game/runtime/buildSystem";
import {
  resolveCreatureCodexIdFromVisualKind,
  type CreatureCodexId
} from "@game/content/entities/creatureCodex";
import type { MovementSurfaceModifierKind } from "@game/content/world/worldData";
import {
  resolveRuntimeProfilingConfig,
  type RuntimeProfilingConfig
} from "@game/runtime/runtimeProfiling";
import {
  resolveRunProgressionPhase,
  type RunProgressionPhaseId
} from "@game/runtime/runProgressionPhases";
import {
  getHostileSpawnProfile,
  isMiniBossBeatTick,
  resolveBossDefeatEscalation,
  resolveHostileSpawnProfile,
  type HostileProfileId
} from "@game/runtime/hostilePressure";
import { gameplayTuning } from "@game/config/gameplayTuning";
import {
  resolveCrystalPickupTint,
  resolveCrystalPickupVisualKind
} from "@shared/model/crystalPickups";
import type { LootArchiveId } from "@shared/model/lootArchive";
import { getWorldProfileBySeed } from "@shared/model/worldProfiles";

export const entitySimulationContract = {
  fixedStepMs: 1000 / 60,
  maxCatchUpStepsPerFrame: 6,
  speedOptions: [0.5, 1, 2, 4] as const
} as const;
export { entityCombatPresentationContract };

export type SimulatedPickupKind =
  | "cache"
  | "crystal"
  | "gold"
  | "healing-kit"
  | "hourglass"
  | "magnet";

export type PickupAttractionSource = "magnet" | "proximity";

export type PickupAttractionState = {
  source: PickupAttractionSource;
  startedAtTick: number;
};

export type SimulatedEntityRole = "hostile" | "pickup" | "player" | "support";

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
  visibleTicks: number;
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

export type PickupProfile = {
  attractionState?: PickupAttractionState;
  kind: SimulatedPickupKind;
  lootArchiveId?: LootArchiveId;
  missionItemStageIndex?: number;
  stackCount?: number;
};

export type HostileBehaviorState = {
  chargeDirectionRadians: number | null;
  cooldownUntilTick: number | null;
  phase: "charge" | "telegraph" | null;
  phaseStartedAtTick: number | null;
};

export type HostileControlState = {
  frozenUntilTick: number | null;
};

export type RunStats = {
  activeWeaponPerformance: Record<
    ActiveWeaponId,
    {
      attacksTriggered: number;
      hostileDefeats: number;
      totalDamage: number;
    }
  >;
  creatureDefeatCounts: Partial<Record<CreatureCodexId, number>>;
  bossDefeats: number;
  crystalsCollected: number;
  currentLevel: number;
  currentXp: number;
  discoveredLootIds: LootArchiveId[];
  goldCollected: number;
  healingKitsCollected: number;
  hostileDefeats: number;
  missionBossDefeats: number;
  missionCompleted: boolean;
  missionItemsCollected: number;
  shellToastMessages: string[];
  shellToastSequence: number;
  worldProfileId: string | null;
};

export type DamageReactionState = {
  lastDamageAmount: number | null;
  lastDamageTick: number | null;
};

export type FloatingDamageNumber = {
  amount: number;
  driftX: number;
  id: string;
  sourceEntityId: string;
  spawnedAtTick: number;
  worldPosition: WorldPoint;
};

export type CombatSkillFeedbackKind =
  | "boomerang-arc"
  | "chain-arc"
  | "cinder-burst"
  | "cinder-travel"
  | "frost-nova"
  | "halo-burst"
  | "needle-trace"
  | "orbit-pulse"
  | "trail-burn"
  | "slash-ribbon"
  | "kunai-fan"
  | "vacuum-pulse"
  | "watchglass-laser"
  | "zone-seal";

export type CombatSkillFeedbackEvent = {
  arcRadians: number | null;
  durationTicks: number;
  fusionId: FusionId | null;
  id: string;
  kind: CombatSkillFeedbackKind;
  orientationRadians: number | null;
  originWorldPoint: WorldPoint;
  radiusWorldUnits: number | null;
  sourceEntityId: string;
  spawnedAtTick: number;
  targetWorldPoints: WorldPoint[];
  weaponId: ActiveWeaponId;
};

type TilePoint = {
  x: number;
  y: number;
};

export type MovementHeadingMemory = {
  headingRadians: number;
  lastMeaningfulTick: number;
};

export type HostilePathfindingState = {
  lastComputedTick: number | null;
  routeTiles: TilePoint[];
  targetTile: TilePoint | null;
};

export type SimulatedEntity = WorldEntity & {
  automaticAttack?: AutomaticAttackProfile;
  combat: EntityCombatState;
  contactDamageProfile?: ContactDamageProfile;
  damageReactionState?: DamageReactionState;
  focusState?: FocusState;
  hostileBehaviorState?: HostileBehaviorState;
  hostileControlState?: HostileControlState;
  hostileProfileId?: HostileProfileId;
  movementSurfaceModifier: MovementSurfaceModifierKind;
  movementSpeedWorldUnitsPerSecond?: number;
  movementHeadingMemory?: MovementHeadingMemory;
  pathfindingState?: HostilePathfindingState;
  pickupProfile?: PickupProfile;
  role: SimulatedEntityRole;
  spawnedAtTick: number;
  turnRateRadiansPerSecond?: number;
  velocity: WorldPoint;
  visualScale?: number;
};

export type EntitySimulationState = {
  buildState: BuildState;
  combatSkillFeedbackEvents: CombatSkillFeedbackEvent[];
  emergencyAegisChargesSpent: number;
  enemyTimeStopUntilTick: number;
  entities: SimulatedEntity[];
  entity: SimulatedEntity;
  floatingDamageNumbers: FloatingDamageNumber[];
  missionState: MissionState;
  nextPickupSequence: number;
  nextHostileSequence: number;
  pickupPulseUntilTick: number;
  runStats: RunStats;
  tick: number;
  worldSeed: string;
};

type LegacySimulationState = Partial<EntitySimulationState> & {
  buildState?: Partial<BuildState>;
  entity?: Partial<SimulatedEntity> & Pick<WorldEntity, "id" | "worldPosition">;
  entities?: Array<Partial<SimulatedEntity> & Pick<WorldEntity, "id" | "worldPosition">>;
  missionState?: Partial<MissionState>;
};

export type SimulationSpeedOption = (typeof entitySimulationContract.speedOptions)[number];

export type SimulationCommand = {
  buildChoiceIndex?: number | null;
  buildPassRequested?: boolean;
  buildRerollRequested?: boolean;
  controlState?: SingleEntityControlState;
  profiling?: RuntimeProfilingConfig;
  worldSeed?: string;
};

export type ScriptedPhase = {
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

const createDamageReactionState = (): DamageReactionState => ({
  lastDamageAmount: null,
  lastDamageTick: null
});

const createHostileControlState = (): HostileControlState => ({
  frozenUntilTick: null
});

const createInitialRunStats = (): RunStats => ({
  activeWeaponPerformance: Object.fromEntries(
    activeWeaponIds.map((weaponId) => [
      weaponId,
      {
        attacksTriggered: 0,
        hostileDefeats: 0,
        totalDamage: 0
      }
    ])
  ) as RunStats["activeWeaponPerformance"],
  creatureDefeatCounts: {},
  bossDefeats: 0,
  crystalsCollected: 0,
  currentLevel: 1,
  currentXp: 0,
  discoveredLootIds: [],
  goldCollected: 0,
  healingKitsCollected: 0,
  hostileDefeats: 0,
  missionBossDefeats: 0,
  missionCompleted: false,
  missionItemsCollected: 0,
  shellToastMessages: [],
  shellToastSequence: 0,
  worldProfileId: null
});

const createPlayerAutomaticAttackProfile = (buildState = createInitialBuildState()): AutomaticAttackProfile => {
  const starterWeapon =
    buildState.activeSlots.find(
      (activeSlot) => activeSlot.weaponId === buildSystemContract.starterWeaponId
    ) ?? buildState.activeSlots[0]!;
  const runtimeStats = resolveActiveWeaponRuntimeStats(buildState, starterWeapon);

  return {
    arcRadians:
      runtimeStats.attackKind === "cone" || runtimeStats.attackKind === "fan"
        ? hostileCombatContract.player.automaticConeAttack.arcRadians
        : hostileCombatContract.player.automaticConeAttack.arcRadians,
    cooldownTicks: runtimeStats.cooldownTicks,
    damage: runtimeStats.damage,
    lastAttackTick: starterWeapon.lastAttackTick,
    rangeWorldUnits: runtimeStats.rangeWorldUnits,
    visibleTicks: runtimeStats.visibleTicks
  };
};

const createPlayerEntity = (buildState = createInitialBuildState()): SimulatedEntity => ({
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
    ...createPlayerAutomaticAttackProfile(buildState)
  },
  combat: createCombatState(
    hostileCombatContract.player.maxHealth + resolveMaxHealthBonus(buildState)
  ),
  damageReactionState: createDamageReactionState(),
  movementSurfaceModifier: "normal",
  movementSpeedWorldUnitsPerSecond:
    singleEntityControlContract.desktopMoveSpeedWorldUnitsPerSecond *
    resolveMoveSpeedMultiplier(buildState),
  role: "player",
  spawnedAtTick: 0,
  turnRateRadiansPerSecond: gameplayTuning.playerTurning.turnRateRadiansPerSecond,
  velocity: {
    x: 0,
    y: 0
  }
});

const createHostileEntity = (
  hostileSequence: number,
  worldPosition: WorldPoint,
  spawnedAtTick: number,
  phaseId: RunProgressionPhaseId,
  bossDefeatCount: number,
  worldSeed: string
): SimulatedEntity => {
  const runPhase = resolveRunProgressionPhase(spawnedAtTick);
  const hostileProfile = resolveHostileSpawnProfile({
    hostileSequence,
    phaseId,
    spawnedAtTick
  });
  const bossDefeatEscalation = resolveBossDefeatEscalation(bossDefeatCount);
  const worldTier = getWorldProfileBySeed(worldSeed)?.tier ?? 1;
  const worldDifficultyMultiplier = 1 + Math.max(0, worldTier - 1) * 0.1;

  return {
    ...createGenericMoverEntity({
      archetype: "generic-mover",
      footprint: {
        radius: hostileProfile.footprintRadius
      },
      id: `entity:hostile:${hostileSequence}`,
      renderLayer: hostileProfile.renderLayer,
      visual: {
        kind: hostileProfile.visualKind,
        tint: hostileProfile.tint
      },
      worldPosition
    }),
    combat: createCombatState(
      Math.max(
        1,
        Math.round(
          hostileCombatContract.hostile.maxHealth *
            runPhase.hostileMaxHealthMultiplier *
            bossDefeatEscalation.hostileMaxHealthMultiplier *
            worldDifficultyMultiplier *
            hostileProfile.maxHealthMultiplier
        )
      )
    ),
    contactDamageProfile: {
      cooldownTicks: hostileCombatContract.hostile.contactDamageCooldownTicks,
      damage: Math.max(
        1,
        Math.round(
          hostileCombatContract.hostile.contactDamage *
            runPhase.hostileContactDamageMultiplier *
            bossDefeatEscalation.hostileContactDamageMultiplier *
            worldDifficultyMultiplier *
            hostileProfile.contactDamageMultiplier
        )
      ),
      lastDamageTick: null
    },
    focusState: {
      acquisitionRadiusWorldUnits: hostileCombatContract.hostile.acquisitionRadiusWorldUnits,
      targetEntityId: null
    },
    hostileBehaviorState:
      hostileProfile.behaviorKind === "telegraphed-charge"
        ? {
            chargeDirectionRadians: null,
            cooldownUntilTick: null,
            phase: null,
            phaseStartedAtTick: null
          }
        : undefined,
    damageReactionState: createDamageReactionState(),
    hostileProfileId: hostileProfile.id,
    movementSurfaceModifier: "normal",
    movementSpeedWorldUnitsPerSecond:
      hostileCombatContract.hostile.moveSpeedWorldUnitsPerSecond *
      hostileProfile.moveSpeedMultiplier,
    pathfindingState: {
      lastComputedTick: null,
      routeTiles: [],
      targetTile: null
    },
    role: "hostile",
    spawnedAtTick,
    state: phaseId === "kill-grid" || hostileProfile.isMiniBoss ? "moving" : "idle",
    velocity: {
      x: 0,
      y: 0
    },
    visualScale: hostileProfile.visualScaleMultiplier
  } satisfies SimulatedEntity;
};

const missionBossPresentationMap: Record<
  MissionBossId,
  {
    baseProfileId: HostileProfileId;
    tint: string;
    visualKind:
      | "boss-abyss-watchglass"
      | "boss-ruin-ram"
      | "boss-sentinel-tyrant";
    visualScaleMultiplier: number;
  }
> = {
  "mission-boss-rammer": {
    baseProfileId: "shock-ram",
    tint: "#ff6f61",
    visualKind: "boss-ruin-ram",
    visualScaleMultiplier: 1.7
  },
  "mission-boss-sentinel": {
    baseProfileId: "sentinel-husk",
    tint: "#ff9f7c",
    visualKind: "boss-sentinel-tyrant",
    visualScaleMultiplier: 1.72
  },
  "mission-boss-watchglass": {
    baseProfileId: "watchglass-prime",
    tint: "#ff8a72",
    visualKind: "boss-abyss-watchglass",
    visualScaleMultiplier: 1.74
  }
};

const createMissionBossEntity = (
  missionBossId: MissionBossId,
  stageIndex: number,
  worldPosition: WorldPoint,
  spawnedAtTick: number,
  bossDefeatCount: number,
  worldSeed: string
): SimulatedEntity => {
  const presentation = missionBossPresentationMap[missionBossId];
  const baseProfile = getHostileSpawnProfile(presentation.baseProfileId);
  const worldTier = getWorldProfileBySeed(worldSeed)?.tier ?? 1;
  const worldDifficultyMultiplier = 1 + Math.max(0, worldTier - 1) * 0.1;
  const maxHealth = Math.max(
    1,
    Math.round(
      hostileCombatContract.hostile.maxHealth *
        resolveBossDefeatEscalation(bossDefeatCount).hostileMaxHealthMultiplier *
        worldDifficultyMultiplier *
        baseProfile.maxHealthMultiplier *
        5.2
    )
  );

  return {
    ...createGenericMoverEntity({
      archetype: "generic-mover",
      footprint: {
        radius: Math.round(baseProfile.footprintRadius * 1.28)
      },
      id: `entity:mission-boss:${stageIndex}`,
      renderLayer: baseProfile.renderLayer + 4,
      visual: {
        kind: presentation.visualKind,
        tint: presentation.tint
      },
      worldPosition
    }),
    combat: createCombatState(maxHealth),
    contactDamageProfile: {
      cooldownTicks: hostileCombatContract.hostile.contactDamageCooldownTicks,
      damage: Math.max(
        1,
        Math.round(
          hostileCombatContract.hostile.contactDamage *
            resolveBossDefeatEscalation(bossDefeatCount).hostileContactDamageMultiplier *
            worldDifficultyMultiplier *
            baseProfile.contactDamageMultiplier *
            1.45
        )
      ),
      lastDamageTick: null
    },
    damageReactionState: createDamageReactionState(),
    focusState: {
      acquisitionRadiusWorldUnits: hostileCombatContract.hostile.acquisitionRadiusWorldUnits * 1.6,
      targetEntityId: null
    },
    hostileBehaviorState:
      baseProfile.behaviorKind === "telegraphed-charge"
        ? {
            chargeDirectionRadians: null,
            cooldownUntilTick: null,
            phase: null,
            phaseStartedAtTick: null
          }
        : undefined,
    hostileControlState: createHostileControlState(),
    hostileProfileId: presentation.baseProfileId,
    movementSurfaceModifier: "normal",
    movementSpeedWorldUnitsPerSecond:
      hostileCombatContract.hostile.moveSpeedWorldUnitsPerSecond * baseProfile.moveSpeedMultiplier * 0.92,
    pathfindingState: {
      lastComputedTick: null,
      routeTiles: [],
      targetTile: null
    },
    role: "hostile",
    spawnedAtTick,
    state: "moving",
    velocity: {
      x: 0,
      y: 0
    },
    visualScale: presentation.visualScaleMultiplier
  };
};

const createPickupEntity = (
  pickupSequence: number,
  pickupKind: SimulatedPickupKind,
  worldPosition: WorldPoint,
  spawnedAtTick: number,
  stackCount = 1,
  options?: {
    lootArchiveId?: LootArchiveId;
    missionItemStageIndex?: number | null;
    tint?: string;
    visualKind?: SimulatedEntity["visual"]["kind"];
  }
): SimulatedEntity => ({
  ...createGenericMoverEntity({
    id: `entity:pickup:${pickupKind}:${pickupSequence}`,
    renderLayer: 90,
    visual: {
      kind:
        options?.visualKind ??
        (pickupKind === "healing-kit"
          ? "pickup-healing-kit"
          : pickupKind === "crystal"
            ? resolveCrystalPickupVisualKind(stackCount)
            : pickupKind === "hourglass"
              ? "pickup-hourglass"
            : pickupKind === "magnet"
              ? "pickup-magnet"
            : pickupKind === "cache"
              ? "pickup-cache"
              : "pickup-gold"),
      tint:
        options?.tint ??
        (pickupKind === "healing-kit"
          ? "#7dff9b"
          : pickupKind === "crystal"
            ? resolveCrystalPickupTint(stackCount)
            : pickupKind === "hourglass"
              ? "#8ed9ff"
            : pickupKind === "magnet"
              ? "#ffd1ff"
            : pickupKind === "cache"
              ? "#9ae5ff"
              : "#ffd76c")
    },
    worldPosition
  }),
  combat: createCombatState(1),
  damageReactionState: createDamageReactionState(),
  footprint: {
    radius: pickupContract.pickup.pickupRadiusWorldUnits
  },
  movementSurfaceModifier: "normal",
  pickupProfile: {
    kind: pickupKind,
    lootArchiveId: options?.lootArchiveId,
    missionItemStageIndex: options?.missionItemStageIndex ?? undefined,
    stackCount
  },
  role: "pickup",
  spawnedAtTick,
  velocity: {
    x: 0,
    y: 0
  }
});

const isAlive = (entity: SimulatedEntity) => entity.combat.currentHealth > 0;
const isDisabledPickupEntity = (entity: SimulatedEntity) =>
  entity.role === "pickup" &&
  entity.pickupProfile?.kind === "cache" &&
  entity.pickupProfile.missionItemStageIndex === undefined &&
  entity.pickupProfile.lootArchiveId === undefined;

const pickupStackMergeRadiusWorldUnits = pickupContract.pickup.pickupRadiusWorldUnits * 3;
const pickupCompactionIntervalTicks = 30;
const distantPickupMergeChunkDistance = 2;
const distantPickupMergeRadiusWorldUnits = pickupStackMergeRadiusWorldUnits * 6;
const denseCrystalCompactionThreshold = 18;
const denseCrystalMergeRadiusWorldUnits = pickupStackMergeRadiusWorldUnits * 3.5;

const isStackablePickupKind = (pickupKind: SimulatedPickupKind) =>
  pickupKind === "crystal" || pickupKind === "gold";

const resolvePickupStackCount = (entity: SimulatedEntity) =>
  Math.max(1, entity.pickupProfile?.stackCount ?? 1);

const mergeNewPickupEntities = (
  entities: readonly SimulatedEntity[],
  newPickupEntities: readonly SimulatedEntity[]
) => {
  const nextEntities = [...entities];

  for (const pickupEntity of newPickupEntities) {
    const pickupKind = pickupEntity.pickupProfile?.kind;

    if (!pickupKind || !isStackablePickupKind(pickupKind)) {
      nextEntities.push(pickupEntity);
      continue;
    }

    let mergeTargetIndex = -1;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (let entityIndex = 0; entityIndex < nextEntities.length; entityIndex += 1) {
      const candidateEntity = nextEntities[entityIndex];

      if (
        candidateEntity.role !== "pickup" ||
        candidateEntity.pickupProfile?.kind !== pickupKind ||
        !isStackablePickupKind(candidateEntity.pickupProfile.kind)
      ) {
        continue;
      }

      const distance = distanceBetweenWorldPoints(
        candidateEntity.worldPosition,
        pickupEntity.worldPosition
      );

      if (
        distance > pickupStackMergeRadiusWorldUnits ||
        distance >= nearestDistance
      ) {
        continue;
      }

      mergeTargetIndex = entityIndex;
      nearestDistance = distance;
    }

    if (mergeTargetIndex === -1) {
      nextEntities.push(pickupEntity);
      continue;
    }

    const mergeTarget = nextEntities[mergeTargetIndex]!;
    const nextStackCount =
      resolvePickupStackCount(mergeTarget) + resolvePickupStackCount(pickupEntity);

    nextEntities[mergeTargetIndex] = {
      ...mergeTarget,
      pickupProfile: {
        ...mergeTarget.pickupProfile!,
        stackCount: nextStackCount
      },
      visual:
        pickupKind === "crystal"
          ? {
              ...mergeTarget.visual,
              kind: resolveCrystalPickupVisualKind(nextStackCount),
              tint: resolveCrystalPickupTint(nextStackCount)
            }
          : mergeTarget.visual
    };
  }

  return nextEntities;
};

const isDistantPickupCandidate = (
  pickupEntity: SimulatedEntity,
  playerEntity: SimulatedEntity
) => {
  const playerChunkCoordinate = worldPointToChunkCoordinate(playerEntity.worldPosition);
  const pickupChunkCoordinate = worldPointToChunkCoordinate(pickupEntity.worldPosition);

  return (
    Math.max(
      Math.abs(playerChunkCoordinate.x - pickupChunkCoordinate.x),
      Math.abs(playerChunkCoordinate.y - pickupChunkCoordinate.y)
    ) >= distantPickupMergeChunkDistance
  );
};

const createMergedPickupEntity = (cluster: readonly SimulatedEntity[], preferCentroid: boolean) => {
  if (cluster.length === 1) {
    return cluster[0]!;
  }

  const anchorEntity = [...cluster].sort((leftEntity, rightEntity) => {
    const stackDelta = resolvePickupStackCount(rightEntity) - resolvePickupStackCount(leftEntity);

    if (stackDelta !== 0) {
      return stackDelta;
    }

    return leftEntity.spawnedAtTick - rightEntity.spawnedAtTick;
  })[0]!;
  const totalStackCount = cluster.reduce(
    (totalStackCount, pickupEntity) => totalStackCount + resolvePickupStackCount(pickupEntity),
    0
  );

  if (!preferCentroid) {
    return {
      ...anchorEntity,
      pickupProfile: {
        ...anchorEntity.pickupProfile!,
        stackCount: totalStackCount
      },
      visual:
        anchorEntity.pickupProfile?.kind === "crystal"
          ? {
              ...anchorEntity.visual,
              kind: resolveCrystalPickupVisualKind(totalStackCount),
              tint: resolveCrystalPickupTint(totalStackCount)
            }
          : anchorEntity.visual
    };
  }

  const weightedWorldPosition = cluster.reduce(
    (accumulator, pickupEntity) => {
      const stackCount = resolvePickupStackCount(pickupEntity);

      return {
        totalStackCount: accumulator.totalStackCount + stackCount,
        x: accumulator.x + pickupEntity.worldPosition.x * stackCount,
        y: accumulator.y + pickupEntity.worldPosition.y * stackCount
      };
    },
    {
      totalStackCount: 0,
      x: 0,
      y: 0
    }
  );

  return {
    ...anchorEntity,
    pickupProfile: {
      ...anchorEntity.pickupProfile!,
      stackCount: totalStackCount
    },
    visual:
      anchorEntity.pickupProfile?.kind === "crystal"
        ? {
            ...anchorEntity.visual,
            kind: resolveCrystalPickupVisualKind(totalStackCount),
            tint: resolveCrystalPickupTint(totalStackCount)
          }
        : anchorEntity.visual,
    worldPosition: {
      x: weightedWorldPosition.x / weightedWorldPosition.totalStackCount,
      y: weightedWorldPosition.y / weightedWorldPosition.totalStackCount
    }
  };
};

const compactStackablePickupEntities = (
  entities: readonly SimulatedEntity[],
  playerEntity: SimulatedEntity,
  tick: number
) => {
  if (tick % pickupCompactionIntervalTicks !== 0) {
    return [...entities];
  }

  const stackablePickups = entities.filter(
    (entity) =>
      entity.role === "pickup" &&
      entity.pickupProfile &&
      isStackablePickupKind(entity.pickupProfile.kind)
  );

  if (stackablePickups.length < 2) {
    return [...entities];
  }

  const staticEntities = entities.filter(
    (entity) =>
      entity.role !== "pickup" ||
      !entity.pickupProfile ||
      !isStackablePickupKind(entity.pickupProfile.kind)
  );
  const compactedPickups: SimulatedEntity[] = [];

  for (const pickupKind of ["crystal", "gold"] as const) {
    const remainingKindPickups = stackablePickups.filter(
      (entity) => entity.pickupProfile?.kind === pickupKind
    );
    const denseCrystalPressure =
      pickupKind === "crystal" &&
      remainingKindPickups.length >= denseCrystalCompactionThreshold;
    const visitedPickupIds = new Set<string>();

    for (const pickupEntity of remainingKindPickups) {
      if (visitedPickupIds.has(pickupEntity.id)) {
        continue;
      }

      const cluster = [pickupEntity];
      const clusterHasDistantCandidate = { current: isDistantPickupCandidate(pickupEntity, playerEntity) };
      visitedPickupIds.add(pickupEntity.id);

      for (let clusterIndex = 0; clusterIndex < cluster.length; clusterIndex += 1) {
        const currentClusterEntity = cluster[clusterIndex]!;
        const currentEntityIsDistant = isDistantPickupCandidate(currentClusterEntity, playerEntity);
        const mergeRadiusWorldUnits =
          currentEntityIsDistant || clusterHasDistantCandidate.current
            ? distantPickupMergeRadiusWorldUnits
            : denseCrystalPressure
              ? denseCrystalMergeRadiusWorldUnits
            : pickupStackMergeRadiusWorldUnits;

        for (const candidateEntity of remainingKindPickups) {
          if (visitedPickupIds.has(candidateEntity.id)) {
            continue;
          }

          const distance = distanceBetweenWorldPoints(
            currentClusterEntity.worldPosition,
            candidateEntity.worldPosition
          );

          if (distance > mergeRadiusWorldUnits) {
            continue;
          }

          clusterHasDistantCandidate.current =
            clusterHasDistantCandidate.current ||
            isDistantPickupCandidate(candidateEntity, playerEntity);
          visitedPickupIds.add(candidateEntity.id);
          cluster.push(candidateEntity);
        }
      }

      compactedPickups.push(
        createMergedPickupEntity(
          cluster,
          clusterHasDistantCandidate.current || denseCrystalPressure
        )
      );
    }
  }

  return [...staticEntities, ...compactedPickups];
};

const isDynamicCollider = (entity: SimulatedEntity) => entity.role !== "pickup" && isAlive(entity);

const getPlayerEntity = (entities: readonly SimulatedEntity[]) =>
  entities.find((entity) => entity.role === "player") ?? entities[0];

const distanceBetweenWorldPoints = (left: WorldPoint, right: WorldPoint) =>
  Math.hypot(left.x - right.x, left.y - right.y);

const movementVectorMagnitude = (vector: WorldPoint) => Math.hypot(vector.x, vector.y);

const normalizeAngleDelta = (angleDelta: number) => {
  if (angleDelta > Math.PI) {
    return angleDelta - Math.PI * 2;
  }

  if (angleDelta < -Math.PI) {
    return angleDelta + Math.PI * 2;
  }

  return angleDelta;
};

const resolveBoundedOrientation = ({
  currentOrientation,
  maximumStepRadians,
  targetOrientation
}: {
  currentOrientation: number;
  maximumStepRadians: number;
  targetOrientation: number;
}) => {
  const angleDelta = normalizeAngleDelta(targetOrientation - currentOrientation);

  if (Math.abs(angleDelta) <= maximumStepRadians) {
    return targetOrientation;
  }

  return currentOrientation + Math.sign(angleDelta) * maximumStepRadians;
};

const playerDirectionalInertiaProfile = {
  minimumSpeedWorldUnitsPerSecond: 18,
  reversalDotThreshold: -0.35,
  reversalResponsiveness: 0.18
} as const;

export const createInitialSimulationState = (options?: {
  metaProgression?: BuildState["metaProgression"];
}): EntitySimulationState => {
  const buildState = normalizeBuildState({
    metaProgression: options?.metaProgression
  });
  const playerEntity = createPlayerEntity(buildState);

  return {
    buildState,
    combatSkillFeedbackEvents: [],
    emergencyAegisChargesSpent: 0,
    enemyTimeStopUntilTick: 0,
    entities: [playerEntity],
    entity: playerEntity,
    floatingDamageNumbers: [],
    missionState: createInitialMissionState(),
    nextPickupSequence: 0,
    nextHostileSequence: 0,
    pickupPulseUntilTick: 0,
    runStats: createInitialRunStats(),
    tick: 0,
    worldSeed: emberwakeRuntimeBootstrap.worldSeed
  };
};

const normalizeCombatState = (
  combat: Partial<EntityCombatState> | undefined,
  maxHealth: number
): EntityCombatState => ({
  currentHealth: Math.max(
    0,
    Math.min(combat?.currentHealth ?? maxHealth, combat?.maxHealth ?? maxHealth)
  ),
  maxHealth: combat?.maxHealth ?? maxHealth
});

const normalizeDamageReactionState = (
  damageReactionState: Partial<DamageReactionState> | undefined
): DamageReactionState => ({
  lastDamageAmount: damageReactionState?.lastDamageAmount ?? null,
  lastDamageTick: damageReactionState?.lastDamageTick ?? null
});

const normalizeEntityRole = (
  entity: Partial<SimulatedEntity> & Pick<WorldEntity, "id" | "worldPosition">
): SimulatedEntityRole =>
  entity.role ??
  (entity.id === emberwakeRuntimeBootstrap.playerEntity.id
    ? "player"
    : entity.id.startsWith("entity:hostile:")
      ? "hostile"
      : entity.id.startsWith("entity:pickup:")
        ? "pickup"
      : "support");

const normalizeSimulatedEntity = (
  entity: Partial<SimulatedEntity> & Pick<WorldEntity, "id" | "worldPosition">
): SimulatedEntity => {
  const role = normalizeEntityRole(entity);
  const baseEntity = createGenericMoverEntity({
    archetype: entity.archetype ?? "generic-mover",
    id: entity.id,
    orientation: entity.orientation ?? 0,
    renderLayer: entity.renderLayer ?? 100,
    state: entity.state ?? "idle",
    visual: {
      kind:
        entity.visual?.kind ??
        (role === "hostile"
          ? "debug-sentinel"
          : role === "support"
            ? "debug-anchor"
            : emberwakeRuntimeBootstrap.playerEntity.visualKind),
      tint:
        entity.visual?.tint ??
        (role === "hostile"
          ? "#ff6d78"
          : role === "support"
            ? "#4ce2ff"
            : emberwakeRuntimeBootstrap.playerEntity.tint)
    },
    worldPosition: entity.worldPosition
  });

  if (role === "player") {
    return {
      ...baseEntity,
      automaticAttack: {
        ...createPlayerAutomaticAttackProfile(),
        ...entity.automaticAttack
      },
      combat: normalizeCombatState(entity.combat, hostileCombatContract.player.maxHealth),
      damageReactionState: normalizeDamageReactionState(entity.damageReactionState),
      movementSurfaceModifier: entity.movementSurfaceModifier ?? "normal",
      movementSpeedWorldUnitsPerSecond: entity.movementSpeedWorldUnitsPerSecond,
      movementHeadingMemory: entity.movementHeadingMemory,
      role,
      spawnedAtTick: entity.spawnedAtTick ?? 0,
      turnRateRadiansPerSecond:
        entity.turnRateRadiansPerSecond ?? gameplayTuning.playerTurning.turnRateRadiansPerSecond,
      velocity: entity.velocity ?? { x: 0, y: 0 },
      visualScale: entity.visualScale
    };
  }

  if (role === "hostile") {
    const resolvedHostileProfileId =
      entity.hostileProfileId ?? getHostileSpawnProfile("sentinel-husk").id;
    const resolvedHostileProfile = getHostileSpawnProfile(resolvedHostileProfileId);

    return {
      ...baseEntity,
      combat: normalizeCombatState(entity.combat, hostileCombatContract.hostile.maxHealth),
      contactDamageProfile: {
        cooldownTicks:
          entity.contactDamageProfile?.cooldownTicks ??
          hostileCombatContract.hostile.contactDamageCooldownTicks,
        damage:
          entity.contactDamageProfile?.damage ?? hostileCombatContract.hostile.contactDamage,
        lastDamageTick: entity.contactDamageProfile?.lastDamageTick ?? null
      },
      focusState: {
        acquisitionRadiusWorldUnits:
          entity.focusState?.acquisitionRadiusWorldUnits ??
          hostileCombatContract.hostile.acquisitionRadiusWorldUnits,
        targetEntityId: entity.focusState?.targetEntityId ?? null
      },
      hostileBehaviorState:
        resolvedHostileProfile.behaviorKind === "telegraphed-charge"
          ? {
              chargeDirectionRadians:
                entity.hostileBehaviorState?.chargeDirectionRadians ?? null,
              cooldownUntilTick: entity.hostileBehaviorState?.cooldownUntilTick ?? null,
              phase: entity.hostileBehaviorState?.phase ?? null,
              phaseStartedAtTick: entity.hostileBehaviorState?.phaseStartedAtTick ?? null
            }
          : entity.hostileBehaviorState,
      damageReactionState: normalizeDamageReactionState(entity.damageReactionState),
      hostileProfileId: resolvedHostileProfileId,
      hostileControlState: {
        ...createHostileControlState(),
        ...entity.hostileControlState
      },
      movementSurfaceModifier: entity.movementSurfaceModifier ?? "normal",
      movementSpeedWorldUnitsPerSecond:
        entity.movementSpeedWorldUnitsPerSecond ??
        hostileCombatContract.hostile.moveSpeedWorldUnitsPerSecond,
      pathfindingState: {
        lastComputedTick: entity.pathfindingState?.lastComputedTick ?? null,
        routeTiles: entity.pathfindingState?.routeTiles ?? [],
        targetTile: entity.pathfindingState?.targetTile ?? null
      },
      role,
      spawnedAtTick: entity.spawnedAtTick ?? 0,
      velocity: entity.velocity ?? { x: 0, y: 0 },
      visualScale: entity.visualScale
    };
  }

  if (role === "pickup") {
    const inferredPickupKind =
      entity.pickupProfile?.kind ??
      (entity.id.includes(":healing-kit:")
        ? "healing-kit"
        : entity.id.includes(":crystal:")
          ? "crystal"
          : entity.id.includes(":hourglass:")
            ? "hourglass"
          : entity.id.includes(":magnet:")
            ? "magnet"
          : "gold");

    return {
      ...baseEntity,
      combat: normalizeCombatState(entity.combat, 1),
      damageReactionState: normalizeDamageReactionState(entity.damageReactionState),
      footprint: {
        radius: entity.footprint?.radius ?? pickupContract.pickup.pickupRadiusWorldUnits
      },
      movementSurfaceModifier: entity.movementSurfaceModifier ?? "normal",
      visual:
        inferredPickupKind === "crystal"
          ? {
              ...baseEntity.visual,
              kind: resolveCrystalPickupVisualKind(
                Math.max(1, entity.pickupProfile?.stackCount ?? 1)
              ),
              tint: resolveCrystalPickupTint(
                Math.max(1, entity.pickupProfile?.stackCount ?? 1)
              )
            }
          : baseEntity.visual,
      pickupProfile: {
        attractionState: entity.pickupProfile?.attractionState,
        kind: inferredPickupKind,
        lootArchiveId: entity.pickupProfile?.lootArchiveId,
        missionItemStageIndex: entity.pickupProfile?.missionItemStageIndex,
        stackCount: Math.max(1, entity.pickupProfile?.stackCount ?? 1)
      },
      role,
      spawnedAtTick: entity.spawnedAtTick ?? 0,
      turnRateRadiansPerSecond: entity.turnRateRadiansPerSecond,
      velocity: entity.velocity ?? { x: 0, y: 0 },
      visualScale: entity.visualScale
    };
  }

  return {
    ...baseEntity,
    combat: normalizeCombatState(entity.combat, 1),
    damageReactionState: normalizeDamageReactionState(entity.damageReactionState),
    movementSurfaceModifier: entity.movementSurfaceModifier ?? "normal",
    movementSpeedWorldUnitsPerSecond: entity.movementSpeedWorldUnitsPerSecond,
    role,
    spawnedAtTick: entity.spawnedAtTick ?? 0,
    turnRateRadiansPerSecond: entity.turnRateRadiansPerSecond,
    velocity: entity.velocity ?? { x: 0, y: 0 },
    visualScale: entity.visualScale
  };
};

export const normalizeEntitySimulationState = (
  simulationState: LegacySimulationState | EntitySimulationState
): EntitySimulationState => {
  const initialState = createInitialSimulationState();
  const normalizedBuildState = normalizeBuildState(simulationState.buildState);
  const sourceEntities =
    simulationState.entities && simulationState.entities.length > 0
      ? simulationState.entities
      : simulationState.entity
        ? [simulationState.entity]
        : initialState.entities;
  const normalizedEntities = sourceEntities
    .map((entity) => normalizeSimulatedEntity(entity))
    .filter((entity) => !isDisabledPickupEntity(entity));
  const playerEntity =
    normalizedEntities.find(
      (entity) => entity.role === "player" || entity.id === emberwakeRuntimeBootstrap.playerEntity.id
    ) ?? initialState.entity;
  const normalizedPlayerEntity: SimulatedEntity = {
    ...playerEntity,
    automaticAttack: {
      ...createPlayerAutomaticAttackProfile(normalizedBuildState),
      ...(playerEntity.automaticAttack ?? {})
    }
  };
  const nextHostileSequence = normalizedEntities.reduce((highestSequence, entity) => {
    if (entity.role !== "hostile") {
      return highestSequence;
    }

    const hostileSuffix = Number.parseInt(entity.id.split(":").at(-1) ?? "", 10);

    return Number.isNaN(hostileSuffix)
      ? highestSequence
      : Math.max(highestSequence, hostileSuffix + 1);
  }, simulationState.nextHostileSequence ?? 0);
  const nextPickupSequence = normalizedEntities.reduce((highestSequence, entity) => {
    if (entity.role !== "pickup") {
      return highestSequence;
    }

    const pickupSuffix = Number.parseInt(entity.id.split(":").at(-1) ?? "", 10);

    return Number.isNaN(pickupSuffix)
      ? highestSequence
      : Math.max(highestSequence, pickupSuffix + 1);
  }, simulationState.nextPickupSequence ?? 0);

  return {
    buildState: normalizedBuildState,
    combatSkillFeedbackEvents: simulationState.combatSkillFeedbackEvents ?? [],
    emergencyAegisChargesSpent: Math.max(0, simulationState.emergencyAegisChargesSpent ?? 0),
    enemyTimeStopUntilTick: Math.max(0, simulationState.enemyTimeStopUntilTick ?? 0),
    entities: normalizedEntities.map((entity) =>
      entity.id === normalizedPlayerEntity.id ? normalizedPlayerEntity : entity
    ),
    entity: normalizedPlayerEntity,
    floatingDamageNumbers: pruneFloatingDamageNumbers(
      simulationState.floatingDamageNumbers ?? [],
      simulationState.tick ?? 0
    ),
    missionState: normalizeMissionState(simulationState.missionState),
    nextPickupSequence,
    nextHostileSequence,
    pickupPulseUntilTick: Math.max(0, simulationState.pickupPulseUntilTick ?? 0),
    runStats: {
      ...createInitialRunStats(),
      ...simulationState.runStats
    },
    tick: simulationState.tick ?? 0,
    worldSeed: simulationState.worldSeed ?? emberwakeRuntimeBootstrap.worldSeed
  };
};

const syncPlayerAutomaticAttackToBuildState = (
  playerEntity: SimulatedEntity,
  buildState: BuildState
): SimulatedEntity => ({
  ...playerEntity,
  automaticAttack: createPlayerAutomaticAttackProfile(buildState)
});

const parseMissionBossStageIndex = (entityId: string) => {
  const suffix = Number.parseInt(entityId.split(":").at(-1) ?? "", 10);
  return Number.isNaN(suffix) ? null : suffix;
};

const activateMissionBossIfReached = ({
  bossDefeatCount,
  entities,
  missionState,
  nextTick,
  playerEntity,
  worldSeed
}: {
  bossDefeatCount: number;
  entities: readonly SimulatedEntity[];
  missionState: MissionState;
  nextTick: number;
  playerEntity: SimulatedEntity | undefined;
  worldSeed: string;
}) => {
  if (
    !playerEntity ||
    missionState.completed ||
    missionState.currentBossEntityId !== null ||
    missionState.currentDroppedItemEntityId !== null
  ) {
    return {
      entities: [...entities],
      missionState
    };
  }

  const activeStage = getMissionStage(missionState.itemCount, worldSeed);

  if (!activeStage) {
    return {
      entities: [...entities],
      missionState
    };
  }

  if (
    distanceBetweenWorldPoints(playerEntity.worldPosition, activeStage.zoneWorldPosition) >
    missionLoopContract.zoneActivationRadiusWorldUnits
  ) {
    return {
      entities: [...entities],
      missionState: {
        ...missionState,
        activeStageIndex: missionState.itemCount
      }
    };
  }

  const missionBoss = createMissionBossEntity(
    activeStage.bossId,
    missionState.itemCount,
    activeStage.zoneWorldPosition,
    nextTick,
    bossDefeatCount,
    worldSeed
  );

  return {
    entities: [...entities, missionBoss],
    missionState: {
      ...missionState,
      activeStageIndex: missionState.itemCount,
      currentBossEntityId: missionBoss.id
    }
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

export const pruneCombatSkillFeedbackEvents = (
  combatSkillFeedbackEvents: readonly CombatSkillFeedbackEvent[],
  tick: number
) =>
  combatSkillFeedbackEvents.filter(
    (combatSkillFeedbackEvent) =>
      tick - combatSkillFeedbackEvent.spawnedAtTick < combatSkillFeedbackEvent.durationTicks
  );

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
  tick,
  worldSeed
}: {
  dynamicColliders: readonly SimulatedEntity[];
  entity: SimulatedEntity;
  intent: ReturnType<typeof resolveEntityIntent>;
  tick: number;
  worldSeed: string;
}) => {
  const stepSeconds = entitySimulationContract.fixedStepMs / 1000;
  const surfaceSample = sampleWorldPointLayers(entity.worldPosition, worldSeed);
  const resolvedMovement = resolvePseudoPhysicalMovement({
    currentPosition: entity.worldPosition,
    currentVelocity: entity.velocity,
    desiredVelocity: intent.velocity,
    directionalInertiaProfile:
      entity.role === "player" ? playerDirectionalInertiaProfile : undefined,
    footprintRadius: entity.footprint.radius,
    isBlockedAtPosition: (worldPosition, footprintRadius) =>
      isWorldPositionBlockedByObstacle(worldPosition, footprintRadius, worldSeed),
    staticColliders: dynamicColliders,
    stepSeconds,
    surfaceModifierKind: surfaceSample.modifierKind
  });
  const movementSpeed = movementVectorMagnitude(resolvedMovement.velocity);
  const targetOrientation =
    intent.orientationOverrideRadians ??
    (movementSpeed >= gameplayTuning.playerTurning.meaningfulVelocityWorldUnitsPerSecond
      ? Math.atan2(resolvedMovement.velocity.y, resolvedMovement.velocity.x)
      : entity.movementHeadingMemory &&
          tick - entity.movementHeadingMemory.lastMeaningfulTick <=
            entityCombatPresentationContract.spawnHeadingMemoryTicks
        ? entity.movementHeadingMemory.headingRadians
        : entity.orientation);
  const orientation =
    entity.turnRateRadiansPerSecond && targetOrientation !== entity.orientation
      ? resolveBoundedOrientation({
          currentOrientation: entity.orientation,
          maximumStepRadians: entity.turnRateRadiansPerSecond * stepSeconds,
          targetOrientation
        })
      : targetOrientation;

  return {
    ...entity,
    focusState: entity.focusState
      ? {
          ...entity.focusState,
          targetEntityId: intent.focusTargetEntityId ?? null
        }
      : undefined,
    hostileBehaviorState:
      entity.role === "hostile"
        ? intent.hostileBehaviorState ?? entity.hostileBehaviorState
        : undefined,
    movementHeadingMemory:
      entity.role === "player" && movementSpeed > 0
        ? {
            headingRadians: targetOrientation,
            lastMeaningfulTick: tick
          }
        : entity.movementHeadingMemory,
    movementSurfaceModifier: resolvedMovement.surfaceModifierKind,
    pathfindingState:
      entity.role === "hostile" ? intent.pathfindingState ?? entity.pathfindingState : undefined,
    orientation,
    state:
      resolvedMovement.velocity.x === 0 && resolvedMovement.velocity.y === 0
        ? "idle"
        : intent.state,
    velocity: resolvedMovement.velocity,
    worldPosition: resolvedMovement.worldPosition
  } satisfies SimulatedEntity;
};

const canSpawnEntityAtPosition = ({
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

  return !entities.some((entity) => {
    const requiredDistance = footprintRadius + entity.footprint.radius;

    return distanceBetweenWorldPoints(worldPosition, entity.worldPosition) < requiredDistance;
  });
};

export const advanceSimulationState = (
  simulationState: EntitySimulationState,
  command: SimulationCommand = {}
): EntitySimulationState => {
  const worldSeed = command.worldSeed ?? simulationState.worldSeed;
  const profiling = resolveRuntimeProfilingConfig(command.profiling);
  const normalizedBuildState = normalizeBuildState(simulationState.buildState);
  const normalizedMissionState = normalizeMissionState(simulationState.missionState);
  const choiceAppliedBuildState =
    command.buildChoiceIndex !== null && command.buildChoiceIndex !== undefined
      ? applyLevelUpChoice(normalizedBuildState, command.buildChoiceIndex, simulationState.tick)
      : command.buildRerollRequested
        ? rerollLevelUpChoices(normalizedBuildState, simulationState.tick)
        : command.buildPassRequested
          ? passLevelUpChoices(normalizedBuildState, simulationState.tick)
          : normalizedBuildState;

  if (choiceAppliedBuildState.levelUpChoices.length > 0) {
    const lockedPlayerEntity = syncPlayerAutomaticAttackToBuildState(
      simulationState.entity,
      choiceAppliedBuildState
    );

    return {
      ...simulationState,
      buildState: choiceAppliedBuildState,
      combatSkillFeedbackEvents: pruneCombatSkillFeedbackEvents(
        simulationState.combatSkillFeedbackEvents,
        simulationState.tick
      ),
      entities: simulationState.entities.map((entity) =>
        entity.id === lockedPlayerEntity.id ? lockedPlayerEntity : entity
      ),
      entity: lockedPlayerEntity,
      worldSeed
    };
  }

  const nextTick = simulationState.tick + 1;
  const activeRunProgressionPhase = resolveRunProgressionPhase(nextTick);
  const pickupMaintainedState =
    profiling.spawnMode === "no-spawn"
      ? {
          entities: [...simulationState.entities],
          nextPickupSequence: simulationState.nextPickupSequence
        }
      : maintainNearbyPickupPopulation({
          canSpawnEntityAtPosition,
          createPickupEntity,
          enemyTimeStopUntilTick: simulationState.enemyTimeStopUntilTick,
          entities: simulationState.entities,
          nextPickupSequence: simulationState.nextPickupSequence,
          spawnMode: profiling.spawnMode,
          tick: nextTick,
          unlockedPickupKinds: choiceAppliedBuildState.metaProgression.unlockedPickupKinds,
          worldSeed
        });
  const spawnMaintainedState = maintainLocalHostilePopulation({
    canSpawnEntityAtPosition,
    command,
    createHostileEntity: (hostileSequence, worldPosition, spawnedAtTick) =>
      createHostileEntity(
        hostileSequence,
        worldPosition,
        spawnedAtTick,
        activeRunProgressionPhase.id,
        simulationState.runStats.bossDefeats,
        worldSeed
      ),
    entities: pickupMaintainedState.entities,
    localPopulationCap: isMiniBossBeatTick(nextTick)
      ? pickupMaintainedState.entities.filter(
          (entity) => entity.role === "hostile" && isAlive(entity)
        ).length + 1
      : hostileCombatContract.hostile.localPopulationCap +
        activeRunProgressionPhase.localPopulationCapBonus +
          resolveBossDefeatEscalation(simulationState.runStats.bossDefeats).localPopulationCapBonus,
    nextHostileSequence: simulationState.nextHostileSequence,
    spawnMode: profiling.spawnMode,
    spawnCooldownTicks: isMiniBossBeatTick(nextTick)
      ? 1
      : Math.max(
          1,
          Math.round(
            hostileCombatContract.hostile.spawnCooldownTicks *
              activeRunProgressionPhase.spawnCooldownMultiplier *
              resolveBossDefeatEscalation(simulationState.runStats.bossDefeats)
                .spawnCooldownMultiplier
          )
        ),
    spawnHeadingMemoryTicks: entityCombatPresentationContract.spawnHeadingMemoryTicks,
    tick: nextTick,
    worldSeed
  });
  const timeStopAppliedEntities =
    simulationState.enemyTimeStopUntilTick >= nextTick
      ? spawnMaintainedState.entities.map((entity) =>
          entity.role !== "hostile"
            ? entity
            : {
                ...entity,
                hostileControlState: {
                  frozenUntilTick: Math.max(
                    entity.hostileControlState?.frozenUntilTick ?? 0,
                    simulationState.enemyTimeStopUntilTick
                  )
                }
              }
        )
      : spawnMaintainedState.entities;
  const playerEntity = getPlayerEntity(timeStopAppliedEntities);
  const movedEntities = timeStopAppliedEntities.map((entity) =>
    resolveEntityMovement({
      dynamicColliders: timeStopAppliedEntities.filter(
        (colliderEntity) => colliderEntity.id !== entity.id && isDynamicCollider(colliderEntity)
      ),
      entity,
      intent: resolveEntityIntent({
        command,
        entity,
        getScriptedEntityPhase,
        playerEntity,
        tick: simulationState.tick,
        worldSeed
      }),
      tick: nextTick,
      worldSeed
    })
  );
  const missionActivatedState = activateMissionBossIfReached({
    bossDefeatCount: simulationState.runStats.bossDefeats,
    entities: movedEntities,
    missionState: normalizedMissionState,
    nextTick,
    playerEntity: getPlayerEntity(movedEntities),
    worldSeed
  });
  const attackResolvedState = resolveAutomaticPlayerAttack(
    missionActivatedState.entities.filter((entity) => !isDisabledPickupEntity(entity)),
    nextTick,
    choiceAppliedBuildState,
    simulationState.runStats,
    simulationState.pickupPulseUntilTick
  );
  const combatResolvedState = resolveHostileContactDamage({
    buildState: attackResolvedState.buildState,
    currentEmergencyAegisChargesSpent: simulationState.emergencyAegisChargesSpent,
    enemyDamageSuppressed: simulationState.enemyTimeStopUntilTick >= nextTick,
    entities: attackResolvedState.entities,
    previousEntities: spawnMaintainedState.entities,
    tick: nextTick,
    playerInvincible: profiling.playerInvincible
  });
  const compactedEntities = compactStackablePickupEntities(
    (() => {
      const defeatedHostiles = combatResolvedState.entities.filter(
        (entity) => entity.role === "hostile" && !isAlive(entity)
      );

      if (defeatedHostiles.length === 0) {
        return combatResolvedState.entities;
      }

      const droppedCrystalEntities = defeatedHostiles.flatMap((hostileEntity, hostileIndex) =>
        Array.from({ length: pickupContract.crystal.enemyDropCount }, (_, crystalIndex) =>
          createPickupEntity(
            pickupMaintainedState.nextPickupSequence +
              hostileIndex * pickupContract.crystal.enemyDropCount +
              crystalIndex,
            "crystal",
            hostileEntity.worldPosition,
            nextTick
          )
        )
      );
      const defeatedMiniBosses = defeatedHostiles.filter(
        (entity) =>
          entity.hostileProfileId !== undefined &&
          getHostileSpawnProfile(entity.hostileProfileId).isMiniBoss &&
          entity.id !== missionActivatedState.missionState.currentBossEntityId
      );
      const defeatedMissionBoss = defeatedHostiles.find(
        (entity) => entity.id === missionActivatedState.missionState.currentBossEntityId
      );
      const defeatedMissionBossStageIndex =
        defeatedMissionBoss === undefined ? null : parseMissionBossStageIndex(defeatedMissionBoss.id);
      const defeatedMissionBossStage =
        defeatedMissionBossStageIndex === null
          ? null
          : getMissionStage(defeatedMissionBossStageIndex, worldSeed);
      const missionDropEntities =
        defeatedMissionBoss !== undefined && defeatedMissionBossStage !== null
          ? [
              createPickupEntity(
                pickupMaintainedState.nextPickupSequence +
                  defeatedHostiles.length * pickupContract.crystal.enemyDropCount,
                "cache",
                defeatedMissionBoss.worldPosition,
                nextTick,
                1,
                {
                  lootArchiveId: defeatedMissionBossStage.rewardLootArchiveId,
                  missionItemStageIndex: defeatedMissionBossStageIndex,
                  tint: "#9ae5ff",
                  visualKind: defeatedMissionBossStage.rewardVisualKind
                }
              )
            ]
          : [];
      const miniBossDropEntities = defeatedMiniBosses.map((defeatedMiniBoss, miniBossIndex) =>
        createPickupEntity(
          pickupMaintainedState.nextPickupSequence +
            defeatedHostiles.length * pickupContract.crystal.enemyDropCount +
            missionDropEntities.length +
            miniBossIndex,
          "cache",
          defeatedMiniBoss.worldPosition,
          nextTick,
          1,
          {
            lootArchiveId: "cache-gift",
            tint: "#ffd79a"
          }
        )
      );

      return mergeNewPickupEntities(
        combatResolvedState.entities,
        [...droppedCrystalEntities, ...missionDropEntities, ...miniBossDropEntities]
      );
    })(),
    playerEntity,
    nextTick
  );
  const pickupResolvedState = resolvePickupCollection({
    buildState: attackResolvedState.buildState,
    enemyTimeStopUntilTick: simulationState.enemyTimeStopUntilTick,
    entities: compactedEntities,
    pickupPulseUntilTick: attackResolvedState.pickupPulseUntilTick,
    tick: nextTick,
    runStats: attackResolvedState.runStats
  });
  const defeatedHostiles = combatResolvedState.entities.filter(
    (entity) => entity.role === "hostile" && !isAlive(entity)
  );
  const defeatedHostileCount = defeatedHostiles.length;
  const defeatedBossCount = defeatedHostiles.filter((entity) =>
    entity.hostileProfileId ? getHostileSpawnProfile(entity.hostileProfileId).isMiniBoss : false
  ).length;
  const defeatedMissionBoss = defeatedHostiles.find(
    (entity) => entity.id === missionActivatedState.missionState.currentBossEntityId
  );
  const nextCreatureDefeatCounts = {
    ...pickupResolvedState.runStats.creatureDefeatCounts
  };

  for (const defeatedHostile of defeatedHostiles) {
    const creatureCodexId = resolveCreatureCodexIdFromVisualKind(defeatedHostile.visual.kind);

    if (!creatureCodexId) {
      continue;
    }

    nextCreatureDefeatCounts[creatureCodexId] =
      (nextCreatureDefeatCounts[creatureCodexId] ?? 0) + 1;
  }
  const survivingEntities = pickupResolvedState.entities.filter(
    (entity) => entity.role === "player" || isAlive(entity)
  );
  const nextPlayerEntity = getPlayerEntity(survivingEntities);
  const profiledPlayerEntity = profiling.playerInvincible
    ? {
        ...nextPlayerEntity,
        combat: {
          ...nextPlayerEntity.combat,
          currentHealth: nextPlayerEntity.combat.maxHealth
        }
      }
    : nextPlayerEntity;
  const nextBuildStateWithRewards = addPendingLevelUps(
    pickupResolvedState.buildState,
    Math.max(0, pickupResolvedState.runStats.currentLevel - simulationState.runStats.currentLevel),
    nextTick
  );
  const synchronizedPlayerEntity = syncPlayerAutomaticAttackToBuildState(
    profiledPlayerEntity,
    nextBuildStateWithRewards
  );
  const nextMissionItemCount = pickupResolvedState.runStats.missionItemsCollected;
  const missionItemCollectedThisTick =
    nextMissionItemCount > missionActivatedState.missionState.itemCount;
  const exitUnlocked = nextMissionItemCount >= 3;
  const missionCompleted =
    exitUnlocked &&
    distanceBetweenWorldPoints(
      synchronizedPlayerEntity.worldPosition,
      missionExitWorldPosition
    ) <= missionLoopContract.exitRadiusWorldUnits;
  const nextMissionState: MissionState = {
    activeStageIndex: Math.min(nextMissionItemCount, 2),
    completed: missionCompleted,
    currentBossEntityId:
      defeatedMissionBoss !== undefined ? null : missionActivatedState.missionState.currentBossEntityId,
    currentDroppedItemEntityId:
      missionItemCollectedThisTick
        ? null
        : missionActivatedState.missionState.currentDroppedItemEntityId !== null
          ? missionActivatedState.missionState.currentDroppedItemEntityId
        : defeatedMissionBoss !== undefined
          ? `entity:pickup:cache:${pickupMaintainedState.nextPickupSequence + defeatedHostiles.length * pickupContract.crystal.enemyDropCount}`
          : null,
    exitUnlocked,
    itemCount: nextMissionItemCount
  };

  return {
    buildState: nextBuildStateWithRewards,
    entities: survivingEntities.map((entity) =>
      entity.id === synchronizedPlayerEntity.id ? synchronizedPlayerEntity : entity
    ),
    entity: synchronizedPlayerEntity,
    floatingDamageNumbers: pruneFloatingDamageNumbers(
      [
        ...simulationState.floatingDamageNumbers,
        ...attackResolvedState.floatingDamageNumbers,
        ...combatResolvedState.floatingDamageNumbers
      ],
      nextTick
    ),
    combatSkillFeedbackEvents: pruneCombatSkillFeedbackEvents(
      [
        ...simulationState.combatSkillFeedbackEvents,
        ...attackResolvedState.combatSkillFeedbackEvents,
        ...combatResolvedState.combatSkillFeedbackEvents
      ],
      nextTick
    ),
    emergencyAegisChargesSpent: combatResolvedState.emergencyAegisChargesSpent,
    enemyTimeStopUntilTick: pickupResolvedState.enemyTimeStopUntilTick,
    missionState: nextMissionState,
    nextPickupSequence:
      pickupMaintainedState.nextPickupSequence +
      defeatedHostileCount * pickupContract.crystal.enemyDropCount +
      (defeatedMissionBoss ? 1 : 0) +
      defeatedHostiles.filter(
        (entity) =>
          entity.hostileProfileId !== undefined &&
          getHostileSpawnProfile(entity.hostileProfileId).isMiniBoss &&
          entity.id !== missionActivatedState.missionState.currentBossEntityId
      ).length,
    nextHostileSequence: spawnMaintainedState.nextHostileSequence,
    pickupPulseUntilTick: pickupResolvedState.pickupPulseUntilTick,
    runStats: {
      ...pickupResolvedState.runStats,
      bossDefeats: pickupResolvedState.runStats.bossDefeats + defeatedBossCount,
      creatureDefeatCounts: nextCreatureDefeatCounts,
      hostileDefeats: pickupResolvedState.runStats.hostileDefeats + defeatedHostileCount,
      missionBossDefeats:
        pickupResolvedState.runStats.missionBossDefeats + (defeatedMissionBoss ? 1 : 0),
      missionCompleted,
      worldProfileId: getWorldProfileBySeed(worldSeed)?.id ?? null
    },
    tick: nextTick,
    worldSeed
  };
};
