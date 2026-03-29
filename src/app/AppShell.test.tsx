import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const usePwaUpdatePromptMock = vi.fn();

vi.mock("./components/AppMetaScenePanel", () => ({
  AppMetaScenePanel: ({
    scene,
    onReturnToMainMenu,
    onAbandonRun,
    onResumeRuntime
  }: {
    scene: string;
    onReturnToMainMenu: () => void;
    onAbandonRun: () => void;
    onResumeRuntime: () => void;
  }) => (
    <>
      <p>Scene: {scene}</p>
      <button onClick={onReturnToMainMenu} type="button">
        Back to main menu
      </button>
      <button onClick={onAbandonRun} type="button">
        Abandon run
      </button>
      <button onClick={onResumeRuntime} type="button">
        Resume runtime
      </button>
    </>
  )
}));

vi.mock("./components/ActiveRuntimeShellContent", () => ({
  ActiveRuntimeShellContent: ({
    isMenuOpen,
    metaOverlay,
    onBossSpawnToast,
    onRuntimeOutcomeChange,
    onRuntimeStateChange
  }: {
    isMenuOpen: boolean;
    metaOverlay: React.ReactNode;
    onBossSpawnToast: () => void;
    onRuntimeOutcomeChange: (runtimeOutcome: unknown) => void;
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
        <button
          onClick={() => {
            onRuntimeOutcomeChange({
              detail: "Victory outcome",
              emittedAtTick: 42,
              kind: "victory",
              phaseId: null,
              shellScene: "victory",
              skillPerformanceSummaries: []
            });
          }}
          type="button"
        >
          Emit victory
        </button>
        <p>{isMenuOpen ? "Shell menu open" : "Shell menu closed"}</p>
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
    runtimeSession: {
      cameraMode: "follow",
      cameraState: { rotation: 0, x: 0, y: 0, zoom: 1 },
      hasActiveSession: true,
      playerName: "Wanderer",
      sessionRevision: 1,
      worldProfileId: "ashwake-verge",
      worldSeed: "seed-alpha"
    },
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
    setCameraState: vi.fn(),
    setWorldProfileId: vi.fn()
  })
}));

vi.mock("./hooks/useShellPreferences", () => ({
  useShellPreferences: () => ({
    preferences: {
      biomeSeamsVisible: false,
      debugPanelVisible: false,
      entityRingsVisible: false,
      inspectionPanelVisible: false,
      lastMetaScene: "none",
      movementOnboardingDismissed: true,
      prefersFullscreen: false,
      runtimeFeedbackVisible: true
    },
    setBiomeSeamsVisible: vi.fn(),
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

  it("shows a toast after abandoning the active session", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const { AppShell } = await import("./AppShell");

    render(<AppShell />);
    fireEvent.click(screen.getByRole("button", { name: /abandon run/i }));

    expect(await screen.findByText("Run abandoned.")).toBeInTheDocument();
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

  it("opens the shell menu on Escape while the runtime is live", async () => {
    const { AppShell } = await import("./AppShell");

    render(<AppShell />);
    fireEvent.click(screen.getByRole("button", { name: /resume runtime/i }));

    expect(screen.getByText("Shell menu closed")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(await screen.findByText("Shell menu open")).toBeInTheDocument();
  });

  it("returns from victory to the main menu instead of staying pinned to the outcome scene", async () => {
    const { AppShell } = await import("./AppShell");

    render(<AppShell />);

    fireEvent.click(screen.getByRole("button", { name: /emit victory/i }));
    expect(await screen.findByText("Scene: victory")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /back to main menu/i }));

    expect(await screen.findByText("Scene: main-menu")).toBeInTheDocument();
  });
});
