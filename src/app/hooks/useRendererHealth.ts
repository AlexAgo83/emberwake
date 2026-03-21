import { useCallback, useEffect, useState } from "react";

export type RendererMetrics = {
  attempt: number;
  bootStartedAtMs: number;
  rendererReadyMs: number | null;
};

export type RendererState = {
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

  const markReady = useCallback(() => {
    const rendererReadyAtMs = getNowMs();

    setRendererState((currentState) => {
      if (currentState.status === "ready") {
        return currentState;
      }

      return {
        metrics: {
          ...currentState.metrics,
          rendererReadyMs: rendererReadyAtMs - currentState.metrics.bootStartedAtMs
        },
        message: "Pixi runtime ready.",
        status: "ready"
      };
    });
  }, []);

  const markFailed = useCallback((message: string) => {
    setRendererState((currentState) => {
      if (currentState.status === "failed" && currentState.message === message) {
        return currentState;
      }

      return {
        metrics: currentState.metrics,
        message,
        status: "failed"
      };
    });
  }, []);

  const reset = useCallback(() => {
    setRendererState((currentState) => ({
      metrics: createRendererMetrics(currentState.metrics.attempt + 1),
      message: "Retrying Pixi runtime readiness signal.",
      status: "initializing"
    }));
  }, []);

  return {
    markFailed,
    markReady,
    reset,
    rendererState
  };
}
