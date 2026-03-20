import { useEffect, useRef, useState } from "react";

import {
  advanceEmberwakeSimulationState,
  createInitialEmberwakeSimulationState,
  entitySimulationContract
} from "@game/runtime/emberwakeGameModule";
import type { EntitySimulationState } from "../model/entitySimulation";
import type { SimulationSpeedOption } from "../model/entitySimulation";
import type { SingleEntityControlState } from "../../input/model/singleEntityControlContract";

type UseEntitySimulationOptions = {
  controlState?: SingleEntityControlState;
};

type SimulationRuntimeMetrics = {
  accumulatorMs: number;
  fixedStepMs: number;
  frameTimeMs: number;
  fps: number;
  isPaused: boolean;
  maxCatchUpStepsPerFrame: number;
  simulationStepsLastFrame: number;
  speedMultiplier: SimulationSpeedOption;
};

type EntitySimulationControls = {
  resume: () => void;
  setSpeedMultiplier: (speedMultiplier: SimulationSpeedOption) => void;
  stepOnce: () => void;
  togglePaused: () => void;
};

type UseEntitySimulationResult = EntitySimulationState & {
  controls: EntitySimulationControls;
  runtime: SimulationRuntimeMetrics;
};

export function useEntitySimulation({ controlState }: UseEntitySimulationOptions = {}) {
  const [simulationState, setSimulationState] = useState<EntitySimulationState>(
    createInitialEmberwakeSimulationState
  );
  const [isPaused, setIsPaused] = useState(false);
  const [runtimeMetrics, setRuntimeMetrics] = useState<SimulationRuntimeMetrics>({
    accumulatorMs: 0,
    fixedStepMs: entitySimulationContract.fixedStepMs,
    fps: 0,
    frameTimeMs: entitySimulationContract.fixedStepMs,
    isPaused: false,
    maxCatchUpStepsPerFrame: entitySimulationContract.maxCatchUpStepsPerFrame,
    simulationStepsLastFrame: 0,
    speedMultiplier: 1
  });
  const simulationStateRef = useRef(simulationState);
  const controlStateRef = useRef(controlState);
  const isPausedRef = useRef(isPaused);
  const speedMultiplierRef = useRef<SimulationSpeedOption>(1);
  const queuedStepCountRef = useRef(0);
  const fpsRef = useRef(0);

  useEffect(() => {
    simulationStateRef.current = simulationState;
  }, [simulationState]);

  useEffect(() => {
    controlStateRef.current = controlState;
  }, [controlState]);

  useEffect(() => {
    isPausedRef.current = isPaused;
    setRuntimeMetrics((currentMetrics) => ({
      ...currentMetrics,
      isPaused
    }));
  }, [isPaused]);

  useEffect(() => {
    let frameId = 0;
    let previousTimestamp = 0;
    let accumulator = 0;

    const tick = (timestamp: number) => {
      if (previousTimestamp === 0) {
        previousTimestamp = timestamp;
      }

      const rawFrameTimeMs = timestamp - previousTimestamp;
      previousTimestamp = timestamp;
      const clampedFrameTimeMs = Math.min(rawFrameTimeMs, entitySimulationContract.fixedStepMs * 4);
      const speedAdjustedFrameTimeMs = isPausedRef.current
        ? 0
        : clampedFrameTimeMs * speedMultiplierRef.current;
      accumulator = Math.min(
        accumulator + speedAdjustedFrameTimeMs,
        entitySimulationContract.fixedStepMs * entitySimulationContract.maxCatchUpStepsPerFrame
      );
      let nextSimulationState = simulationStateRef.current;
      let simulationStepsLastFrame = 0;

      if (isPausedRef.current && queuedStepCountRef.current > 0) {
        while (queuedStepCountRef.current > 0) {
          nextSimulationState = advanceEmberwakeSimulationState(
            nextSimulationState,
            controlStateRef.current
          );
          queuedStepCountRef.current -= 1;
          simulationStepsLastFrame += 1;
        }
      } else if (accumulator >= entitySimulationContract.fixedStepMs) {
        while (
          accumulator >= entitySimulationContract.fixedStepMs &&
          simulationStepsLastFrame < entitySimulationContract.maxCatchUpStepsPerFrame
        ) {
          nextSimulationState = advanceEmberwakeSimulationState(
            nextSimulationState,
            controlStateRef.current
          );
          accumulator -= entitySimulationContract.fixedStepMs;
          simulationStepsLastFrame += 1;
        }
      }

      if (simulationStepsLastFrame > 0) {
        simulationStateRef.current = nextSimulationState;
        setSimulationState(nextSimulationState);
      }

      const instantaneousFps = rawFrameTimeMs > 0 ? 1000 / rawFrameTimeMs : fpsRef.current;
      fpsRef.current = fpsRef.current === 0 ? instantaneousFps : fpsRef.current * 0.85 + instantaneousFps * 0.15;
      setRuntimeMetrics((currentMetrics) => ({
        ...currentMetrics,
        accumulatorMs: accumulator,
        fps: fpsRef.current,
        frameTimeMs: rawFrameTimeMs || currentMetrics.frameTimeMs,
        isPaused: isPausedRef.current,
        simulationStepsLastFrame,
        speedMultiplier: speedMultiplierRef.current
      }));

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const controls: EntitySimulationControls = {
    resume: () => {
      setIsPaused(false);
    },
    setSpeedMultiplier: (speedMultiplier) => {
      speedMultiplierRef.current = speedMultiplier;
      setRuntimeMetrics((currentMetrics) => ({
        ...currentMetrics,
        speedMultiplier
      }));
    },
    stepOnce: () => {
      queuedStepCountRef.current += 1;
      setIsPaused(true);
    },
    togglePaused: () => {
      setIsPaused((currentPaused) => !currentPaused);
    }
  };

  return {
    ...simulationState,
    controls,
    runtime: runtimeMetrics
  } satisfies UseEntitySimulationResult;
}
