import type { EngineTiming } from "@engine/contracts/gameModule";
import type { EntitySimulationState } from "@game/runtime/entitySimulation";
import { resolveXpRequiredForLevel } from "@game/runtime/pickupContract";
import { resolveBuildSummary } from "@game/runtime/buildSystem";
import {
  createIdleGameplayOutcome,
  gameplayOutcomeContract
} from "./gameplayOutcome";
import type { GameplayShellOutcome } from "./gameplayOutcome";

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
  fusedActiveCount: number;
  fusionReadyCount: number;
  goldCollected: number;
  highestUnlockedTier: 0;
  healingKitsCollected: number;
  hostileDefeats: number;
  nextLevelXpRequired: number;
  passiveSlotsFilled: number;
  pendingChoiceCount: number;
  runtimeTicksSurvived: number;
  traversalDistanceWorldUnits: number;
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
  | "outcome.idle"
  | "progression.runtime-tick-advanced"
  | "progression.traversal-recorded"
  | "status-effects.stable";

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
    fusedActiveCount: 0,
    fusionReadyCount: 0,
    goldCollected: 0,
    highestUnlockedTier: 0,
    healingKitsCollected: 0,
    hostileDefeats: 0,
    nextLevelXpRequired: resolveXpRequiredForLevel(1),
    passiveSlotsFilled: 0,
    pendingChoiceCount: 0,
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
    fusedActiveCount: buildSummary.fusedActiveCount,
    fusionReadyCount: buildSummary.fusionReadyCount,
    goldCollected: simulationAfterUpdate.runStats.goldCollected,
    healingKitsCollected: simulationAfterUpdate.runStats.healingKitsCollected,
    hostileDefeats: simulationAfterUpdate.runStats.hostileDefeats,
    nextLevelXpRequired: resolveXpRequiredForLevel(simulationAfterUpdate.runStats.currentLevel),
    passiveSlotsFilled: buildSummary.passiveCount,
    pendingChoiceCount: buildSummary.pendingChoiceCount,
    runtimeTicksSurvived:
      previousState.progression.runtimeTicksSurvived + simulationTickDelta,
    traversalDistanceWorldUnits:
      previousState.progression.traversalDistanceWorldUnits + traversalDistanceWorldUnits
  };
  const outcome =
    simulationAfterUpdate.entity.combat.currentHealth <= 0
      ? {
          detail: "The hostile swarm overran the active run.",
          emittedAtTick: previousState.progression.runtimeTicksSurvived + simulationTickDelta,
          kind: "defeat" as const,
          shellScene: "defeat" as const
        }
      : previousState.outcome.kind === "none"
        ? createIdleGameplayOutcome()
        : previousState.outcome;
  const recentSignals = trimSignals([
    ...previousState.lifecycle.recentSignals,
    ...(simulationTickDelta > 0 ? (["autonomy.tick-advanced"] as GameplaySystemSignalId[]) : []),
    "combat.idle",
    "status-effects.stable",
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
  pendingChoiceCount: systemsState.progression.pendingChoiceCount
});
