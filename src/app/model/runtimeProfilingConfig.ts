export type RuntimeProfilingConfigDraft = {
  playerInvincible: boolean;
  spawnMode: "fixed-spawn-pressure" | "no-spawn" | "normal";
};

export const defaultRuntimeProfilingConfigDraft: RuntimeProfilingConfigDraft = {
  playerInvincible: false,
  spawnMode: "normal"
};

export const resolveRuntimeProfilingConfigDraft = (
  overrides?: Partial<RuntimeProfilingConfigDraft> | RuntimeProfilingConfigDraft
): RuntimeProfilingConfigDraft => ({
  ...defaultRuntimeProfilingConfigDraft,
  ...overrides
});
