export type ProfilingSpawnMode = "fixed-spawn-pressure" | "no-spawn" | "normal";

export type RuntimeProfilingConfig = {
  playerInvincible: boolean;
  spawnMode: ProfilingSpawnMode;
};

export const defaultRuntimeProfilingConfig: RuntimeProfilingConfig = {
  playerInvincible: false,
  spawnMode: "normal"
};

export const resolveRuntimeProfilingConfig = (
  overrides?: Partial<RuntimeProfilingConfig> | RuntimeProfilingConfig
): RuntimeProfilingConfig => ({
  ...defaultRuntimeProfilingConfig,
  ...overrides
});
