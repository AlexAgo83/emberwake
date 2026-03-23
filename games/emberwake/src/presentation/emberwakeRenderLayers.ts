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
    "future-runtime-feedback-layers",
    "player-vs-diagnostics-visual-budgeting"
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
    role: "terrain-base-plus-optional-debug-grid-and-labels"
  },
  entities: {
    owner: "game",
    role: "entity-bodies-with-optional-debug-labels"
  },
  feedback: {
    owner: "game",
    role: "transient-combat-skill-feedback-and-reactive-fx"
  }
} as const;

export type EmberwakeRuntimeRenderLayerId = keyof typeof emberwakeRuntimeRenderLayers;

export const emberwakeRuntimeRenderLayerOrder = [
  "world",
  "entities",
  "feedback"
] as const satisfies EmberwakeRuntimeRenderLayerId[];
