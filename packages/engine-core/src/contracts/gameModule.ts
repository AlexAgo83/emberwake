export type EngineInputSource = "keyboard" | "none" | "touch";

export type EngineInputFrame = {
  buttons: Record<string, boolean>;
  debug: {
    modifierActive: boolean;
  };
  movement: {
    active: boolean;
    magnitude: number;
    source: EngineInputSource;
    vector: {
      x: number;
      y: number;
    };
  };
  pointer: {
    pressed: boolean;
    primaryScreenPoint: {
      x: number;
      y: number;
    } | null;
    primaryWorldPoint: {
      x: number;
      y: number;
    } | null;
  };
};

export type EngineTiming = {
  deltaMs: number;
  fixedStepMs: number;
  nowMs: number;
  tick: number;
};

export type EngineRenderChunk = {
  id: string;
  variant?: string;
  x: number;
  y: number;
};

export type EngineRenderEntity = {
  id: string;
  kind: string;
  orientation: number;
  tint?: number;
  visible?: boolean;
  worldPosition: {
    x: number;
    y: number;
  };
  zIndex?: number;
};

export type EnginePresentationModel = {
  cameraTarget?: {
    mode?: string;
    worldPosition: {
      x: number;
      y: number;
    };
  };
  diagnostics?: Record<string, unknown>;
  entities: EngineRenderEntity[];
  overlays?: Record<string, unknown>;
  world: {
    visibleChunks: EngineRenderChunk[];
  };
};

export type GameModule<
  TGameState,
  TGameAction,
  TGameInit = void,
  TGameContext = void
> = {
  initialize: (options: {
    context: TGameContext;
    init: TGameInit;
  }) => TGameState;
  mapInput: (options: {
    context: TGameContext;
    input: EngineInputFrame;
    state: TGameState;
  }) => TGameAction;
  present: (options: {
    context: TGameContext;
    state: TGameState;
  }) => EnginePresentationModel;
  update: (options: {
    action: TGameAction;
    context: TGameContext;
    state: TGameState;
    timing: EngineTiming;
  }) => TGameState;
};
