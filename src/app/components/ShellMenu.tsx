import { memo, useEffect, useId, useRef, useState } from "react";

import type { CameraMode } from "../../game/camera/model/cameraMode";
import type { AppSceneId } from "../model/appScene";
import type { LayoutMode } from "../../shared/types/layout";

type ShellMenuProps = {
  activeScene: AppSceneId;
  cameraMode: CameraMode;
  canInstall: boolean;
  diagnosticsEnabled: boolean;
  diagnosticsVisible: boolean;
  inspecteurVisible: boolean;
  isOpen: boolean;
  isFullscreen: boolean;
  isFullscreenSupported: boolean;
  layoutMode: LayoutMode;
  onEnterFullscreen: () => void;
  onInstall: () => void;
  onOpenChange: (isOpen: boolean) => void;
  onResetCamera: () => void;
  onRetryRuntime: () => void;
  onResumeRuntime: () => void;
  onSetCameraMode: (cameraMode: CameraMode) => void;
  onShowMainMenuScene: () => void;
  onShowPauseScene: () => void;
  onToggleRuntimeFeedback: () => void;
  onToggleDiagnostics: () => void;
  onToggleInspecteur: () => void;
  runtimeFeedbackVisible: boolean;
};

type ShellMenuScreen = "root" | "tools" | "view";

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "SELECT" ||
    target.tagName === "TEXTAREA");

const sceneStatusMap: Record<
  AppSceneId,
  {
    detail: string;
    stateLabel: string;
    title: string;
    tone: "alert" | "cold" | "neutral" | "warm";
  }
> = {
  boot: {
    detail: "The runtime is booting.",
    stateLabel: "Booting",
    title: "Runtime boot sequence",
    tone: "cold"
  },
  bestiary: {
    detail: "The shell is presenting the creature archive.",
    stateLabel: "Archive",
    title: "Bestiary archive",
    tone: "neutral"
  },
  changelogs: {
    detail: "Release notes are displayed in a shell-owned reader.",
    stateLabel: "Changelog",
    title: "Release history",
    tone: "neutral"
  },
  defeat: {
    detail: "The shell is handling a defeat state.",
    stateLabel: "Recovery",
    title: "Runtime interrupted",
    tone: "alert"
  },
  failure: {
    detail: "The renderer failed and the shell is holding the runtime.",
    stateLabel: "Failure",
    title: "Renderer recovery",
    tone: "alert"
  },
  grimoire: {
    detail: "The shell is presenting the skill archive.",
    stateLabel: "Archive",
    title: "Grimoire archive",
    tone: "neutral"
  },
  "main-menu": {
    detail: "The main menu is the entry and return hub.",
    stateLabel: "Menu",
    title: "Main menu",
    tone: "neutral"
  },
  "new-game": {
    detail: "The shell is staging a new run.",
    stateLabel: "New run",
    title: "New game staging",
    tone: "warm"
  },
  pause: {
    detail: "The runtime is paused and preserved.",
    stateLabel: "Paused",
    title: "Field hold",
    tone: "warm"
  },
  runtime: {
    detail: "Session controls, view options, and tools live here.",
    stateLabel: "Live",
    title: "Runtime command deck",
    tone: "cold"
  },
  settings: {
    detail: "Settings are shell-owned and preserve the run.",
    stateLabel: "Settings",
    title: "Shell settings",
    tone: "neutral"
  },
  victory: {
    detail: "The shell is presenting a gameplay outcome.",
    stateLabel: "Victory",
    title: "Outcome handoff",
    tone: "warm"
  }
};

export const ShellMenu = memo(function ShellMenu({
  activeScene,
  cameraMode,
  canInstall,
  diagnosticsEnabled,
  diagnosticsVisible,
  inspecteurVisible,
  isOpen,
  isFullscreen,
  isFullscreenSupported,
  layoutMode,
  onEnterFullscreen,
  onInstall,
  onOpenChange,
  onResetCamera,
  onRetryRuntime,
  onResumeRuntime,
  onSetCameraMode,
  onShowMainMenuScene,
  onShowPauseScene,
  onToggleRuntimeFeedback,
  onToggleDiagnostics,
  onToggleInspecteur,
  runtimeFeedbackVisible
}: ShellMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [menuScreen, setMenuScreen] = useState<ShellMenuScreen>("root");
  const sceneStatus = sceneStatusMap[activeScene];
  const primaryAction =
    activeScene === "runtime"
      ? {
          detail: "Pause the live run.",
          label: "Pause",
          tone: "warm" as const,
          trigger: onShowPauseScene
        }
      : activeScene === "defeat" || activeScene === "failure"
        ? {
            detail: "Restart the runtime.",
            label: "Retry runtime",
            tone: "alert" as const,
            trigger: onRetryRuntime
          }
        : activeScene === "boot"
          ? {
              detail: "Wait for the runtime to mount.",
              disabled: true,
              label: "Runtime booting",
              tone: "neutral" as const,
              trigger: null
            }
          : {
              detail: "Return to the live run.",
              label: "Resume runtime",
              tone: "cold" as const,
              trigger: onResumeRuntime
            };

  useEffect(() => {
    if (!isOpen) {
      setMenuScreen("root");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        document.body.dataset.desktopControlCaptureActive === "true" ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      event.preventDefault();

      if (menuScreen !== "root") {
        setMenuScreen("root");
        return;
      }

      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, menuScreen, onOpenChange]);

  const runAction = (action: () => void) => {
    action();
    onOpenChange(false);
  };
  const openMenuScreen = (screen: Exclude<ShellMenuScreen, "root">) => {
    setMenuScreen(screen);
  };
  const returnToRootMenu = () => {
    setMenuScreen("root");
  };

  return (
    <div
      className="shell-menu"
      data-layout-mode={layoutMode}
      data-open={isOpen}
      ref={menuRef}
    >
      <button
        aria-controls={menuId}
        aria-expanded={layoutMode === "mobile" ? false : isOpen}
        aria-haspopup={layoutMode === "mobile" ? undefined : "dialog"}
        className="shell-menu__trigger shell-control shell-control--button"
        onClick={() => {
          if (layoutMode === "mobile") {
            onOpenChange(false);
            onShowPauseScene();
            return;
          }

          onOpenChange(!isOpen);
        }}
        type="button"
      >
        <span className="shell-menu__trigger-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="shell-menu__trigger-copy">
          <span className="shell-menu__trigger-label">Menu</span>
          <span
            className="shell-menu__trigger-state"
            data-tone={sceneStatus.tone}
          >
            {sceneStatus.stateLabel}
          </span>
        </span>
      </button>

      {isOpen ? (
        <section
          aria-label="Shell menu"
          className="shell-menu__panel"
          id={menuId}
        >
          <header className="shell-menu__panel-header">
            <div className="shell-menu__panel-copy">
              <p className="shell-menu__eyebrow">Field console</p>
              <h2 className="shell-menu__panel-title">{sceneStatus.title}</h2>
              <p className="shell-menu__panel-detail">{sceneStatus.detail}</p>
            </div>
            <p className="shell-menu__panel-state" data-tone={sceneStatus.tone}>
              {sceneStatus.stateLabel}
            </p>
          </header>

          <button
            className="shell-menu__hero-action"
            data-tone={primaryAction.tone}
            disabled={primaryAction.disabled}
            onClick={() => {
              if (!primaryAction.trigger) {
                return;
              }

              runAction(primaryAction.trigger);
            }}
            type="button"
          >
            <span className="shell-menu__hero-kicker">Immediate action</span>
            <span className="shell-menu__hero-label">{primaryAction.label}</span>
            <span className="shell-menu__hero-detail">{primaryAction.detail}</span>
          </button>

          <section
            aria-labelledby={`${menuId}-session`}
            className="shell-menu__section"
          >
            <p className="shell-menu__section-title" id={`${menuId}-session`}>
              Session
            </p>
            <div className="shell-menu__section-body">
              {menuScreen === "root" ? (
                <>
                  <button
                    className="shell-menu__item shell-menu__item--action shell-menu__item--secondary"
                    onClick={() => {
                      runAction(onShowMainMenuScene);
                    }}
                    type="button"
                  >
                    <span className="shell-menu__item-label">Main menu</span>
                    <span className="shell-menu__item-value">Session hub</span>
                  </button>
                  <button
                    className="shell-menu__item shell-menu__item--action shell-menu__item--secondary"
                    disabled={!isFullscreenSupported || isFullscreen}
                    onClick={() => {
                      runAction(onEnterFullscreen);
                    }}
                    type="button"
                  >
                    <span className="shell-menu__item-label">Fullscreen</span>
                    <span className="shell-menu__item-value">
                      {!isFullscreenSupported ? "Unavailable" : isFullscreen ? "Active" : "Enter"}
                    </span>
                  </button>
                    <button
                      className="shell-menu__item shell-menu__item--action shell-menu__item--secondary"
                      onClick={() => {
                        openMenuScreen("view");
                      }}
                      type="button"
                    >
                      <span className="shell-menu__item-label">View</span>
                      <span className="shell-menu__item-value">Camera controls ›</span>
                    </button>
                    <button
                      className="shell-menu__item shell-menu__item--action shell-menu__item--utility"
                      onClick={() => {
                        openMenuScreen("tools");
                      }}
                      type="button"
                    >
                      <span className="shell-menu__item-label">Tools</span>
                      <span className="shell-menu__item-value">Inspect and diagnostics ›</span>
                    </button>
                </>
              ) : (
                <>
                  <div className="shell-menu__submenu-header">
                    <button
                      className="shell-menu__submenu-back"
                      onClick={returnToRootMenu}
                      type="button"
                    >
                      <span aria-hidden="true">‹</span>
                      <span>Back to Session</span>
                    </button>
                    <p className="shell-menu__eyebrow">
                      {menuScreen === "view" ? "View" : "Tools"}
                    </p>
                  </div>

                  {menuScreen === "view" ? (
                    <>
                      <button
                        className="shell-menu__item shell-menu__item--action shell-menu__item--secondary"
                        onClick={() => {
                          runAction(onResetCamera);
                        }}
                        type="button"
                      >
                        <span className="shell-menu__item-label">Reset camera</span>
                        <span className="shell-menu__item-value">Recenter view</span>
                      </button>
                      <div
                        className="shell-menu__group shell-menu__group--secondary shell-menu__group--view"
                        role="group"
                        aria-label="Camera mode"
                      >
                        <div className="shell-menu__item shell-menu__item--static">
                          <span className="shell-menu__item-label">Camera mode</span>
                          <span className="shell-menu__item-value">
                            {cameraMode === "free" ? "Free" : "Follow entity"}
                          </span>
                        </div>
                        <div className="shell-menu__choice-grid">
                          <button
                            aria-pressed={cameraMode === "free"}
                            className="shell-menu__choice"
                            onClick={() => {
                              onSetCameraMode("free");
                            }}
                            type="button"
                          >
                            Free
                          </button>
                          <button
                            aria-pressed={cameraMode === "follow-entity"}
                            className="shell-menu__choice"
                            onClick={() => {
                              onSetCameraMode("follow-entity");
                            }}
                            type="button"
                          >
                            Follow entity
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        className="shell-menu__item shell-menu__item--action shell-menu__item--utility"
                        onClick={() => {
                          runAction(onToggleRuntimeFeedback);
                        }}
                        type="button"
                      >
                        <span className="shell-menu__item-label">Runtime feedback</span>
                        <span className="shell-menu__item-value">
                          {runtimeFeedbackVisible ? "Visible" : "Hidden"}
                        </span>
                      </button>

                      <button
                        className="shell-menu__item shell-menu__item--action shell-menu__item--utility"
                        onClick={() => {
                          runAction(onToggleInspecteur);
                        }}
                        type="button"
                      >
                        <span className="shell-menu__item-label">Inspecteur</span>
                        <span className="shell-menu__item-value">
                          {inspecteurVisible ? "Visible" : "Hidden"}
                        </span>
                      </button>

                      {diagnosticsEnabled ? (
                        <button
                          className="shell-menu__item shell-menu__item--action shell-menu__item--utility"
                          onClick={() => {
                            runAction(onToggleDiagnostics);
                          }}
                          type="button"
                        >
                          <span className="shell-menu__item-label">Diagnostics</span>
                          <span className="shell-menu__item-value">
                            {diagnosticsVisible ? "Visible" : "Hidden"}
                          </span>
                        </button>
                      ) : null}

                      {canInstall ? (
                        <button
                          className="shell-menu__item shell-menu__item--action shell-menu__item--utility"
                          onClick={() => {
                            runAction(onInstall);
                          }}
                          type="button"
                        >
                          <span className="shell-menu__item-label">Install app</span>
                          <span className="shell-menu__item-value">PWA</span>
                        </button>
                      ) : null}
                    </>
                  )}
                </>
              )}
            </div>
          </section>
        </section>
      ) : null}
    </div>
  );
});
