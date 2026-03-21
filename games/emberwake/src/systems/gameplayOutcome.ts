export type GameplayOutcomeKind =
  | "defeat"
  | "none"
  | "recovery"
  | "restart-needed"
  | "victory";

export type GameplayShellSceneHint = "defeat" | "none" | "pause" | "victory";

export type GameplayShellOutcome = {
  detail: string;
  emittedAtTick: number | null;
  kind: GameplayOutcomeKind;
  shellScene: GameplayShellSceneHint;
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
  shellScene: gameplayOutcomeContract.defaults.shellScene
});

