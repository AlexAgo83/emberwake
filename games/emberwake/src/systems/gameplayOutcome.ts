import type { ActiveWeaponId, FusionId } from "@game/runtime/buildSystem";
import type { RunProgressionPhaseId } from "@game/runtime/runProgressionPhases";

export type GameplayOutcomeKind =
  | "defeat"
  | "none"
  | "recovery"
  | "restart-needed"
  | "victory";

export type GameplayShellSceneHint = "defeat" | "none" | "pause" | "victory";

export type SkillPerformanceSummary = {
  attacksTriggered: number;
  fusionId: FusionId | null;
  hostileDefeats: number;
  label: string;
  totalDamage: number;
  weaponId: ActiveWeaponId;
};

export type GameplayShellOutcome = {
  detail: string;
  emittedAtTick: number | null;
  kind: GameplayOutcomeKind;
  phaseId: RunProgressionPhaseId | null;
  shellScene: GameplayShellSceneHint;
  skillPerformanceSummaries: SkillPerformanceSummary[];
};

export const gameplayOutcomeContract = {
  defaults: {
    detail: "Runtime continues without a terminal gameplay outcome.",
    shellScene: "none"
  },
  shellMapping: {
    defeat: "defeat",
    none: "none",
    recovery: "pause",
    "restart-needed": "pause",
    victory: "victory"
  }
} as const;

export const createIdleGameplayOutcome = (): GameplayShellOutcome => ({
  detail: gameplayOutcomeContract.defaults.detail,
  emittedAtTick: null,
  kind: "none",
  phaseId: null,
  shellScene: gameplayOutcomeContract.defaults.shellScene,
  skillPerformanceSummaries: []
});
