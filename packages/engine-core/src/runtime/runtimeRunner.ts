import type {
  EngineInputFrame,
  EnginePresentationModel,
  EngineTiming,
  GameModule
} from "../contracts/gameModule";

export type RuntimeRunnerMetrics = {
  accumulatorMs: number;
  droppedFrameTimeMsTotal: number;
  droppedSimulationDebtMsTotal: number;
  fixedStepMs: number;
  framesWithDroppedFrameTime: number;
  framesWithDroppedSimulationDebt: number;
  framesWithCatchUp: number;
  frameTimeMs: number;
  fps: number;
  isPaused: boolean;
  maxDroppedFrameTimeMs: number;
  maxDroppedSimulationDebtMs: number;
  maxFrameTimeMs: number;
  maxCatchUpStepsPerFrame: number;
  schedulerMode: "internal-raf" | "pixi-ticker-master";
  simulationStepsLastFrame: number;
  simulationStepsTotal: number;
  speedMultiplier: number;
  visualFrameCount: number;
};

export type RuntimeRunnerSnapshot<TGameState> = {
  presentation: EnginePresentationModel;
  runtime: RuntimeRunnerMetrics;
  state: TGameState;
  timing: EngineTiming;
};

type RuntimeRunnerOptions<TGameState, TGameAction, TGameInit = void, TGameContext = void> = {
  context: TGameContext;
  fixedStepMs: number;
  init: TGameInit;
  maxCatchUpStepsPerFrame: number;
  module: GameModule<TGameState, TGameAction, TGameInit, TGameContext>;
};

const fallbackRequestFrame = (callback: FrameRequestCallback) =>
  globalThis.setTimeout(() => {
    callback(Date.now());
  }, 16);

const requestFrame: (callback: FrameRequestCallback) => number | ReturnType<typeof setTimeout> =
  typeof globalThis.requestAnimationFrame === "function"
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : fallbackRequestFrame;

const cancelFrame = (handle: number | ReturnType<typeof setTimeout>) => {
  if (typeof globalThis.cancelAnimationFrame === "function" && typeof handle === "number") {
    globalThis.cancelAnimationFrame(handle);
    return;
  }

  globalThis.clearTimeout(handle);
};

export const createIdleEngineInputFrame = (): EngineInputFrame => ({
  buttons: {},
  debug: {
    modifierActive: false
  },
  movement: {
    active: false,
    magnitude: 0,
    source: "none",
    vector: {
      x: 0,
      y: 0
    }
  },
  pointer: {
    pressed: false,
    primaryScreenPoint: null,
    primaryWorldPoint: null
  }
});

export class RuntimeRunner<TGameState, TGameAction, TGameInit = void, TGameContext = void> {
  private accumulatorMs = 0;
  private currentInput = createIdleEngineInputFrame();
  private droppedFrameTimeMsTotal = 0;
  private droppedSimulationDebtMsTotal = 0;
  private frameHandle: ReturnType<typeof requestFrame> | null = null;
  private framesWithDroppedFrameTime = 0;
  private framesWithDroppedSimulationDebt = 0;
  private framesWithCatchUp = 0;
  private fps = 0;
  private isPaused = false;
  private listeners = new Set<(snapshot: RuntimeRunnerSnapshot<TGameState>) => void>();
  private maxDroppedFrameTimeMs = 0;
  private maxDroppedSimulationDebtMs = 0;
  private maxFrameTimeMs: number;
  private previousTimestamp: number | null = null;
  private queuedStepCount = 0;
  private runtime: RuntimeRunnerMetrics;
  private running = false;
  private schedulerMode: RuntimeRunnerMetrics["schedulerMode"] = "internal-raf";
  private simulationStepsLastFrame = 0;
  private simulationStepsTotal = 0;
  private speedMultiplier = 1;
  private state: TGameState;
  private tick = 0;
  private visualFrameCount = 0;
  private readonly context: TGameContext;
  private readonly fixedStepMs: number;
  private readonly maxCatchUpStepsPerFrame: number;
  private readonly module: GameModule<TGameState, TGameAction, TGameInit, TGameContext>;

  constructor({
    context,
    fixedStepMs,
    init,
    maxCatchUpStepsPerFrame,
    module
  }: RuntimeRunnerOptions<TGameState, TGameAction, TGameInit, TGameContext>) {
    this.context = context;
    this.fixedStepMs = fixedStepMs;
    this.maxCatchUpStepsPerFrame = maxCatchUpStepsPerFrame;
    this.module = module;
    this.maxFrameTimeMs = fixedStepMs;
    this.state = module.initialize({
      context,
      init
    });
    this.runtime = {
      accumulatorMs: 0,
      droppedFrameTimeMsTotal: 0,
      droppedSimulationDebtMsTotal: 0,
      fixedStepMs,
      framesWithDroppedFrameTime: 0,
      framesWithDroppedSimulationDebt: 0,
      framesWithCatchUp: 0,
      fps: 0,
      frameTimeMs: fixedStepMs,
      isPaused: false,
      maxDroppedFrameTimeMs: 0,
      maxDroppedSimulationDebtMs: 0,
      maxFrameTimeMs: fixedStepMs,
      maxCatchUpStepsPerFrame,
      schedulerMode: this.schedulerMode,
      simulationStepsLastFrame: 0,
      simulationStepsTotal: 0,
      speedMultiplier: 1,
      visualFrameCount: 0
    };
  }

  subscribe(listener: (snapshot: RuntimeRunnerSnapshot<TGameState>) => void) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): RuntimeRunnerSnapshot<TGameState> {
    return {
      presentation: this.module.present({
        context: this.context,
        state: this.state
      }),
      runtime: this.runtime,
      state: this.state,
      timing: this.getTiming()
    };
  }

  setInputFrame(inputFrame: EngineInputFrame) {
    this.currentInput = inputFrame;
  }

  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.previousTimestamp = null;
    this.frameHandle = requestFrame(this.handleAnimationFrame);
  }

  stop() {
    this.running = false;

    if (this.frameHandle !== null) {
      cancelFrame(this.frameHandle);
      this.frameHandle = null;
    }
  }

  resume() {
    this.isPaused = false;
    this.syncRuntimeState();
    this.emit();
  }

  pause() {
    this.isPaused = true;
    this.syncRuntimeState();
    this.emit();
  }

  togglePaused() {
    this.isPaused = !this.isPaused;
    this.syncRuntimeState();
    this.emit();
  }

  setSpeedMultiplier(speedMultiplier: number) {
    this.speedMultiplier = speedMultiplier;
    this.syncRuntimeState();
    this.emit();
  }

  stepOnce() {
    this.queuedStepCount += 1;
    this.isPaused = true;
    this.syncRuntimeState();
    this.emit();
  }

  advanceFrame(
    timestamp: number,
    schedulerMode: RuntimeRunnerMetrics["schedulerMode"] = this.schedulerMode
  ) {
    this.schedulerMode = schedulerMode;

    if (this.previousTimestamp === null) {
      this.previousTimestamp = timestamp;
    }

    const rawFrameTimeMs = timestamp - this.previousTimestamp;
    this.previousTimestamp = timestamp;
    this.visualFrameCount += 1;
    const clampedFrameTimeMs = Math.min(rawFrameTimeMs, this.fixedStepMs * 4);
    const droppedFrameTimeMs = Math.max(0, rawFrameTimeMs - clampedFrameTimeMs);
    const speedAdjustedFrameTimeMs = this.isPaused ? 0 : clampedFrameTimeMs * this.speedMultiplier;
    const maxAccumulatorMs = this.fixedStepMs * this.maxCatchUpStepsPerFrame;
    const unclampedAccumulatorMs = this.accumulatorMs + speedAdjustedFrameTimeMs;
    const droppedSimulationDebtMs = Math.max(0, unclampedAccumulatorMs - maxAccumulatorMs);

    // Clamp accumulation so a slow frame cannot create unbounded catch-up debt.
    this.accumulatorMs = Math.min(unclampedAccumulatorMs, maxAccumulatorMs);

    if (droppedFrameTimeMs > 0) {
      this.framesWithDroppedFrameTime += 1;
      this.droppedFrameTimeMsTotal += droppedFrameTimeMs;
      this.maxDroppedFrameTimeMs = Math.max(this.maxDroppedFrameTimeMs, droppedFrameTimeMs);
    }

    if (droppedSimulationDebtMs > 0) {
      this.framesWithDroppedSimulationDebt += 1;
      this.droppedSimulationDebtMsTotal += droppedSimulationDebtMs;
      this.maxDroppedSimulationDebtMs = Math.max(
        this.maxDroppedSimulationDebtMs,
        droppedSimulationDebtMs
      );
    }

    this.simulationStepsLastFrame = 0;

    if (this.isPaused && this.queuedStepCount > 0) {
      while (this.queuedStepCount > 0) {
        this.applyStep();
        this.queuedStepCount -= 1;
        this.simulationStepsLastFrame += 1;
        this.simulationStepsTotal += 1;
      }
    } else {
      while (
        this.accumulatorMs >= this.fixedStepMs &&
        this.simulationStepsLastFrame < this.maxCatchUpStepsPerFrame
      ) {
        this.applyStep();
        this.accumulatorMs -= this.fixedStepMs;
        this.simulationStepsLastFrame += 1;
        this.simulationStepsTotal += 1;
      }
    }

    if (this.simulationStepsLastFrame > 1) {
      this.framesWithCatchUp += 1;
    }

    const instantaneousFps = rawFrameTimeMs > 0 ? 1000 / rawFrameTimeMs : this.fps;

    this.fps =
      this.fps === 0 ? instantaneousFps : this.fps * 0.85 + instantaneousFps * 0.15;

    this.maxFrameTimeMs = Math.max(
      this.maxFrameTimeMs,
      rawFrameTimeMs || this.runtime.frameTimeMs
    );

    this.runtime = {
      accumulatorMs: this.accumulatorMs,
      droppedFrameTimeMsTotal: this.droppedFrameTimeMsTotal,
      droppedSimulationDebtMsTotal: this.droppedSimulationDebtMsTotal,
      fixedStepMs: this.fixedStepMs,
      framesWithDroppedFrameTime: this.framesWithDroppedFrameTime,
      framesWithDroppedSimulationDebt: this.framesWithDroppedSimulationDebt,
      framesWithCatchUp: this.framesWithCatchUp,
      fps: this.fps,
      frameTimeMs: rawFrameTimeMs || this.runtime.frameTimeMs,
      isPaused: this.isPaused,
      maxDroppedFrameTimeMs: this.maxDroppedFrameTimeMs,
      maxDroppedSimulationDebtMs: this.maxDroppedSimulationDebtMs,
      maxFrameTimeMs: this.maxFrameTimeMs,
      maxCatchUpStepsPerFrame: this.maxCatchUpStepsPerFrame,
      schedulerMode: this.schedulerMode,
      simulationStepsLastFrame: this.simulationStepsLastFrame,
      simulationStepsTotal: this.simulationStepsTotal,
      speedMultiplier: this.speedMultiplier,
      visualFrameCount: this.visualFrameCount
    };

    this.emit();
  }

  private readonly handleAnimationFrame = (timestamp: number) => {
    this.advanceFrame(timestamp, "internal-raf");

    if (this.running) {
      this.frameHandle = requestFrame(this.handleAnimationFrame);
    }
  };

  private applyStep() {
    const action = this.module.mapInput({
      context: this.context,
      input: this.currentInput,
      state: this.state
    });

    this.state = this.module.update({
      action,
      context: this.context,
      state: this.state,
      timing: this.getTiming()
    });
    this.tick += 1;
  }

  private getTiming(): EngineTiming {
    return {
      deltaMs: this.fixedStepMs,
      fixedStepMs: this.fixedStepMs,
      nowMs: this.tick * this.fixedStepMs,
      tick: this.tick
    };
  }

  private syncRuntimeState() {
    this.runtime = {
      ...this.runtime,
      accumulatorMs: this.accumulatorMs,
      droppedFrameTimeMsTotal: this.droppedFrameTimeMsTotal,
      droppedSimulationDebtMsTotal: this.droppedSimulationDebtMsTotal,
      framesWithDroppedFrameTime: this.framesWithDroppedFrameTime,
      framesWithDroppedSimulationDebt: this.framesWithDroppedSimulationDebt,
      framesWithCatchUp: this.framesWithCatchUp,
      isPaused: this.isPaused,
      maxDroppedFrameTimeMs: this.maxDroppedFrameTimeMs,
      maxDroppedSimulationDebtMs: this.maxDroppedSimulationDebtMs,
      maxFrameTimeMs: this.maxFrameTimeMs,
      schedulerMode: this.schedulerMode,
      simulationStepsLastFrame: this.simulationStepsLastFrame,
      simulationStepsTotal: this.simulationStepsTotal,
      speedMultiplier: this.speedMultiplier,
      visualFrameCount: this.visualFrameCount
    };
  }

  private emit() {
    const snapshot = this.getSnapshot();

    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

export const createRuntimeRunner = <
  TGameState,
  TGameAction,
  TGameInit = void,
  TGameContext = void
>(
  options: RuntimeRunnerOptions<TGameState, TGameAction, TGameInit, TGameContext>
) => new RuntimeRunner(options);
