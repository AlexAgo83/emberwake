import { useEffect } from "react";
import { lazy, memo, Suspense } from "react";

import type { AppSceneId, RuntimeShellOutcome } from "../model/appScene";
import { releaseChangelogEntries } from "../model/releaseChangelogs";
import { characterNameMaxLength, defaultCharacterName } from "../model/characterName";
import { renderChangelogMarkdown } from "../model/changelogMarkdown";
import type { DesktopControlBindings } from "../../game/input/model/singleEntityControlContract";
import { appConfig } from "../../shared/config/appConfig";

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
  onOpenChangelogs: () => void;
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
  onOpenChangelogs,
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
    scene === "changelogs" ||
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
        : scene === "changelogs"
          ? "Changelogs"
        : scene === "settings"
          ? "Settings"
          : scene === "defeat"
            ? "Game over"
            : "Victory";
  const detail =
    scene === "main-menu"
      ? ""
      : scene === "new-game"
        ? "Name your character before the run starts."
        : scene === "changelogs"
          ? "Read the latest curated Emberwake release notes."
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
      : scene === "new-game" || scene === "changelogs" || scene === "settings" || scene === "defeat"
        ? onReturnToMainMenu
        : null;
  const projectVersionLabel = `${appConfig.name} v${appConfig.version}`;

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
    <>
      <aside className="app-meta-scene" aria-label={title} data-scene={scene}>
        <h2 className="app-meta-scene__title">{title}</h2>
        {detail ? <p className="app-meta-scene__detail">{detail}</p> : null}
        {scene === "main-menu" ? (
          <>
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
              <button
                className="shell-control shell-control--button"
                disabled={!isLoadAvailable}
                onClick={onLoadGame}
                type="button"
              >
                Load game
              </button>
              <button className="shell-control shell-control--button" onClick={onOpenNewGame} type="button">
                Start new game
              </button>
              <button className="shell-control shell-control--button" onClick={onOpenSettings} type="button">
                Settings
              </button>
              <button className="shell-control shell-control--button" onClick={onOpenChangelogs} type="button">
                Changelogs
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
            <div className="app-meta-scene__actions app-meta-scene__actions--new-game">
              <button
                className="shell-control shell-control--button shell-control--button-primary"
                disabled={characterNameError !== null}
                onClick={onBeginNewGame}
                type="button"
              >
                Begin
              </button>
              <button className="shell-control shell-control--button" onClick={onReturnToMainMenu} type="button">
                Back to menu
              </button>
            </div>
          </>
        ) : (
          <>
            {scene === "changelogs" ? (
              <>
                <div className="app-meta-scene__changelog-list">
                  {releaseChangelogEntries.map((entry) => {
                    return (
                      <article className="app-meta-scene__changelog-card" key={entry.slug}>
                        <div className="app-meta-scene__changelog-card-header">
                          <h3 className="app-meta-scene__changelog-version">{entry.version}</h3>
                          <span className="app-meta-scene__changelog-tag">Release notes</span>
                        </div>
                        <div className="app-meta-scene__changelog-content">
                          {renderChangelogMarkdown(entry.content)}
                        </div>
                      </article>
                    );
                  })}
                </div>
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
            ) : scene === "settings" ? (
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
                    <dd>{gameOverRecap?.playerName || playerName || defaultCharacterName}</dd>
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

      {scene === "main-menu" ? (
        <a
          className="app-meta-scene__viewport-footer"
          href={appConfig.projectUrl}
          rel="noreferrer"
          target="_blank"
        >
          {projectVersionLabel}
        </a>
      ) : null}
    </>
  );
});
