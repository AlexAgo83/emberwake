import { act, renderHook } from "@testing-library/react";

import { useAppScene } from "./useAppScene";

describe("useAppScene", () => {
  it("routes gameplay outcomes into shell-owned scenes without overriding renderer failure", () => {
    type HookProps = {
      rendererStatus: "failed" | "ready";
      runtimeOutcome: null | {
        detail: string;
        emittedAtTick: number | null;
        kind: "defeat" | "none" | "recovery" | "restart-needed" | "victory";
        phaseId: string | null;
        shellScene: "defeat" | "none" | "pause" | "victory";
        skillPerformanceSummaries: [];
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

    expect(result.current.activeScene).toBe("main-menu");

    rerender({
      rendererStatus: "ready" as const,
      runtimeOutcome: {
        detail: "Recovery required",
        emittedAtTick: 12,
        kind: "restart-needed" as const,
        phaseId: null,
        shellScene: "pause" as const,
        skillPerformanceSummaries: []
      }
    });

    expect(result.current.activeScene).toBe("pause");

    rerender({
      rendererStatus: "failed" as const,
      runtimeOutcome: {
        detail: "Victory should not override renderer failure",
        emittedAtTick: 24,
        kind: "victory" as const,
        phaseId: null,
        shellScene: "victory" as const,
        skillPerformanceSummaries: []
      }
    });

    expect(result.current.activeScene).toBe("failure");
  });

  it("can route shell-owned main menu, new-game, and growth scenes directly", () => {
    const { result } = renderHook(() =>
      useAppScene({
        rendererStatus: "ready",
        runtimeOutcome: null
      })
    );

    act(() => {
      result.current.showNewGameScene();
    });
    expect(result.current.requestedScene).toBe("new-game");

    act(() => {
      result.current.showMainMenuScene();
    });
    expect(result.current.requestedScene).toBe("main-menu");

    act(() => {
      result.current.showGrowthScene();
    });
    expect(result.current.requestedScene).toBe("growth");
  });
});
