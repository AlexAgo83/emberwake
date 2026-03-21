import { renderHook } from "@testing-library/react";

import { useAppScene } from "./useAppScene";

describe("useAppScene", () => {
  it("routes gameplay outcomes into shell-owned scenes without overriding renderer failure", () => {
    type HookProps = {
      rendererStatus: "failed" | "ready";
      runtimeOutcome: null | {
        detail: string;
        emittedAtTick: number | null;
        kind: "defeat" | "none" | "recovery" | "restart-needed" | "victory";
        shellScene: "defeat" | "none" | "pause" | "victory";
      };
    };
    const { result, rerender } = renderHook(
      ({ rendererStatus, runtimeOutcome }: HookProps) =>
        useAppScene({
          rendererStatus,
          runtimeOutcome
        }),
      {
        initialProps: {
          rendererStatus: "ready" as const,
          runtimeOutcome: null
        } as HookProps
      }
    );

    expect(result.current.activeScene).toBe("runtime");

    rerender({
      rendererStatus: "ready" as const,
      runtimeOutcome: {
        detail: "Recovery required",
        emittedAtTick: 12,
        kind: "restart-needed" as const,
        shellScene: "pause" as const
      }
    });

    expect(result.current.activeScene).toBe("pause");

    rerender({
      rendererStatus: "failed" as const,
      runtimeOutcome: {
        detail: "Victory should not override renderer failure",
        emittedAtTick: 24,
        kind: "victory" as const,
        shellScene: "victory" as const
      }
    });

    expect(result.current.activeScene).toBe("failure");
  });
});
