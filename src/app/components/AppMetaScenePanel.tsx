import { memo } from "react";

import type { AppSceneId, RuntimeShellOutcome } from "../model/appScene";
import { characterNameMaxLength } from "../model/characterName";

type AppMetaScenePanelProps = {
  canResumeSession: boolean;
  characterNameError: string | null;
  fullscreenPreferred: boolean;
  isLoadAvailable: boolean;
  onBeginNewGame: () => void;
  onCharacterNameChange: (value: string) => void;
  onOpenNewGame: () => void;
  onOpenSettings: () => void;
  onReturnToMainMenu: () => void;
  onResumeRuntime: () => void;
  pendingCharacterName: string;
  playerName: string;
  runtimeOutcome?: RuntimeShellOutcome | null;
  scene: AppSceneId;
};

export const AppMetaScenePanel = memo(function AppMetaScenePanel({
  canResumeSession,
  characterNameError,
  fullscreenPreferred,
  isLoadAvailable,
  onBeginNewGame,
  onCharacterNameChange,
  onOpenNewGame,
  onOpenSettings,
  onReturnToMainMenu,
  onResumeRuntime,
  pendingCharacterName,
  playerName,
  runtimeOutcome,
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
          ? "Runtime interrupted"
          : "Victory";
  const detail =
    scene === "main-menu"
      ? canResumeSession
        ? "Resume the live session, start a new run, or open shell-owned settings."
        : "Start a new run, check settings, or return later when a save slot exists."
      : scene === "new-game"
        ? "Name your character before the shell hands control to the live runtime."
      : scene === "pause"
      ? "The shell owns the pause scene and holds the runtime while the player is outside the live loop."
      : scene === "settings"
        ? "Settings stay shell-owned. Returning to runtime resumes the live loop without rebuilding gameplay state."
        : runtimeOutcome?.detail ??
          (scene === "defeat"
            ? "The shell has taken ownership after a gameplay outcome requested recovery or restart."
            : "The shell presents the gameplay outcome without reading arbitrary runtime internals.");
  const resumeLabel =
    scene === "defeat"
      ? "Restart runtime"
      : scene === "victory"
        ? "Continue runtime"
        : scene === "main-menu"
          ? "Resume runtime"
          : "Resume runtime";
  const ownershipLabel =
    scene === "main-menu" || scene === "new-game"
      ? canResumeSession
        ? "Shell scene / runtime state preserved"
        : "Shell scene / no active runtime session"
      : scene === "defeat" || scene === "victory"
      ? `Shell scene / gameplay outcome ${runtimeOutcome?.kind ?? scene}`
      : "Shell scene / runtime state preserved";

  return (
    <aside className="app-meta-scene" aria-label={title}>
      <p className="app-meta-scene__eyebrow">Meta flow</p>
      <h2 className="app-meta-scene__title">{title}</h2>
      <p className="app-meta-scene__detail">{detail}</p>
      {scene === "main-menu" ? (
        <>
          <dl className="app-meta-scene__facts">
            <div>
              <dt>Session</dt>
              <dd>{canResumeSession ? `Active run / ${playerName}` : "No active run"}</dd>
            </div>
            <div>
              <dt>Load game</dt>
              <dd>{isLoadAvailable ? "Slot ready" : "No save available"}</dd>
            </div>
            <div>
              <dt>Ownership</dt>
              <dd>{ownershipLabel}</dd>
            </div>
          </dl>
          <div className="app-meta-scene__actions">
            {canResumeSession ? (
              <button className="shell-control shell-control--button" onClick={onResumeRuntime} type="button">
                {resumeLabel}
              </button>
            ) : null}
            <button className="shell-control shell-control--button" onClick={onOpenNewGame} type="button">
              Start new game
            </button>
            <button className="shell-control shell-control--button" disabled={!isLoadAvailable} type="button">
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
            {scene !== "settings" ? (
              <button
                className="shell-control shell-control--button"
                onClick={onOpenSettings}
                type="button"
              >
                Settings
              </button>
            ) : (
              <button
                className="shell-control shell-control--button"
                onClick={onReturnToMainMenu}
                type="button"
              >
                Back to menu
              </button>
            )}
          </div>
        </>
      )}
    </aside>
  );
});
