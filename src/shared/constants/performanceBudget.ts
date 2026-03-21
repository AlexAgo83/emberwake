import runtimePerformanceBudgetJson from "../config/runtimePerformanceBudget.json";

export const runtimePerformanceBudget = runtimePerformanceBudgetJson;

export const shellPerformanceBudget = {
  framePacing: runtimePerformanceBudget.framePacing,
  acceptableFrameTimeMs: runtimePerformanceBudget.simulation.acceptableFrameTimeMs,
  frameRateFloor: runtimePerformanceBudget.simulation.frameRateFloor,
  referenceDeviceClass: runtimePerformanceBudget.referenceDeviceClass,
  referenceViewport: runtimePerformanceBudget.referenceViewport,
  runtimeActivation: runtimePerformanceBudget.runtimeActivation,
  shellStartup: runtimePerformanceBudget.shellStartup
} as const;
