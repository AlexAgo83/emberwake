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

type UseRendererHealthOptions = {
  enabled?: boolean;
};

const createIdleRendererState = (attempt: number): RendererState => ({
  metrics: createRendererMetrics(attempt),
  message: "Runtime idle until a session starts.",
  status: "ready"
});

export function useRendererHealth({ enabled = true }: UseRendererHealthOptions = {}) {
  const [rendererState, setRendererState] = useState<RendererState>({
    ...(enabled
      ? {
          metrics: createRendererMetrics(0),
          message: "Waiting for Pixi runtime readiness signal.",
          status: "initializing" as const
        }
      : createIdleRendererState(0))
  });

  useEffect(() => {
    setRendererState((currentState) => {
      if (!enabled) {
        if (currentState.message === "Runtime idle until a session starts." && currentState.status === "ready") {
          return currentState;
        }

        return createIdleRendererState(currentState.metrics.attempt);
      }

      if (currentState.message !== "Runtime idle until a session starts.") {
        return currentState;
      }

      return {
        metrics: createRendererMetrics(currentState.metrics.attempt + 1),
        message: "Waiting for Pixi runtime readiness signal.",
        status: "initializing"
      };
    });
  }, [enabled]);

  useEffect(() => {
    if (!enabled || rendererState.status !== "initializing") {
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
  }, [enabled, rendererState.status]);

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
