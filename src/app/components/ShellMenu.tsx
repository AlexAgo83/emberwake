import { memo, useEffect, useId, useRef } from "react";

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
  onShowPauseScene: () => void;
  onShowSettingsScene: () => void;
  onToggleDiagnostics: () => void;
  onToggleInspecteur: () => void;
};

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
    detail: "The runtime boundary is mounting and the shell is holding the deck until the live surface is ready.",
    stateLabel: "Booting",
    title: "Runtime boot sequence",
    tone: "cold"
  },
  defeat: {
    detail: "Gameplay requested shell intervention. Use the deck to recover the session or inspect the current state.",
    stateLabel: "Recovery",
    title: "Runtime interrupted",
    tone: "alert"
  },
  failure: {
    detail: "The shell detected a renderer failure and is holding the runtime outside the live loop.",
    stateLabel: "Failure",
    title: "Renderer recovery",
    tone: "alert"
  },
  pause: {
    detail: "The shell owns the pause scene while the runtime remains preserved underneath the live session.",
    stateLabel: "Paused",
    title: "Session pause",
    tone: "warm"
  },
  runtime: {
    detail: "The live session owns the play surface. Session controls, camera options, and tools are available from here.",
    stateLabel: "Live",
    title: "Runtime command deck",
    tone: "cold"
  },
  settings: {
    detail: "Settings are shell-owned. The runtime session is preserved and can resume without rebuilding gameplay state.",
    stateLabel: "Settings",
    title: "Shell settings",
    tone: "neutral"
  },
  victory: {
    detail: "A gameplay outcome reached the shell. The session can continue while keeping the current runtime state readable.",
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
  onShowPauseScene,
  onShowSettingsScene,
  onToggleDiagnostics,
  onToggleInspecteur
}: ShellMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const sceneStatus = sceneStatusMap[activeScene];
  const primaryAction =
    activeScene === "runtime"
      ? {
          detail: "Hand session control to the shell-owned pause scene.",
          label: "Pause",
          tone: "warm" as const,
          trigger: onShowPauseScene
        }
      : activeScene === "defeat" || activeScene === "failure"
        ? {
            detail: "Rebuild the runtime boundary and re-enter the live loop.",
            label: "Retry runtime",
            tone: "alert" as const,
            trigger: onRetryRuntime
          }
        : activeScene === "boot"
          ? {
              detail: "The shell is still preparing the runtime surface.",
              disabled: true,
              label: "Runtime booting",
              tone: "neutral" as const,
              trigger: null
            }
          : {
              detail: "Return from the current shell-owned scene to the live runtime loop.",
              label: "Resume runtime",
              tone: "cold" as const,
              trigger: onResumeRuntime
            };

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
  }, [isOpen, onOpenChange]);

  const runAction = (action: () => void) => {
    action();
    onOpenChange(false);
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
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="shell-menu__trigger shell-control shell-control--button"
        onClick={() => {
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
          <span className="shell-menu__trigger-label">Command deck</span>
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
          <header className="shell-menu__header">
            <div className="shell-menu__header-copy">
              <p className="shell-menu__eyebrow">Shell command deck</p>
              <div className="shell-menu__header-title-row">
                <h2 className="shell-menu__title">{sceneStatus.title}</h2>
                <span
                  className="shell-menu__status-chip"
                  data-tone={sceneStatus.tone}
                >
                  {sceneStatus.stateLabel}
                </span>
              </div>
              <p className="shell-menu__detail">{sceneStatus.detail}</p>
            </div>
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
            <span className="shell-menu__hero-kicker">Current action</span>
            <span className="shell-menu__hero-label">{primaryAction.label}</span>
            <span className="shell-menu__hero-detail">{primaryAction.detail}</span>
          </button>

          <section
            aria-labelledby={`${menuId}-session`}
            className="shell-menu__section"
            data-section-tone="secondary"
          >
            <p className="shell-menu__section-title" id={`${menuId}-session`}>
              Session
            </p>
            <div className="shell-menu__section-body">
              <button
                className="shell-menu__item shell-menu__item--action shell-menu__item--secondary"
                onClick={() => {
                  runAction(onShowSettingsScene);
                }}
                type="button"
              >
                <span className="shell-menu__item-label">Settings</span>
                <span className="shell-menu__item-value">Meta scene</span>
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
              <section
                aria-labelledby={`${menuId}-view`}
                className="shell-menu__subsection shell-menu__subsection--view"
                data-subsection-tone="secondary"
              >
                <p className="shell-menu__subsection-title" id={`${menuId}-view`}>
                  View
                </p>
                <div className="shell-menu__subsection-body">
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
                </div>
              </section>

              <section
                aria-labelledby={`${menuId}-tools`}
                className="shell-menu__subsection shell-menu__subsection--tools"
                data-subsection-tone="utility"
              >
                <p className="shell-menu__subsection-title" id={`${menuId}-tools`}>
                  Tools
                </p>
                <div className="shell-menu__subsection-body">
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
                </div>
              </section>
            </div>
          </section>
        </section>
      ) : null}
    </div>
  );
});
