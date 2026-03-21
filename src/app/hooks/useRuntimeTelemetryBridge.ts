import { useEffect, useRef } from "react";

import type { AppSceneId } from "../model/appScene";
import type { RendererState } from "./useRendererHealth";

declare global {
  interface Window {
    __EMBERWAKE_RUNTIME_METRICS__?: {
      activeScene: AppSceneId;
      attempt: number;
      bootStartedAtMs: number;
      diagnosticsVisible: boolean;
      frameLoop: {
        catchUpFramesRatio: number;
        fps: number;
        frameTimeMs: number;
        framesSinceReady: number;
        framesWithCatchUpSinceReady: number;
        maxFrameTimeMsSinceReady: number;
        maxSimulationStepsLastFrameSinceReady: number;
        recentCatchUpFramesRatio: number;
        recentFramesTracked: number;
        recentMaxSimulationStepsLastFrame: number;
        schedulerMode: "internal-raf" | "pixi-ticker-master";
        simulationStepsLastFrame: number;
        simulationStepsTotalSinceReady: number;
      };
      publication: {
        diagnostics: string;
        runtimeScene: string;
        shellChrome: string;
      };
      rendererReadyMs: number | null;
      status: "degraded" | "failed" | "initializing" | "ready";
    };
  }
}

type RuntimeTelemetryBridgeOptions = {
  activeScene: AppSceneId;
  diagnosticsVisible: boolean;
  publication: {
    diagnostics: string;
    runtimeScene: string;
    shellChrome: string;
  };
  rendererState: RendererState;
  runtime: {
    fps: number;
    frameTimeMs: number;
    framesWithCatchUp: number;
    schedulerMode: "internal-raf" | "pixi-ticker-master";
    simulationStepsLastFrame: number;
    simulationStepsTotal: number;
    visualFrameCount: number;
  };
};

const recentFrameSampleWindow = 120;

export function useRuntimeTelemetryBridge({
  activeScene,
  diagnosticsVisible,
  publication,
  rendererState,
  runtime
}: RuntimeTelemetryBridgeOptions) {
  const readyBaselineRef = useRef<{
    framesWithCatchUp: number;
    simulationStepsTotal: number;
    visualFrameCount: number;
  } | null>(null);
  const maxFrameTimeSinceReadyRef = useRef(0);
  const maxSimulationStepsLastFrameSinceReadyRef = useRef(0);
  const recentFrameSamplesRef = useRef<
    Array<{
      hadCatchUp: boolean;
      simulationStepsLastFrame: number;
    }>
  >([]);

  useEffect(() => {
    if (rendererState.status !== "ready") {
      readyBaselineRef.current = null;
      maxFrameTimeSinceReadyRef.current = 0;
      maxSimulationStepsLastFrameSinceReadyRef.current = 0;
      recentFrameSamplesRef.current = [];
    } else {
      if (readyBaselineRef.current === null) {
        readyBaselineRef.current = {
          framesWithCatchUp: runtime.framesWithCatchUp,
          simulationStepsTotal: runtime.simulationStepsTotal,
          visualFrameCount: runtime.visualFrameCount
        };
      }

      maxFrameTimeSinceReadyRef.current = Math.max(
        maxFrameTimeSinceReadyRef.current,
        runtime.frameTimeMs
      );
      maxSimulationStepsLastFrameSinceReadyRef.current = Math.max(
        maxSimulationStepsLastFrameSinceReadyRef.current,
        runtime.simulationStepsLastFrame
      );
      recentFrameSamplesRef.current = [
        ...recentFrameSamplesRef.current.slice(-(recentFrameSampleWindow - 1)),
        {
          hadCatchUp: runtime.simulationStepsLastFrame > 1,
          simulationStepsLastFrame: runtime.simulationStepsLastFrame
        }
      ];
    }

    const baseline = readyBaselineRef.current;
    const framesSinceReady =
      baseline === null ? 0 : Math.max(0, runtime.visualFrameCount - baseline.visualFrameCount);
    const framesWithCatchUpSinceReady =
      baseline === null ? 0 : Math.max(0, runtime.framesWithCatchUp - baseline.framesWithCatchUp);
    const simulationStepsTotalSinceReady =
      baseline === null ? 0 : Math.max(0, runtime.simulationStepsTotal - baseline.simulationStepsTotal);
    const catchUpFramesRatio =
      framesSinceReady === 0 ? 0 : framesWithCatchUpSinceReady / framesSinceReady;
    const recentFrameSamples = recentFrameSamplesRef.current;
    const recentFramesTracked = recentFrameSamples.length;
    const recentFramesWithCatchUp = recentFrameSamples.filter((sample) => sample.hadCatchUp).length;
    const recentCatchUpFramesRatio =
      recentFramesTracked === 0 ? 0 : recentFramesWithCatchUp / recentFramesTracked;
    const recentMaxSimulationStepsLastFrame = recentFrameSamples.reduce(
      (maxSimulationSteps, sample) =>
        Math.max(maxSimulationSteps, sample.simulationStepsLastFrame),
      0
    );

    globalThis.window.__EMBERWAKE_RUNTIME_METRICS__ = {
      activeScene,
      attempt: rendererState.metrics.attempt,
      bootStartedAtMs: rendererState.metrics.bootStartedAtMs,
      diagnosticsVisible,
      frameLoop: {
        catchUpFramesRatio: Number(catchUpFramesRatio.toFixed(4)),
        fps: Number(runtime.fps.toFixed(2)),
        frameTimeMs: Number(runtime.frameTimeMs.toFixed(2)),
        framesSinceReady,
        framesWithCatchUpSinceReady,
        maxFrameTimeMsSinceReady: Number(maxFrameTimeSinceReadyRef.current.toFixed(2)),
        maxSimulationStepsLastFrameSinceReady: maxSimulationStepsLastFrameSinceReadyRef.current,
        recentCatchUpFramesRatio: Number(recentCatchUpFramesRatio.toFixed(4)),
        recentFramesTracked,
        recentMaxSimulationStepsLastFrame,
        schedulerMode: runtime.schedulerMode,
        simulationStepsLastFrame: runtime.simulationStepsLastFrame,
        simulationStepsTotalSinceReady,
      },
      publication,
      rendererReadyMs: rendererState.metrics.rendererReadyMs,
      status: rendererState.status
    };
  }, [activeScene, diagnosticsVisible, publication, rendererState, runtime]);
}

export {};
