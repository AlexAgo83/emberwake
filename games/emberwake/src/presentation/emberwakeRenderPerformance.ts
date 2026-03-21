export type EmberwakeRenderSurfaceMode = "diagnostics" | "player";

export const emberwakeRenderPerformanceContract = {
  debugBudgeting: {
    chunkGrid: "degradable",
    chunkLabels: "degradable",
    entityLabels: "degradable"
  },
  runtimeSurfaceModes: {
    diagnostics: {
      chunkGridVisible: true,
      chunkLabelsVisible: true,
      entityLabelsVisible: true
    },
    player: {
      chunkGridVisible: false,
      chunkLabelsVisible: false,
      entityLabelsVisible: false
    }
  },
  sustainedRuntimeBudgets: {
    debugOverlayPolicy: "separate-from-player-runtime-budget",
    redrawPolicy: "prefer-static-world-fills-and-optional-debug-overlays",
    textPolicy: "runtime-text-is-debug-oriented-and-should-be-removed-from-player-mode"
  }
} as const;

