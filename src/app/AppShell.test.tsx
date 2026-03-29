import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const saveActiveSession = vi.fn();
const usePwaUpdatePromptMock = vi.fn();

vi.mock("./components/AppMetaScenePanel", () => ({
  AppMetaScenePanel: ({ onSaveGame }: { onSaveGame: () => void }) => (
    <button onClick={onSaveGame} type="button">
      Save game
    </button>
  )
}));

vi.mock("./components/ActiveRuntimeShellContent", () => ({
  ActiveRuntimeShellContent: ({
    metaOverlay,
    onBossSpawnToast,
    onRuntimeStateChange
  }: {
    metaOverlay: React.ReactNode;
    onBossSpawnToast: () => void;
    onRuntimeStateChange: (gameState: unknown) => void;
  }) => {
    useEffect(() => {
      onRuntimeStateChange({
        simulation: {
          entity: {
            worldPosition: {
              x: 0,
              y: 0
            }
          }
        },
        systems: {
          outcome: {
            detail: "",
            kind: "none",
            skillPerformanceSummaries: []
          },
          progression: {
            goldCollected: 0,
            hostileDefeats: 0,
            phaseLabel: "Ember Watch",
            runtimeTicksSurvived: 0,
            traversalDistanceWorldUnits: 0
          }
        }
      });
    }, [onRuntimeStateChange]);

    return (
      <>
        <button onClick={onBossSpawnToast} type="button">
          Spawn boss
        </button>
        {metaOverlay}
      </>
    );
  }
}));

vi.mock("./hooks/useDocumentViewportLock", () => ({
  useDocumentViewportLock: () => {}
}));

vi.mock("./hooks/useDesktopControlBindings", () => ({
  useDesktopControlBindings: () => ({
    applyDesktopControlBindings: vi.fn(),
    desktopControlBindings: {}
  })
}));

vi.mock("./hooks/useInstallPrompt", () => ({
  useInstallPrompt: () => ({
    canInstall: false,
    promptInstall: vi.fn()
  })
}));

vi.mock("./hooks/useFullscreenController", () => ({
  useFullscreenController: () => ({
    enterFullscreen: vi.fn(),
    isFullscreen: false,
    isSupported: true,
    lastError: null
  })
}));

vi.mock("./hooks/useLogicalViewportModel", () => ({
  useLogicalViewportModel: () => ({
    layoutMode: "desktop"
  })
}));

vi.mock("./hooks/useRendererHealth", () => ({
  useRendererHealth: () => ({
    markFailed: vi.fn(),
    markReady: vi.fn(),
    rendererState: {
      message: "",
      metrics: {
        rendererReadyMs: 0
      },
      status: "ready"
    },
    reset: vi.fn()
  })
}));

vi.mock("./hooks/useRuntimeSession", () => ({
  useRuntimeSession: () => ({
    createNewSession: vi.fn(),
    cycleWorldSeed: vi.fn(),
    endActiveSession: vi.fn(),
    loadSavedSession: vi.fn(),
    runtimeSession: {
      cameraMode: "follow",
      cameraState: { rotation: 0, x: 0, y: 0, zoom: 1 },
      hasActiveSession: true,
      playerName: "Wanderer",
      sessionRevision: 1,
      worldSeed: "seed-alpha"
    },
    saveActiveSession,
    savedSessionSlot: null,
    sessionInitState: {
      simulation: {
        entity: {
          worldPosition: {
            x: 0,
            y: 0
          }
        }
      },
      systems: {
        outcome: {
          detail: "",
          kind: "none",
          skillPerformanceSummaries: []
        },
        progression: {
          creatureDefeatCounts: {},
          discoveredActiveWeaponIds: [],
          discoveredCreatureIds: [],
          discoveredFusionIds: [],
          discoveredPassiveItemIds: [],
          goldCollected: 0,
          hostileDefeats: 0,
          phaseLabel: "Ember Watch",
          runtimeTicksSurvived: 0,
          traversalDistanceWorldUnits: 0
        }
      }
    },
    setCameraMode: vi.fn(),
    setCameraState: vi.fn()
  })
}));

vi.mock("./hooks/useShellPreferences", () => ({
  useShellPreferences: () => ({
    preferences: {
      debugPanelVisible: false,
      entityRingsVisible: true,
      inspectionPanelVisible: false,
      lastMetaScene: "none",
      movementOnboardingDismissed: true,
      prefersFullscreen: false,
      runtimeFeedbackVisible: true
    },
    setDebugPanelVisible: vi.fn(),
    setEntityRingsVisible: vi.fn(),
    setInspectionPanelVisible: vi.fn(),
    setLastMetaScene: vi.fn(),
    setMovementOnboardingDismissed: vi.fn(),
    setPrefersFullscreen: vi.fn(),
    setRuntimeFeedbackVisible: vi.fn()
  })
}));

vi.mock("./hooks/usePwaUpdatePrompt", () => ({
  usePwaUpdatePrompt: () => usePwaUpdatePromptMock()
}));

describe("AppShell", () => {
  beforeEach(() => {
    saveActiveSession.mockReset();
    usePwaUpdatePromptMock.mockReset();
    usePwaUpdatePromptMock.mockReturnValue({
      applyUpdate: vi.fn(),
      dismissPrompt: vi.fn(),
      isApplyingUpdate: false,
      isPromptOpen: false,
      isUpdateReady: false,
      reopenPrompt: vi.fn()
    });
  });

  it("shows a toast after saving the active session", async () => {
    saveActiveSession.mockReturnValue(true);
    const { AppShell } = await import("./AppShell");

    render(<AppShell />);
    fireEvent.click(screen.getByRole("button", { name: /save game/i }));

    expect(saveActiveSession).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Game saved.")).toBeInTheDocument();
  });

  it("renders the update prompt when a new build is ready", async () => {
    usePwaUpdatePromptMock.mockReturnValue({
      applyUpdate: vi.fn(),
      dismissPrompt: vi.fn(),
      isApplyingUpdate: false,
      isPromptOpen: true,
      isUpdateReady: true,
      reopenPrompt: vi.fn()
    });
    const { AppShell } = await import("./AppShell");

    render(<AppShell />);

    expect(screen.getByRole("dialog", { name: /application update available/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update now/i })).toBeInTheDocument();
  });

  it("shows a toast when the runtime announces a boss spawn", async () => {
    const { AppShell } = await import("./AppShell");

    render(<AppShell />);
    fireEvent.click(screen.getByRole("button", { name: /spawn boss/i }));

    expect(await screen.findByText("Boss incoming.")).toBeInTheDocument();
  });
});
