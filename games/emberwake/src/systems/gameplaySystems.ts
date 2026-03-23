import type { EngineTiming } from "@engine/contracts/gameModule";
import type { EntitySimulationState } from "@game/runtime/entitySimulation";
import {
  listActiveWeaponDefinitions,
  resolveBuildDisplayLabel,
  resolveBuildSummary,
  type ActiveWeaponId,
  type FusionId,
  type PassiveItemId
} from "@game/runtime/buildSystem";
import { resolveXpRequiredForLevel } from "@game/runtime/pickupContract";
import {
  resolveCreatureCodexIdFromVisualKind,
  type CreatureCodexId
} from "@game/content/entities/creatureCodex";
import {
  resolveNextRunProgressionPhase,
  resolveRunProgressionPhase,
  type RunProgressionPhaseId
} from "@game/runtime/runProgressionPhases";
import {
  createIdleGameplayOutcome,
  gameplayOutcomeContract
} from "./gameplayOutcome";
import type { GameplayShellOutcome, SkillPerformanceSummary } from "./gameplayOutcome";

export type CombatSystemState = {
  encounterState: "active" | "dormant";
  lastCombatTick: number | null;
};

export type AutonomySystemState = {
  lastAutonomyTick: number;
  supportEntityPolicy: "scripted-runtime-bootstrap";
};

export type StatusEffectSystemState = {
  activeEffects: string[];
  maxEffectSlots: number;
};

export type ProgressionSystemState = {
  activeSlotsFilled: number;
  crystalsCollected: number;
  currentLevel: number;
  currentXp: number;
  discoveredActiveWeaponIds: ActiveWeaponId[];
  discoveredCreatureIds: CreatureCodexId[];
  discoveredFusionIds: FusionId[];
  discoveredPassiveItemIds: PassiveItemId[];
  discoveredSkillIds: string[];
  phaseLabel: string;
  phaseStartsAtTick: number;
  phaseTone: "alert" | "cold" | "warm";
  fusedActiveCount: number;
  fusionReadyCount: number;
  goldCollected: number;
  highestUnlockedTier: 0;
  healingKitsCollected: number;
  hostileDefeats: number;
  nextPhaseStartsAtTick: number | null;
  nextLevelXpRequired: number;
  passiveSlotsFilled: number;
  pendingChoiceCount: number;
  runPhaseId: RunProgressionPhaseId;
  runtimeTicksSurvived: number;
  traversalDistanceWorldUnits: number;
  creatureDefeatCounts: Partial<Record<CreatureCodexId, number>>;
};

export type EmberwakeGameplaySystemsState = {
  autonomy: AutonomySystemState;
  combat: CombatSystemState;
  lifecycle: {
    lastCompletedPhase: GameplaySystemPhaseId;
    recentSignals: GameplaySystemSignalId[];
  };
  outcome: GameplayShellOutcome;
  progression: ProgressionSystemState;
  statusEffects: StatusEffectSystemState;
};

export type GameplaySystemPhaseId =
  | "autonomy"
  | "combat"
  | "outcomes"
  | "progression"
  | "status-effects";

export type GameplaySystemSignalId =
  | "autonomy.tick-advanced"
  | "combat.idle"
  | "phase.escalated"
  | "outcome.idle"
  | "progression.runtime-tick-advanced"
  | "progression.traversal-recorded"
  | "status-effects.stable";

const buildDiscoveredSkillIds = ({
  activeWeaponIds,
  fusionIds,
  passiveItemIds
}: {
  activeWeaponIds: readonly ActiveWeaponId[];
  fusionIds: readonly FusionId[];
  passiveItemIds: readonly PassiveItemId[];
}) =>
  [
    ...activeWeaponIds.map((activeWeaponId) => `active:${activeWeaponId}`),
    ...passiveItemIds.map((passiveItemId) => `passive:${passiveItemId}`),
    ...fusionIds.map((fusionId) => `fusion:${fusionId}`)
  ];

const createSkillPerformanceSummaries = (
  simulationAfterUpdate: EntitySimulationState
): SkillPerformanceSummary[] =>
  listActiveWeaponDefinitions()
    .map((weaponDefinition) => {
      const finalActiveSlot = simulationAfterUpdate.buildState.activeSlots.find(
        (activeSlot) => activeSlot.weaponId === weaponDefinition.id
      );
      const performance = simulationAfterUpdate.runStats.activeWeaponPerformance[weaponDefinition.id];

      return {
        attacksTriggered: performance.attacksTriggered,
        fusionId: finalActiveSlot?.fusionId ?? null,
        hostileDefeats: performance.hostileDefeats,
        label:
          finalActiveSlot !== undefined
            ? resolveBuildDisplayLabel(simulationAfterUpdate.buildState, finalActiveSlot)
            : weaponDefinition.label,
        totalDamage: performance.totalDamage,
        weaponId: weaponDefinition.id
      };
    })
    .filter((summary) => summary.attacksTriggered > 0 || summary.totalDamage > 0)
    .sort((leftSummary, rightSummary) => {
      if (rightSummary.totalDamage !== leftSummary.totalDamage) {
        return rightSummary.totalDamage - leftSummary.totalDamage;
      }

      if (rightSummary.hostileDefeats !== leftSummary.hostileDefeats) {
        return rightSummary.hostileDefeats - leftSummary.hostileDefeats;
      }

      return rightSummary.attacksTriggered - leftSummary.attacksTriggered;
    });

export const gameplaySystemsContract = {
  ownership: {
    autonomy: "game-update-layer",
    combat: "game-update-layer",
    progression: "game-state-and-persistence-boundary",
    statusEffects: "game-state-and-content-boundary"
  },
  seams: {
    content: "game-owned-content-contracts-feed-system-rules",
    persistence: "progression-and-status-effects-are-future-persistent-slices",
    presentation: "systems-derive-diagnostics-and-presentation-data-but-do-not-own-render-adapters",
    simulation: "entity-simulation-remains-a-runtime-slice-that-systems-observe-and-enrich"
  },
  phaseOrder: [
    "autonomy",
    "combat",
    "status-effects",
    "progression",
    "outcomes"
  ] as GameplaySystemPhaseId[],
  signalPosture: "narrow-phase-signals-before-any-broader-event-substrate",
  outcomeContract: gameplayOutcomeContract
} as const;

export const createInitialGameplaySystemsState = (): EmberwakeGameplaySystemsState => ({
  autonomy: {
    lastAutonomyTick: 0,
    supportEntityPolicy: "scripted-runtime-bootstrap"
  },
  combat: {
    encounterState: "dormant",
    lastCombatTick: null
  },
  lifecycle: {
    lastCompletedPhase: "outcomes",
    recentSignals: ["outcome.idle"]
  },
  outcome: createIdleGameplayOutcome(),
  progression: {
    activeSlotsFilled: 1,
    crystalsCollected: 0,
    currentLevel: 1,
    currentXp: 0,
    creatureDefeatCounts: {},
    discoveredActiveWeaponIds: ["ash-lash"],
    discoveredCreatureIds: [],
    discoveredFusionIds: [],
    discoveredPassiveItemIds: [],
    discoveredSkillIds: ["active:ash-lash"],
    phaseLabel: resolveRunProgressionPhase(0).label,
    phaseStartsAtTick: resolveRunProgressionPhase(0).startsAtTick,
    phaseTone: resolveRunProgressionPhase(0).tone,
    fusedActiveCount: 0,
    fusionReadyCount: 0,
    goldCollected: 0,
    highestUnlockedTier: 0,
    healingKitsCollected: 0,
    hostileDefeats: 0,
    nextPhaseStartsAtTick: resolveNextRunProgressionPhase(0)?.startsAtTick ?? null,
    nextLevelXpRequired: resolveXpRequiredForLevel(1),
    passiveSlotsFilled: 0,
    pendingChoiceCount: 0,
    runPhaseId: resolveRunProgressionPhase(0).id,
    runtimeTicksSurvived: 0,
    traversalDistanceWorldUnits: 0
  },
  statusEffects: {
    activeEffects: [],
    maxEffectSlots: 4
  }
});

const trimSignals = (signals: GameplaySystemSignalId[]) => signals.slice(-4);

export const advanceGameplaySystemsState = ({
  previousState,
  simulationAfterUpdate,
  simulationBeforeUpdate,
  timing
}: {
  previousState: EmberwakeGameplaySystemsState;
  simulationAfterUpdate: EntitySimulationState;
  simulationBeforeUpdate: EntitySimulationState;
  timing: EngineTiming;
}): EmberwakeGameplaySystemsState => {
  const deltaX =
    simulationAfterUpdate.entity.worldPosition.x - simulationBeforeUpdate.entity.worldPosition.x;
  const deltaY =
    simulationAfterUpdate.entity.worldPosition.y - simulationBeforeUpdate.entity.worldPosition.y;
  const traversalDistanceWorldUnits = Math.hypot(deltaX, deltaY);
  const simulationTickDelta = Math.max(0, simulationAfterUpdate.tick - simulationBeforeUpdate.tick);
  const buildSummary = resolveBuildSummary(simulationAfterUpdate.buildState);
  const runtimeTicksSurvived =
    previousState.progression.runtimeTicksSurvived + simulationTickDelta;
  const activeRunPhase = resolveRunProgressionPhase(runtimeTicksSurvived);
  const nextRunPhase = resolveNextRunProgressionPhase(runtimeTicksSurvived);
  const discoveredActiveWeaponIds = simulationAfterUpdate.buildState.activeSlots.map(
    (activeSlot) => activeSlot.weaponId
  );
  const discoveredPassiveItemIds = simulationAfterUpdate.buildState.passiveSlots.map(
    (passiveSlot) => passiveSlot.passiveId
  );
  const discoveredFusionIds = simulationAfterUpdate.buildState.activeSlots.flatMap((activeSlot) =>
    activeSlot.fusionId ? [activeSlot.fusionId] : []
  );
  const discoveredCreatureIds = Array.from(
    new Set([
      ...previousState.progression.discoveredCreatureIds,
      ...simulationAfterUpdate.entities.flatMap((entity) => {
        const creatureCodexId =
          entity.role === "hostile"
            ? resolveCreatureCodexIdFromVisualKind(entity.visual.kind)
            : null;

        return creatureCodexId ? [creatureCodexId] : [];
      })
    ])
  );
  const autonomy = {
    ...previousState.autonomy,
    lastAutonomyTick: previousState.autonomy.lastAutonomyTick + simulationTickDelta
  };
  const hostileCount = simulationAfterUpdate.entities.filter(
    (entity) => entity.role === "hostile"
  ).length;
  const combat: CombatSystemState = {
    encounterState: hostileCount > 0 ? "active" : "dormant",
    lastCombatTick: hostileCount > 0 ? timing.tick + 1 : previousState.combat.lastCombatTick
  };
  const statusEffects = previousState.statusEffects;
  const progression = {
    ...previousState.progression,
    activeSlotsFilled: buildSummary.activeCount,
    crystalsCollected: simulationAfterUpdate.runStats.crystalsCollected,
    currentLevel: simulationAfterUpdate.runStats.currentLevel,
    currentXp: simulationAfterUpdate.runStats.currentXp,
    creatureDefeatCounts: simulationAfterUpdate.runStats.creatureDefeatCounts,
    discoveredActiveWeaponIds,
    discoveredCreatureIds,
    discoveredFusionIds,
    discoveredPassiveItemIds,
    discoveredSkillIds: buildDiscoveredSkillIds({
      activeWeaponIds: discoveredActiveWeaponIds,
      fusionIds: discoveredFusionIds,
      passiveItemIds: discoveredPassiveItemIds
    }),
    phaseLabel: activeRunPhase.label,
    phaseStartsAtTick: activeRunPhase.startsAtTick,
    phaseTone: activeRunPhase.tone,
    fusedActiveCount: buildSummary.fusedActiveCount,
    fusionReadyCount: buildSummary.fusionReadyCount,
    goldCollected: simulationAfterUpdate.runStats.goldCollected,
    healingKitsCollected: simulationAfterUpdate.runStats.healingKitsCollected,
    hostileDefeats: simulationAfterUpdate.runStats.hostileDefeats,
    nextPhaseStartsAtTick: nextRunPhase?.startsAtTick ?? null,
    nextLevelXpRequired: resolveXpRequiredForLevel(simulationAfterUpdate.runStats.currentLevel),
    passiveSlotsFilled: buildSummary.passiveCount,
    pendingChoiceCount: buildSummary.pendingChoiceCount,
    runPhaseId: activeRunPhase.id,
    runtimeTicksSurvived,
    traversalDistanceWorldUnits:
      previousState.progression.traversalDistanceWorldUnits + traversalDistanceWorldUnits
  };
  const outcome =
    simulationAfterUpdate.entity.combat.currentHealth <= 0
      ? {
          detail: "The hostile swarm overran the active run.",
          emittedAtTick: runtimeTicksSurvived,
          kind: "defeat" as const,
          phaseId: activeRunPhase.id,
          shellScene: "defeat" as const
          ,
          skillPerformanceSummaries: createSkillPerformanceSummaries(simulationAfterUpdate)
        }
      : previousState.outcome.kind === "none"
        ? createIdleGameplayOutcome()
        : previousState.outcome;
  const recentSignals = trimSignals([
    ...previousState.lifecycle.recentSignals,
    ...(simulationTickDelta > 0 ? (["autonomy.tick-advanced"] as GameplaySystemSignalId[]) : []),
    "combat.idle",
    "status-effects.stable",
    ...(activeRunPhase.id !== previousState.progression.runPhaseId
      ? (["phase.escalated"] as GameplaySystemSignalId[])
      : []),
    ...(simulationTickDelta > 0
      ? (["progression.runtime-tick-advanced"] as GameplaySystemSignalId[])
      : []),
    ...(traversalDistanceWorldUnits > 0 ? (["progression.traversal-recorded"] as GameplaySystemSignalId[]) : []),
    "outcome.idle"
  ]);

  return {
    autonomy,
    combat,
    lifecycle: {
      lastCompletedPhase: "outcomes",
      recentSignals
    },
    outcome,
    progression,
    statusEffects
  };
};

export const createGameplaySystemDiagnostics = (
  systemsState: EmberwakeGameplaySystemsState
) => ({
  autonomyTick: systemsState.autonomy.lastAutonomyTick,
  combatState: systemsState.combat.encounterState,
  gameplayOutcome: systemsState.outcome.kind,
  gameplayPhaseOrder: gameplaySystemsContract.phaseOrder.join(" -> "),
  gameplaySignals: systemsState.lifecycle.recentSignals.join(", "),
  crystalsCollected: systemsState.progression.crystalsCollected,
  currentLevel: systemsState.progression.currentLevel,
  currentXp: systemsState.progression.currentXp,
  goldCollected: systemsState.progression.goldCollected,
  hostileDefeats: systemsState.progression.hostileDefeats,
  nextLevelXpRequired: systemsState.progression.nextLevelXpRequired,
  runPhaseId: systemsState.progression.runPhaseId,
  runPhaseLabel: systemsState.progression.phaseLabel,
  progressionTicksSurvived: systemsState.progression.runtimeTicksSurvived,
  traversalDistanceWorldUnits: Number(
    systemsState.progression.traversalDistanceWorldUnits.toFixed(2)
  ),
  activeStatusEffects: systemsState.statusEffects.activeEffects.length
  ,
  activeSlotsFilled: systemsState.progression.activeSlotsFilled,
  fusedActiveCount: systemsState.progression.fusedActiveCount,
  fusionReadyCount: systemsState.progression.fusionReadyCount,
  passiveSlotsFilled: systemsState.progression.passiveSlotsFilled,
  pendingChoiceCount: systemsState.progression.pendingChoiceCount,
  discoveredCreatureCount: systemsState.progression.discoveredCreatureIds.length
});
