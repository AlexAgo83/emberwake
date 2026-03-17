export const shellPerformanceBudget = {
  acceptableFrameTimeMs: 1000 / 55,
  frameRateFloor: 55,
  referenceDeviceClass: "mobile-shell",
  referenceViewport: {
    height: 844,
    width: 390
  }
} as const;
