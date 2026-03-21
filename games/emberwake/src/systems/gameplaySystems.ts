import type { EngineTiming } from "@engine/contracts/gameModule";
import type { EntitySimulationState } from "@game/runtime/entitySimulation";
import {
  createIdleGameplayOutcome,
  gameplayOutcomeContract
} from "./gameplayOutcome";
import type { GameplayShellOutcome } from "./gameplayOutcome";

export type CombatSystemState = {
  encounterState: "dormant";
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
  highestUnlockedTier: 0;
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
    highestUnlockedTier: 0,
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
  const autonomy = {
    ...previousState.autonomy,
    lastAutonomyTick: timing.tick + 1
  };
  const combat = previousState.combat;
  const statusEffects = previousState.statusEffects;
  const progression = {
    ...previousState.progression,
    runtimeTicksSurvived: timing.tick + 1,
    traversalDistanceWorldUnits:
      previousState.progression.traversalDistanceWorldUnits + traversalDistanceWorldUnits
  };
  const outcome = previousState.outcome.kind === "none"
    ? createIdleGameplayOutcome()
    : previousState.outcome;
  const recentSignals = trimSignals([
    ...previousState.lifecycle.recentSignals,
    "autonomy.tick-advanced",
    "combat.idle",
    "status-effects.stable",
    "progression.runtime-tick-advanced",
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
  progressionTicksSurvived: systemsState.progression.runtimeTicksSurvived,
  traversalDistanceWorldUnits: Number(
    systemsState.progression.traversalDistanceWorldUnits.toFixed(2)
  ),
  activeStatusEffects: systemsState.statusEffects.activeEffects.length
});
