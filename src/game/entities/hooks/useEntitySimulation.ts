import { useEffect, useMemo, useRef, useState } from "react";

import {
  entitySimulationContract
} from "@game/runtime/emberwakeGameModule";
import type { EnginePresentationModel } from "@engine/contracts/gameModule";
import type { RuntimeRunnerSnapshot } from "@engine/runtime/runtimeRunner";
import type { EmberwakeGameState } from "@game/runtime/emberwakeGameModule";
import {
  createEmberwakeRuntimeRunner,
  createEngineInputFrameFromControlState
} from "@game/runtime/emberwakeRuntimeRunner";
import type { EntitySimulationState } from "../model/entitySimulation";
import type { SimulationSpeedOption } from "../model/entitySimulation";
import type { SingleEntityControlState } from "../../input/model/singleEntityControlContract";

type UseEntitySimulationOptions = {
  controlState?: SingleEntityControlState;
  initialGameState?: EmberwakeGameState;
  sessionRevision?: number;
};

type SimulationRuntimeMetrics = {
  accumulatorMs: number;
  fixedStepMs: number;
  framesWithCatchUp: number;
  frameTimeMs: number;
  fps: number;
  isPaused: boolean;
  maxFrameTimeMs: number;
  maxCatchUpStepsPerFrame: number;
  schedulerMode: "internal-raf" | "pixi-ticker-master";
  simulationStepsLastFrame: number;
  simulationStepsTotal: number;
  speedMultiplier: SimulationSpeedOption;
  visualFrameCount: number;
};

type EntitySimulationControls = {
  advanceVisualFrame: (timestampMs: number) => void;
  pause: () => void;
  resume: () => void;
  setSpeedMultiplier: (speedMultiplier: SimulationSpeedOption) => void;
  stepOnce: () => void;
  togglePaused: () => void;
};

type UseEntitySimulationResult = EntitySimulationState & {
  controls: EntitySimulationControls;
  gameState: EmberwakeGameState;
  presentation: EnginePresentationModel;
  runtime: SimulationRuntimeMetrics;
};

export function useEntitySimulation({
  controlState,
  initialGameState,
  sessionRevision = 0
}: UseEntitySimulationOptions = {}) {
  const runnerRef = useRef<ReturnType<typeof createEmberwakeRuntimeRunner> | null>(null);
  const runnerVersionRef = useRef<number | null>(null);
  if (runnerRef.current === null || runnerVersionRef.current !== sessionRevision) {
    runnerRef.current = createEmberwakeRuntimeRunner(initialGameState);
    runnerVersionRef.current = sessionRevision;
  }
  const runner = runnerRef.current;
  const [snapshot, setSnapshot] = useState<RuntimeRunnerSnapshot<EmberwakeGameState>>(() =>
    runner.getSnapshot()
  );

  useEffect(() => {
    setSnapshot(runner.getSnapshot());
  }, [runner]);

  useEffect(() => {
    const unsubscribe = runner.subscribe((nextSnapshot) => {
      setSnapshot(nextSnapshot);
    });

    return () => {
      unsubscribe();
    };
  }, [runner]);

  useEffect(() => {
    runner.setInputFrame(createEngineInputFrameFromControlState(controlState));
  }, [controlState, runner]);

  const controls = useMemo<EntitySimulationControls>(
    () => ({
      advanceVisualFrame: (timestampMs) => {
        runner.advanceFrame(timestampMs, "pixi-ticker-master");
      },
      pause: () => {
        runner.pause();
      },
      resume: () => {
        runner.resume();
      },
      setSpeedMultiplier: (speedMultiplier) => {
        runner.setSpeedMultiplier(speedMultiplier);
      },
      stepOnce: () => {
        runner.stepOnce();
      },
      togglePaused: () => {
        runner.togglePaused();
      }
    }),
    [runner]
  );

  return {
    ...snapshot.state.simulation,
    controls,
    gameState: snapshot.state,
    presentation: snapshot.presentation,
    runtime: {
      ...snapshot.runtime,
      fixedStepMs: entitySimulationContract.fixedStepMs,
      maxCatchUpStepsPerFrame: entitySimulationContract.maxCatchUpStepsPerFrame,
      speedMultiplier: snapshot.runtime.speedMultiplier as SimulationSpeedOption
    }
  } satisfies UseEntitySimulationResult;
}
