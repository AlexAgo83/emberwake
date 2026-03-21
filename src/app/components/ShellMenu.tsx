import { memo, useEffect, useId, useRef } from "react";

import type { CameraMode } from "../../game/camera/model/cameraMode";
import type { AppSceneId } from "../model/appScene";

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
  onEnterFullscreen: () => void;
  onInstall: () => void;
  onOpenChange: (isOpen: boolean) => void;
  onResetCamera: () => void;
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
  onEnterFullscreen,
  onInstall,
  onOpenChange,
  onResetCamera,
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
            className="shell-menu__item shell-menu__item--action"
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
              className="shell-menu__item shell-menu__item--action"
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

          <button
            className="shell-menu__item shell-menu__item--action"
            onClick={() => {
              runAction(activeScene === "runtime" ? onShowPauseScene : onResumeRuntime);
            }}
            type="button"
          >
            <span className="shell-menu__item-label">
              {activeScene === "runtime" ? "Pause runtime" : "Resume runtime"}
            </span>
            <span className="shell-menu__item-value">
              {activeScene === "runtime" ? "Open pause scene" : "Return to loop"}
            </span>
          </button>

          <button
            className="shell-menu__item shell-menu__item--action"
            onClick={() => {
              runAction(onShowSettingsScene);
            }}
            type="button"
          >
            <span className="shell-menu__item-label">Settings</span>
            <span className="shell-menu__item-value">Shell-owned</span>
          </button>

          <button
            className="shell-menu__item shell-menu__item--action"
            onClick={() => {
              runAction(onResetCamera);
            }}
            type="button"
          >
            <span className="shell-menu__item-label">Reset camera</span>
            <span className="shell-menu__item-value">Recenter view</span>
          </button>

          <div className="shell-menu__group" role="group" aria-label="Camera mode">
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

          <button
            className="shell-menu__item shell-menu__item--action"
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

          {canInstall ? (
            <button
              className="shell-menu__item shell-menu__item--action"
              onClick={() => {
                runAction(onInstall);
              }}
              type="button"
            >
              <span className="shell-menu__item-label">Install app</span>
              <span className="shell-menu__item-value">PWA</span>
            </button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
});
