import type { EngineTiming } from "@engine/contracts/gameModule";
import type { EntitySimulationState } from "@game/runtime/entitySimulation";

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
  progression: ProgressionSystemState;
  statusEffects: StatusEffectSystemState;
};

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
  }
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

  return {
    autonomy: {
      ...previousState.autonomy,
      lastAutonomyTick: timing.tick + 1
    },
    combat: previousState.combat,
    progression: {
      ...previousState.progression,
      runtimeTicksSurvived: timing.tick + 1,
      traversalDistanceWorldUnits:
        previousState.progression.traversalDistanceWorldUnits + traversalDistanceWorldUnits
    },
    statusEffects: previousState.statusEffects
  };
};

export const createGameplaySystemDiagnostics = (
  systemsState: EmberwakeGameplaySystemsState
) => ({
  autonomyTick: systemsState.autonomy.lastAutonomyTick,
  combatState: systemsState.combat.encounterState,
  progressionTicksSurvived: systemsState.progression.runtimeTicksSurvived,
  traversalDistanceWorldUnits: Number(
    systemsState.progression.traversalDistanceWorldUnits.toFixed(2)
  ),
  activeStatusEffects: systemsState.statusEffects.activeEffects.length
});
