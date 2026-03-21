import { useEffect, useState } from "react";

declare global {
  interface Window {
    __EMBERWAKE_RUNTIME_METRICS__?: {
      attempt: number;
      bootStartedAtMs: number;
      rendererReadyMs: number | null;
      status: "degraded" | "failed" | "initializing" | "ready";
    };
  }
}

type RendererMetrics = {
  attempt: number;
  bootStartedAtMs: number;
  rendererReadyMs: number | null;
};

type RendererState = {
  metrics: RendererMetrics;
  message: string;
  status: "degraded" | "failed" | "initializing" | "ready";
};

const DEGRADE_TIMEOUT_MS = 2500;

const getNowMs = () =>
  typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();

const createRendererMetrics = (attempt: number): RendererMetrics => ({
  attempt,
  bootStartedAtMs: getNowMs(),
  rendererReadyMs: null
});

export function useRendererHealth() {
  const [rendererState, setRendererState] = useState<RendererState>({
    metrics: createRendererMetrics(0),
    message: "Waiting for Pixi runtime readiness signal.",
    status: "initializing"
  });

  useEffect(() => {
    globalThis.window.__EMBERWAKE_RUNTIME_METRICS__ = {
      attempt: rendererState.metrics.attempt,
      bootStartedAtMs: rendererState.metrics.bootStartedAtMs,
      rendererReadyMs: rendererState.metrics.rendererReadyMs,
      status: rendererState.status
    };
  }, [rendererState]);

  useEffect(() => {
    if (rendererState.status !== "initializing") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRendererState((currentState) => {
        if (currentState.status !== "initializing") {
          return currentState;
        }

        return {
          metrics: currentState.metrics,
          message: "Pixi runtime did not confirm readiness before the shell timeout.",
          status: "degraded"
        };
      });
    }, DEGRADE_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [rendererState.status]);

  return {
    markReady: () => {
      const rendererReadyAtMs = getNowMs();

      setRendererState({
        metrics: {
          ...rendererState.metrics,
          rendererReadyMs: rendererReadyAtMs - rendererState.metrics.bootStartedAtMs
        },
        message: "Pixi runtime ready.",
        status: "ready"
      });
    },
    markFailed: (message: string) => {
      setRendererState({
        metrics: rendererState.metrics,
        message,
        status: "failed"
      });
    },
    reset: () => {
      setRendererState((currentState) => ({
        metrics: createRendererMetrics(currentState.metrics.attempt + 1),
        message: "Retrying Pixi runtime readiness signal.",
        status: "initializing"
      }));
    },
    rendererState
  };
}

export {};
