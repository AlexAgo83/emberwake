export const runtimeContract = {
  coordinateSpaces: ["screen-space", "world-space", "chunk-space"],
  renderLayers: ["shell-overlay", "runtime-surface"],
  worldAssumption: "unbounded-scroll-ready"
} as const;
