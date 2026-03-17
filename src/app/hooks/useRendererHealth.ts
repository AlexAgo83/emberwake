import { useEffect, useState } from "react";

type RendererState = {
  message: string;
  status: "degraded" | "failed" | "initializing" | "ready";
};

const DEGRADE_TIMEOUT_MS = 2500;

export function useRendererHealth() {
  const [rendererState, setRendererState] = useState<RendererState>({
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
      setRendererState({
        message: "Pixi runtime ready.",
        status: "ready"
      });
    },
    markFailed: (message: string) => {
      setRendererState({
        message,
        status: "failed"
      });
    },
    rendererState
  };
}
