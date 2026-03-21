import { lazy, memo, Suspense } from "react";

import type { AppSceneId, RuntimeShellOutcome } from "../model/appScene";
import { characterNameMaxLength } from "../model/characterName";
import type { DesktopControlBindings } from "../../game/input/model/singleEntityControlContract";
import { entitySimulationContract } from "@game";

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

type AppMetaScenePanelProps = {
  canResumeSession: boolean;
  canSaveSession: boolean;
  characterNameError: string | null;
  desktopControlBindings: DesktopControlBindings;
  fullscreenPreferred: boolean;
  gameOverRecap?: GameOverRecap | null;
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
  savedSlotSummary: string | null;
  scene: AppSceneId;
};

export const AppMetaScenePanel = memo(function AppMetaScenePanel({
  canResumeSession,
  canSaveSession,
  characterNameError,
  desktopControlBindings,
  fullscreenPreferred,
  gameOverRecap,
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
  savedSlotSummary,
  scene
}: AppMetaScenePanelProps) {
  if (
    scene !== "main-menu" &&
    scene !== "new-game" &&
    scene !== "pause" &&
    scene !== "settings" &&
    scene !== "defeat" &&
    scene !== "victory"
  ) {
    return null;
  }

  const formatRunDuration = (ticks: number) => {
    const totalSeconds = Math.max(
      0,
      Math.round((ticks * entitySimulationContract.fixedStepMs) / 1000)
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
        : scene === "pause"
      ? "Runtime paused"
      : scene === "settings"
        ? "Settings"
        : scene === "defeat"
          ? "Game over"
          : "Victory";
  const detail =
    scene === "main-menu"
      ? canResumeSession
        ? "Resume the live session, start a new run, or open shell-owned settings."
        : "Start a new run, check settings, or return later when a save slot exists."
      : scene === "new-game"
        ? "Name your character before the shell hands control to the live runtime."
      : scene === "pause"
      ? "The live session is preserved while the shell holds the pause scene."
      : scene === "settings"
        ? ""
        : scene === "defeat" && gameOverRecap
          ? gameOverRecap.defeatDetail
        : runtimeOutcome?.detail ??
          (scene === "defeat"
            ? "The active run ended and the shell is presenting the run recap."
            : "The shell is presenting the latest runtime outcome.");
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
              3-20 characters. Letters, numbers, spaces, apostrophes, and hyphens only.
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
