import { useEffect, useState } from "react";
import { lazy, memo, Suspense } from "react";
import type { CSSProperties } from "react";

import type { AppSceneId, RuntimeShellOutcome } from "../model/appScene";
import { loadReleaseChangelogEntries } from "../model/releaseChangelogs";
import type { ReleaseChangelogEntry } from "../model/releaseChangelogs";
import { characterNameMaxLength, defaultCharacterName } from "../model/characterName";
import { renderChangelogMarkdown } from "../model/changelogMarkdown";
import type { MetaProfile, MetaTalentId, ShopUnlockId } from "../model/metaProgression";
import type { DesktopControlBindings } from "../../game/input/model/singleEntityControlContract";
import { appConfig } from "../../shared/config/appConfig";
import type { SkillPerformanceSummary } from "@game";

export type GameOverRecap = {
  defeatDetail: string;
  goldCollected: number;
  hostileDefeats: number;
  playerName: string;
  runPhaseLabel: string;
  skillPerformanceSummaries: SkillPerformanceSummary[];
  ticksSurvived: number;
  traversalDistanceWorldUnits: number;
};

export type CodexProgressionSnapshot = {
  creatureDefeatCounts: Record<string, number> | Partial<Record<string, number>>;
  discoveredActiveWeaponIds: string[];
  discoveredCreatureIds: string[];
  discoveredFusionIds: string[];
  discoveredPassiveItemIds: string[];
  phaseLabel: string;
};

type PlayerWorldPosition = {
  x: number;
  y: number;
};

const LazyDesktopControlSettingsSection = lazy(async () => {
  const module = await import("./DesktopControlSettingsSection");

  return {
    default: module.DesktopControlSettingsSection
  };
});

const LazyCodexArchiveScene = lazy(async () => {
  const module = await import("./CodexArchiveScene");

  return {
    default: module.CodexArchiveScene
  };
});

const LazyGrowthScene = lazy(async () => {
  const module = await import("./GrowthScene");

  return {
    default: module.GrowthScene
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
  isMobileLayout: boolean;
  isShellMenuOpen: boolean;
  isLoadAvailable: boolean;
  metaProfile: MetaProfile;
  onApplyDesktopControlBindings: (bindings: DesktopControlBindings) => void;
  onBeginNewGame: () => void;
  onOpenBestiary: () => void;
  onCharacterNameChange: (value: string) => void;
  onLoadGame: () => void;
  onOpenChangelogs: () => void;
  onOpenGrowth: () => void;
  onOpenGrimoire: () => void;
  onOpenNewGame: () => void;
  onPurchaseShopUnlock: (unlockId: ShopUnlockId) => void;
  onPurchaseTalentRank: (talentId: MetaTalentId) => void;
  onOpenSettings: () => void;
  onReturnToMainMenu: () => void;
  onResumeRuntime: () => void;
  onSaveGame: () => void;
  pendingCharacterName: string;
  playerName: string;
  playerWorldPosition?: PlayerWorldPosition | null;
  progressionSnapshot: CodexProgressionSnapshot | null;
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
  isMobileLayout,
  isShellMenuOpen,
  isLoadAvailable,
  metaProfile,
  onApplyDesktopControlBindings,
  onBeginNewGame,
  onOpenBestiary,
  onCharacterNameChange,
  onLoadGame,
  onOpenChangelogs,
  onOpenGrowth,
  onOpenGrimoire,
  onOpenNewGame,
  onPurchaseShopUnlock,
  onPurchaseTalentRank,
  onOpenSettings,
  onReturnToMainMenu,
  onResumeRuntime,
  onSaveGame,
  pendingCharacterName,
  playerName,
  playerWorldPosition,
  progressionSnapshot,
  runtimeOutcome,
  scene
}: AppMetaScenePanelProps) {
  const [defeatView, setDefeatView] = useState<"recap" | "skills">("recap");
  const [releaseChangelogEntries, setReleaseChangelogEntries] = useState<ReleaseChangelogEntry[] | null>(null);
  const isShellOwnedScene =
    scene === "main-menu" ||
    scene === "new-game" ||
    scene === "changelogs" ||
    scene === "growth" ||
    scene === "grimoire" ||
    scene === "bestiary" ||
    scene === "pause" ||
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
      ? "Emberwake"
      : scene === "new-game"
        ? "New game"
        : scene === "changelogs"
          ? "Changelogs"
          : scene === "growth"
            ? "Talents"
          : scene === "grimoire"
            ? "Skills"
            : scene === "bestiary"
              ? "Bestiary"
              : scene === "pause"
                ? "Paused"
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
          : scene === "growth"
            ? "Spend persistent gold on permanent talents and future run unlocks."
          : scene === "grimoire"
            ? "Review discovered active, passive, and fusion techniques."
            : scene === "bestiary"
              ? "Inspect the field archive of encountered hostile forms."
              : scene === "pause"
                ? ""
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
      : scene === "new-game" ||
          scene === "changelogs" ||
          scene === "growth" ||
          scene === "grimoire" ||
          scene === "bestiary" ||
          scene === "pause" ||
          scene === "settings" ||
          scene === "defeat"
        ? onReturnToMainMenu
        : null;
  const projectVersionLabel = `${appConfig.name} v${appConfig.version}`;
  const sceneEyebrow =
    scene === "main-menu"
      ? "Main menu"
      : scene === "new-game"
        ? "Run initiation"
        : scene === "changelogs"
          ? "Archive"
          : scene === "growth"
            ? "Meta progression"
          : scene === "grimoire" || scene === "bestiary"
            ? "Codex archive"
            : scene === "pause"
              ? "Pause"
          : scene === "settings"
            ? "Control bench"
            : scene === "defeat"
              ? "Recovery"
              : "Outcome";
  const sceneTone =
    scene === "new-game" || scene === "victory"
      ? "ember"
      : scene === "changelogs" ||
          scene === "growth" ||
          scene === "settings" ||
          scene === "grimoire" ||
          scene === "bestiary" ||
          scene === "pause"
        ? "steel"
        : scene === "defeat"
          ? "alert"
          : "ice";

  const skillPerformanceSummaries =
    gameOverRecap?.skillPerformanceSummaries ?? runtimeOutcome?.skillPerformanceSummaries ?? [];
  const totalSkillDamage = skillPerformanceSummaries.reduce(
    (currentTotal, summary) => currentTotal + summary.totalDamage,
    0
  );
  const playerWorldPositionLabel = playerWorldPosition
    ? `${Math.round(playerWorldPosition.x)}, ${Math.round(playerWorldPosition.y)}`
    : null;

  useEffect(() => {
    setDefeatView("recap");
  }, [scene]);

  useEffect(() => {
    if (scene !== "changelogs") {
      return;
    }

    let isCancelled = false;

    void loadReleaseChangelogEntries().then((entries) => {
      if (isCancelled) {
        return;
      }

      setReleaseChangelogEntries(entries);
    });

    return () => {
      isCancelled = true;
    };
  }, [scene]);

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
      <aside
        className="app-meta-scene"
        aria-label={title}
        data-scene={scene}
        data-tone={sceneTone}
      >
        <div className="app-meta-scene__frame">
          <header className="app-meta-scene__header">
            <div className="app-meta-scene__header-copy">
              <p className="app-meta-scene__eyebrow">{sceneEyebrow}</p>
              <h2 className="app-meta-scene__title">{title}</h2>
              {detail ? <p className="app-meta-scene__detail">{detail}</p> : null}
            </div>
            {scene === "growth" ? (
              <div className="app-meta-scene__header-chip" aria-label="Available gold">
                <span className="app-meta-scene__header-chip-label">Available gold</span>
                <span className="app-meta-scene__header-chip-value">{metaProfile.goldBalance}</span>
              </div>
            ) : null}
          </header>
        {scene === "main-menu" ? (
          <>
            <div className="app-meta-scene__actions app-meta-scene__actions--main-menu">
              {canResumeSession ? (
                <button
                  className="shell-control shell-control--button shell-control--button-quiet"
                  onClick={onResumeRuntime}
                  type="button"
                >
                  {resumeLabel}
                </button>
              ) : null}
              {canSaveSession ? (
                <button
                  className="shell-control shell-control--button shell-control--button-quiet"
                  onClick={onSaveGame}
                  type="button"
                >
                  Save game
                </button>
              ) : null}
              <button
                className="shell-control shell-control--button shell-control--button-quiet"
                disabled={!isLoadAvailable}
                onClick={onLoadGame}
                type="button"
              >
                Load game
              </button>
              <button
                className="shell-control shell-control--button shell-control--button-primary"
                onClick={onOpenNewGame}
                type="button"
              >
                Start new game
              </button>
              <button
                className="shell-control shell-control--button shell-control--button-quiet"
                onClick={onOpenGrowth}
                type="button"
              >
                Talents
              </button>
              <button
                className="shell-control shell-control--button shell-control--button-quiet"
                onClick={onOpenSettings}
                type="button"
              >
                Settings
              </button>
              <button
                className="shell-control shell-control--button shell-control--button-quiet"
                onClick={onOpenGrimoire}
                type="button"
              >
                Skills
              </button>
              <button
                className="shell-control shell-control--button shell-control--button-quiet"
                onClick={onOpenBestiary}
                type="button"
              >
                Bestiary
              </button>
              <button
                className="shell-control shell-control--button shell-control--button-quiet"
                onClick={onOpenChangelogs}
                type="button"
              >
                Changelogs
              </button>
            </div>
          </>
        ) : scene === "new-game" ? (
          <>
            <div className="app-meta-scene__subsurface app-meta-scene__subsurface--ritual">
              <p className="app-meta-scene__lead">Prime the next run before the ash moves.</p>
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
        ) : scene === "growth" ? (
          <>
            <Suspense fallback={<p className="settings-controls__status">Loading growth lanes…</p>}>
              <LazyGrowthScene
                metaProfile={metaProfile}
                onPurchaseShopUnlock={onPurchaseShopUnlock}
                onPurchaseTalentRank={onPurchaseTalentRank}
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
            {scene === "changelogs" ? (
              <>
                <div className="app-meta-scene__changelog-list">
                  {(releaseChangelogEntries ?? []).map((entry) => {
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
                  {releaseChangelogEntries === null ? (
                    <p className="settings-controls__status">Loading release notes…</p>
                  ) : null}
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
            ) : scene === "grimoire" ? (
              <>
                <div className="app-meta-scene__scene-body app-meta-scene__scene-body--scroll">
                  <Suspense fallback={<p className="settings-controls__status">Loading codex archive…</p>}>
                    <LazyCodexArchiveScene
                      progressionSnapshot={progressionSnapshot}
                      scene="grimoire"
                    />
                  </Suspense>
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
            ) : scene === "bestiary" ? (
              <>
                <div className="app-meta-scene__scene-body app-meta-scene__scene-body--scroll">
                  <Suspense fallback={<p className="settings-controls__status">Loading codex archive…</p>}>
                    <LazyCodexArchiveScene
                      progressionSnapshot={progressionSnapshot}
                      scene="bestiary"
                    />
                  </Suspense>
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
            ) : scene === "pause" ? (
              <>
                <dl className="app-meta-scene__facts">
                  <div>
                    <dt>Session</dt>
                    <dd>{playerName || defaultCharacterName}</dd>
                  </div>
                  {isMobileLayout && playerWorldPositionLabel ? (
                    <div>
                      <dt>Position</dt>
                      <dd>{playerWorldPositionLabel}</dd>
                    </div>
                  ) : null}
                </dl>
                <div className="app-meta-scene__actions">
                  <button
                    className="shell-control shell-control--button shell-control--button-primary"
                    onClick={onResumeRuntime}
                    type="button"
                  >
                    Resume runtime
                  </button>
                  <button
                    className="shell-control shell-control--button"
                    onClick={onOpenSettings}
                    type="button"
                  >
                    Settings
                  </button>
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
                <div className="app-meta-scene__scene-body app-meta-scene__scene-body--settings">
                  {isMobileLayout ? (
                    <div className="app-meta-scene__subsurface app-meta-scene__subsurface--settings">
                      <p className="app-meta-scene__lead">
                        Desktop control calibration is only exposed on large-screen shell layouts.
                      </p>
                    </div>
                  ) : (
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
                  )}
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
            ) : scene === "defeat" ? (
              <>
                <div className="app-meta-scene__subsurface app-meta-scene__subsurface--outcome">
                  <p className="app-meta-scene__lead">Record the fall, then decide the next move.</p>
                </div>
                <div className="app-meta-scene__toggle-row" role="tablist" aria-label="Game over views">
                  <button
                    aria-selected={defeatView === "recap"}
                    className="app-meta-scene__toggle"
                    onClick={() => {
                      setDefeatView("recap");
                    }}
                    role="tab"
                    type="button"
                  >
                    Recap
                  </button>
                  <button
                    aria-selected={defeatView === "skills"}
                    className="app-meta-scene__toggle"
                    onClick={() => {
                      setDefeatView("skills");
                    }}
                    role="tab"
                    type="button"
                  >
                    Skill ranking
                  </button>
                </div>
                <div className="app-meta-scene__scene-body app-meta-scene__scene-body--scroll">
                  {defeatView === "recap" ? (
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
                      <div>
                        <dt>Final phase</dt>
                        <dd>{gameOverRecap?.runPhaseLabel ?? progressionSnapshot?.phaseLabel ?? "Ember Watch"}</dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="app-meta-scene__skill-ranking">
                      {skillPerformanceSummaries.length > 0 ? (
                        skillPerformanceSummaries.map((summary, summaryIndex) => {
                          const rawDamageShare =
                            totalSkillDamage > 0 ? (summary.totalDamage / totalSkillDamage) * 100 : 0;
                          const damageShareLabel =
                            rawDamageShare >= 10
                              ? `${Math.round(rawDamageShare)}%`
                              : `${rawDamageShare.toFixed(1)}%`;

                          return (
                            <article
                              className="app-meta-scene__skill-row"
                              key={summary.weaponId}
                              style={
                                {
                                  "--damage-share": `${rawDamageShare}%`
                                } as CSSProperties
                              }
                            >
                              <div className="app-meta-scene__skill-rank">{summaryIndex + 1}</div>
                              <div className="app-meta-scene__skill-copy">
                                <div className="app-meta-scene__skill-copy-header">
                                  <h3>{summary.label}</h3>
                                  <span className="app-meta-scene__skill-share">{damageShareLabel}</span>
                                </div>
                                <p>
                                  {summary.totalDamage} total damage · {summary.attacksTriggered} casts ·{" "}
                                  {summary.hostileDefeats} defeats
                                </p>
                              </div>
                            </article>
                          );
                        })
                      ) : (
                        <p className="app-meta-scene__lead">No reliable skill performance sample was captured for this run.</p>
                      )}
                    </div>
                  )}
                </div>
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
                <div className="app-meta-scene__subsurface app-meta-scene__subsurface--outcome">
                  <p className="app-meta-scene__lead">The shell has received a clear runtime outcome.</p>
                </div>
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
        </div>
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
