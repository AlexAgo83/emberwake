import { lazy, memo, Suspense } from "react";

import type { AppSceneId, RuntimeShellOutcome } from "../model/appScene";
import { characterNameMaxLength } from "../model/characterName";
import type { DesktopControlBindings } from "../../game/input/model/singleEntityControlContract";

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
      ? "The live session is preserved while the shell holds the pause scene."
      : scene === "settings"
        ? ""
        : runtimeOutcome?.detail ??
          (scene === "defeat"
            ? "The shell took control after the live run requested recovery."
            : "The shell is presenting the latest runtime outcome.");
  const resumeLabel =
    scene === "defeat"
      ? "Restart runtime"
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
            <div>
              <dt>Load game</dt>
              <dd>{savedSlotSummary ?? "No save available"}</dd>
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
