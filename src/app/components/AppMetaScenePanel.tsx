import { lazy, memo, Suspense } from "react";
import { useEffect } from "react";

import type { AppSceneId, RuntimeShellOutcome } from "../model/appScene";
import { characterNameMaxLength } from "../model/characterName";
import type { DesktopControlBindings } from "../../game/input/model/singleEntityControlContract";

export type GameOverRecap = {
  defeatDetail: string;
  goldCollected: number;
  hostileDefeats: number;
  playerName: string;
  ticksSurvived: number;
  traversalDistanceWorldUnits: number;
};

const LazyDesktopControlSettingsSection = lazy(async () => {
  const module = await import("./DesktopControlSettingsSection");

  return {
    default: module.DesktopControlSettingsSection
  };
});

const runtimeFixedStepMs = 1000 / 60;

type AppMetaScenePanelProps = {
  canResumeSession: boolean;
  canSaveSession: boolean;
  characterNameError: string | null;
  desktopControlBindings: DesktopControlBindings;
  fullscreenPreferred: boolean;
  gameOverRecap?: GameOverRecap | null;
  isShellMenuOpen: boolean;
  isLoadAvailable: boolean;
  onApplyDesktopControlBindings: (bindings: DesktopControlBindings) => void;
  onBeginNewGame: () => void;
  onCharacterNameChange: (value: string) => void;
  onLoadGame: () => void;
  onOpenNewGame: () => void;
  onOpenSettings: () => void;
  onReturnToMainMenu: () => void;
  onResumeRuntime: () => void;
  onSaveGame: () => void;
  pendingCharacterName: string;
  playerName: string;
  runtimeOutcome?: RuntimeShellOutcome | null;
  scene: AppSceneId;
};

export const AppMetaScenePanel = memo(function AppMetaScenePanel({
  canResumeSession,
  canSaveSession,
  characterNameError,
  desktopControlBindings,
  fullscreenPreferred,
  gameOverRecap,
  isShellMenuOpen,
  isLoadAvailable,
  onApplyDesktopControlBindings,
  onBeginNewGame,
  onCharacterNameChange,
  onLoadGame,
  onOpenNewGame,
  onOpenSettings,
  onReturnToMainMenu,
  onResumeRuntime,
  onSaveGame,
  pendingCharacterName,
  playerName,
  runtimeOutcome,
  scene
}: AppMetaScenePanelProps) {
  const isShellOwnedScene =
    scene === "main-menu" ||
    scene === "new-game" ||
    scene === "settings" ||
    scene === "defeat" ||
    scene === "victory";

  const shouldHidePanel = !isShellOwnedScene;

  const formatRunDuration = (ticks: number) => {
    const totalSeconds = Math.max(
      0,
      Math.round((ticks * runtimeFixedStepMs) / 1000)
    );
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };
  const title =
    scene === "main-menu"
      ? "Main menu"
      : scene === "new-game"
        ? "New game"
        : scene === "settings"
          ? "Settings"
          : scene === "defeat"
            ? "Game over"
            : "Victory";
  const detail =
    scene === "main-menu"
      ? canResumeSession
        ? "Resume the run, start a new one, or open settings."
        : "Start a new run or open settings."
      : scene === "new-game"
        ? "Name your character before the run starts."
        : scene === "settings"
          ? ""
          : scene === "defeat" && gameOverRecap
            ? gameOverRecap.defeatDetail
            : runtimeOutcome?.detail ??
              (scene === "defeat"
                ? "The run ended. Review the recap."
                : "Review the latest runtime outcome.");
  const resumeLabel =
    scene === "defeat"
      ? "Return to main menu"
      : scene === "victory"
        ? "Continue runtime"
        : scene === "main-menu"
          ? "Resume runtime"
          : "Resume runtime";
  const ownershipLabel =
    scene === "defeat" || scene === "victory"
      ? `Shell scene / gameplay outcome ${runtimeOutcome?.kind ?? scene}`
      : "Shell scene / runtime state preserved";
  const handleEscapeAction =
    scene === "main-menu"
      ? canResumeSession
        ? onResumeRuntime
        : null
      : scene === "new-game" || scene === "settings" || scene === "defeat"
        ? onReturnToMainMenu
        : null;

  useEffect(() => {
    if (shouldHidePanel || !handleEscapeAction) {
      return;
    }

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditableElement =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.tagName === "TEXTAREA");

      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        isShellMenuOpen ||
        isEditableElement ||
        document.body.dataset.desktopControlCaptureActive === "true"
      ) {
        return;
      }

      event.preventDefault();
      handleEscapeAction();
    };

    window.addEventListener("keydown", handleWindowKeyDown);

    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [handleEscapeAction, isShellMenuOpen, shouldHidePanel]);

  if (shouldHidePanel) {
    return null;
  }

  return (
    <aside className="app-meta-scene" aria-label={title}>
      <p className="app-meta-scene__eyebrow">Meta flow</p>
      <h2 className="app-meta-scene__title">{title}</h2>
      {detail ? <p className="app-meta-scene__detail">{detail}</p> : null}
      {scene === "main-menu" ? (
        <>
          <dl className="app-meta-scene__facts">
            <div>
              <dt>Session</dt>
              <dd>{canResumeSession ? `Active run / ${playerName}` : "No active run"}</dd>
            </div>
          </dl>
          <div className="app-meta-scene__actions">
            {canResumeSession ? (
              <button className="shell-control shell-control--button" onClick={onResumeRuntime} type="button">
                {resumeLabel}
              </button>
            ) : null}
            {canSaveSession ? (
              <button className="shell-control shell-control--button" onClick={onSaveGame} type="button">
                Save game
              </button>
            ) : null}
            <button className="shell-control shell-control--button" onClick={onOpenNewGame} type="button">
              Start new game
            </button>
            <button
              className="shell-control shell-control--button"
              disabled={!isLoadAvailable}
              onClick={onLoadGame}
              type="button"
            >
              Load game
            </button>
            <button className="shell-control shell-control--button" onClick={onOpenSettings} type="button">
              Settings
            </button>
          </div>
        </>
      ) : scene === "new-game" ? (
        <>
          <div className="app-meta-scene__form">
            <label className="app-meta-scene__field">
              <span className="app-meta-scene__field-label">Character name</span>
              <input
                className="app-meta-scene__field-input"
                maxLength={characterNameMaxLength}
                onChange={(event) => {
                  onCharacterNameChange(event.target.value);
                }}
                placeholder="Wanderer"
                type="text"
                value={pendingCharacterName}
              />
            </label>
            <p className="app-meta-scene__field-help">
              3-20 chars. Letters, numbers, spaces, apostrophes, and hyphens only.
            </p>
            {characterNameError ? (
              <p className="app-meta-scene__field-error" role="alert">
                {characterNameError}
              </p>
            ) : null}
          </div>
          <div className="app-meta-scene__actions">
            <button className="shell-control shell-control--button" onClick={onReturnToMainMenu} type="button">
              Back to menu
            </button>
            <button
              className="shell-control shell-control--button"
              disabled={characterNameError !== null}
              onClick={onBeginNewGame}
              type="button"
            >
              Begin
            </button>
          </div>
        </>
      ) : (
        <>
          {scene === "settings" ? (
            <>
              <Suspense
                fallback={
                  <p className="settings-controls__status">Loading desktop control bindings…</p>
                }
              >
                <LazyDesktopControlSettingsSection
                  bindings={desktopControlBindings}
                  onApply={onApplyDesktopControlBindings}
                />
              </Suspense>
              <div className="app-meta-scene__actions">
                <button
                  className="shell-control shell-control--button"
                  onClick={onReturnToMainMenu}
                  type="button"
                >
                  Back to menu
                </button>
              </div>
            </>
          ) : scene === "defeat" ? (
            <>
              <dl className="app-meta-scene__facts">
                <div>
                  <dt>Session</dt>
                  <dd>{gameOverRecap?.playerName || playerName || "Wanderer"}</dd>
                </div>
                <div>
                  <dt>Survived</dt>
                  <dd>{formatRunDuration(gameOverRecap?.ticksSurvived ?? 0)}</dd>
                </div>
                <div>
                  <dt>Traversal</dt>
                  <dd>{Math.round(gameOverRecap?.traversalDistanceWorldUnits ?? 0)} wu</dd>
                </div>
                <div>
                  <dt>Hostile defeats</dt>
                  <dd>{gameOverRecap?.hostileDefeats ?? 0}</dd>
                </div>
                <div>
                  <dt>Gold</dt>
                  <dd>{gameOverRecap?.goldCollected ?? 0}</dd>
                </div>
              </dl>
              <div className="app-meta-scene__actions">
                <button
                  className="shell-control shell-control--button"
                  onClick={onReturnToMainMenu}
                  type="button"
                >
                  Back to main menu
                </button>
              </div>
            </>
          ) : (
            <>
              <dl className="app-meta-scene__facts">
                <div>
                  <dt>Runtime re-entry</dt>
                  <dd>Resume current session</dd>
                </div>
                <div>
                  <dt>Fullscreen preference</dt>
                  <dd>{fullscreenPreferred ? "remembered" : "off"}</dd>
                </div>
                <div>
                  <dt>Ownership</dt>
                  <dd>{ownershipLabel}</dd>
                </div>
              </dl>
              <div className="app-meta-scene__actions">
                <button
                  className="shell-control shell-control--button"
                  onClick={onResumeRuntime}
                  type="button"
                >
                  {resumeLabel}
                </button>
                <button
                  className="shell-control shell-control--button"
                  onClick={onOpenSettings}
                  type="button"
                >
                  Settings
                </button>
              </div>
            </>
          )}
        </>
      )}
    </aside>
  );
});
