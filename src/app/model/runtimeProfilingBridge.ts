import type { RuntimeProfilingConfigDraft } from "./runtimeProfilingConfig";
import type { listRuntimeProfilingScenarios } from "./runtimeProfilingScenarios";

type RuntimeProfilingScenarioSummary = ReturnType<typeof listRuntimeProfilingScenarios>[number];

export type RuntimeAutomationStatus = {
  activeScenarioId: string | null;
  activeStepIndex: number;
  completedLoops: number;
  currentTick: number;
  elapsedTicks: number;
  isRunning: boolean;
  stepLabel: string | null;
};

export type RuntimeShellProfilingStatus = {
  activeScene: string;
  hasActiveSession: boolean;
  requestedScene: string;
};

export type RuntimeProfilingBridge = {
  getConfig?: () => RuntimeProfilingConfigDraft;
  getRuntimeStatus?: () => RuntimeAutomationStatus | null;
  getShellStatus?: () => RuntimeShellProfilingStatus;
  listScenarios?: () => RuntimeProfilingScenarioSummary[];
  resetConfig?: () => RuntimeProfilingConfigDraft;
  setConfig?: (partial: Partial<RuntimeProfilingConfigDraft>) => RuntimeProfilingConfigDraft;
  startScenario?: (request: {
    loop?: boolean;
    scenarioId: string;
    speedMultiplier?: 0.5 | 1 | 2 | 4;
  }) => RuntimeAutomationStatus | null;
  stopScenario?: () => RuntimeAutomationStatus | null;
};

declare global {
  interface Window {
    __EMBERWAKE_PROFILING__?: RuntimeProfilingBridge;
  }
}

export const patchRuntimeProfilingBridge = (partialBridge: RuntimeProfilingBridge) => {
  const currentBridge = globalThis.window.__EMBERWAKE_PROFILING__ ?? {};
  const nextBridge = {
    ...currentBridge,
    ...partialBridge
  };

  globalThis.window.__EMBERWAKE_PROFILING__ = nextBridge;
};

export const clearRuntimeProfilingBridge = (keys: Array<keyof RuntimeProfilingBridge>) => {
  const currentBridge = globalThis.window.__EMBERWAKE_PROFILING__;

  if (!currentBridge) {
    return;
  }

  const nextBridge = { ...currentBridge };

  for (const key of keys) {
    delete nextBridge[key];
  }

  globalThis.window.__EMBERWAKE_PROFILING__ =
    Object.keys(nextBridge).length === 0 ? undefined : nextBridge;
};

export {};
