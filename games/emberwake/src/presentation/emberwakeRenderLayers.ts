export const emberwakeRenderBoundaryContract = {
  engineOwns: [
    "runtime-canvas-lifecycle",
    "pixi-adapter-components",
    "camera-viewport-application"
  ],
  gameOwns: [
    "scene-layer-order",
    "world-visual-composition",
    "entity-visual-composition",
    "future-runtime-feedback-layers"
  ],
  shellOwns: [
    "diagnostics-panels",
    "inspection-panels",
    "system-overlays-and-menus"
  ]
} as const;

export const emberwakeRuntimeRenderLayers = {
  world: {
    owner: "game",
    role: "terrain-grid-and-world-labels"
  },
  entities: {
    owner: "game",
    role: "entity-bodies-and-runtime-readable-labels"
  },
  feedback: {
    owner: "game",
    role: "future-combat-traversal-and-reactive-fx"
  }
} as const;

export type EmberwakeRuntimeRenderLayerId = keyof typeof emberwakeRuntimeRenderLayers;

export const emberwakeRuntimeRenderLayerOrder = [
  "world",
  "entities",
  "feedback"
] as const satisfies EmberwakeRuntimeRenderLayerId[];
