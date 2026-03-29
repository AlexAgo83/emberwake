import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppUpdatePrompt } from "./components/AppUpdatePrompt";
import { AppMetaScenePanel } from "./components/AppMetaScenePanel";
import { ShellToastStack } from "./components/ShellToastStack";
import type { GameOverRecap } from "./components/AppMetaScenePanel";
import { useAppScene } from "./hooks/useAppScene";
import { useDesktopControlBindings } from "./hooks/useDesktopControlBindings";
import { useDocumentViewportLock } from "./hooks/useDocumentViewportLock";
import { useFullscreenController } from "./hooks/useFullscreenController";
import { useInstallPrompt } from "./hooks/useInstallPrompt";
import { useLogicalViewportModel } from "./hooks/useLogicalViewportModel";
import { usePwaUpdatePrompt } from "./hooks/usePwaUpdatePrompt";
import { useRendererHealth } from "./hooks/useRendererHealth";
import { useRuntimeSession } from "./hooks/useRuntimeSession";
import { useToastStack } from "./hooks/useToastStack";
import { useShellPreferences } from "./hooks/useShellPreferences";
import { deriveAppSceneId } from "./model/appScene";
import type { AppSceneId, RuntimeShellOutcome } from "./model/appScene";
import {
  pickRandomCharacterName,
  validateCharacterName
} from "./model/characterName";
import {
  clearRuntimeProfilingBridge,
  patchRuntimeProfilingBridge
} from "./model/runtimeProfilingBridge";
import {
  defaultRuntimeProfilingConfigDraft,
  resolveRuntimeProfilingConfigDraft
} from "./model/runtimeProfilingConfig";
import { listRuntimeProfilingScenarios } from "./model/runtimeProfilingScenarios";
import {
  bankGoldIntoMetaProfile,
  createDefaultMetaProfile,
  deriveBuildMetaProgression,
  mergeArchiveProgress,
  overlayArchiveProgress,
  purchaseShopUnlock,
  purchaseTalentRank,
  recordWorldAttempt
} from "./model/metaProgression";
import type {
  DesktopControlBindings
} from "../game/input/model/singleEntityControlContract";
import type { EmberwakeGameState } from "@game";
import { appConfig } from "../shared/config/appConfig";
import { readMetaProfile, writeMetaProfile } from "../shared/lib/metaProfileStorage";

const LazyActiveRuntimeShellContent = lazy(async () => {
  const module = await import("./components/ActiveRuntimeShellContent");

  return {
    default: module.ActiveRuntimeShellContent
  };
});

export function AppShell() {
  const shellRef = useRef<HTMLElement>(null);
  const latestGameStateRef = useRef<EmberwakeGameState | null>(null);
  const settledRunRewardKeyRef = useRef<string | null>(null);
  const previousActiveSceneRef = useRef<AppSceneId>("main-menu");
  const [metaProfile, setMetaProfile] = useState(() =>
    readMetaProfile(createDefaultMetaProfile())
  );
  const [pendingCharacterName, setPendingCharacterName] = useState(() =>
    pickRandomCharacterName()
  );
  const [gameOverRecap, setGameOverRecap] = useState<GameOverRecap | null>(null);
  const [runtimeOutcome, setRuntimeOutcome] = useState<RuntimeShellOutcome | null>(null);
  const [runtimeProfilingConfig, setRuntimeProfilingConfig] = useState(
    defaultRuntimeProfilingConfigDraft
  );
  useDocumentViewportLock();
  const { applyDesktopControlBindings, desktopControlBindings } = useDesktopControlBindings();
  const { canInstall, promptInstall } = useInstallPrompt();
  const {
    applyUpdate,
    dismissPrompt,
    isApplyingUpdate,
    isPromptOpen,
    isUpdateReady,
    reopenPrompt
  } = usePwaUpdatePrompt();
  const { dismissToast, pushToast, toasts } = useToastStack();
  const { enterFullscreen, isFullscreen, isSupported, lastError } =
    useFullscreenController(shellRef);
  const viewport = useLogicalViewportModel(shellRef);
  const {
    createNewSession,
    cycleWorldSeed,
    endActiveSession,
    runtimeSession,
    sessionInitState,
    setCameraMode,
    setCameraState,
    setWorldProfileId
  } = useRuntimeSession();
  const {
    markFailed,
    markReady,
    rendererState,
    reset: resetRenderer
  } = useRendererHealth({
    enabled: runtimeSession.hasActiveSession
  });
  const appScene = useAppScene({
    rendererStatus: rendererState.status,
    runtimeOutcome
  });
  const {
    closeShellSurface,
    isMenuOpen,
    openMenu,
    requestedScene,
    resumeRuntime,
    showBestiaryScene,
    showChangelogsScene,
    showGrowthScene,
    showGrimoireScene,
    showMainMenuScene,
    showNewGameScene,
    showPauseScene,
    showSettingsScene
  } = appScene;
  const shellRequestedScene = useMemo(
    () =>
      deriveAppSceneId({
        rendererStatus: rendererState.status,
        requestedScene,
        runtimeOutcome: null
      }),
    [rendererState.status, requestedScene]
  );
  const activeScene = useMemo(
    () =>
      deriveAppSceneId({
        rendererStatus: rendererState.status,
        requestedScene,
        runtimeOutcome
      }),
    [rendererState.status, requestedScene, runtimeOutcome]
  );
  useEffect(() => {
    if (
      activeScene === "new-game" &&
      previousActiveSceneRef.current !== "new-game"
    ) {
      setPendingCharacterName((currentName) => pickRandomCharacterName(Math.random(), currentName));
    }

    previousActiveSceneRef.current = activeScene;
  }, [activeScene]);
  useEffect(() => {
    writeMetaProfile(metaProfile);
  }, [metaProfile]);
  useEffect(() => {
    patchRuntimeProfilingBridge({
      getConfig: () => runtimeProfilingConfig,
      getShellStatus: () => ({
        activeScene,
        hasActiveSession: runtimeSession.hasActiveSession,
        isMenuOpen,
        requestedScene
      }),
      listScenarios: () => listRuntimeProfilingScenarios(),
      resetConfig: () => {
        const nextConfig = resolveRuntimeProfilingConfigDraft();
        setRuntimeProfilingConfig(nextConfig);
        return nextConfig;
      },
      setConfig: (partialConfig) => {
        const nextConfig = resolveRuntimeProfilingConfigDraft({
          ...runtimeProfilingConfig,
          ...partialConfig
        });
        setRuntimeProfilingConfig(nextConfig);
        return nextConfig;
      }
    });

    return () => {
      clearRuntimeProfilingBridge([
        "getConfig",
        "getShellStatus",
        "listScenarios",
        "resetConfig",
        "setConfig"
      ]);
    };
  }, [activeScene, isMenuOpen, requestedScene, runtimeProfilingConfig, runtimeSession.hasActiveSession]);
  const {
    preferences,
    setBiomeSeamsVisible,
    setDebugPanelVisible,
    setEntityRingsVisible,
    setInspectionPanelVisible,
    setLastMetaScene,
    setMovementOnboardingDismissed,
    setPrefersFullscreen,
    setRuntimeFeedbackVisible
  } = useShellPreferences({
    defaultDebugPanelVisible: false
  });
  const diagnosticsVisible = appConfig.diagnosticsEnabled && preferences.debugPanelVisible;
  const inspecteurVisible = preferences.inspectionPanelVisible;
  const handleEnterFullscreen = useCallback(async () => {
    setPrefersFullscreen(true);
    await enterFullscreen();
  }, [enterFullscreen, setPrefersFullscreen]);
  const handleInstall = useCallback(() => {
    void promptInstall();
  }, [promptInstall]);
  const handleRequestFullscreen = useCallback(() => {
    void handleEnterFullscreen();
  }, [handleEnterFullscreen]);
  const handleRetryRuntime = useCallback(() => {
    resumeRuntime();
    resetRenderer();
  }, [resetRenderer, resumeRuntime]);
  const characterNameValidation = useMemo(
    () => validateCharacterName(pendingCharacterName),
    [pendingCharacterName]
  );
  const handleBeginNewGame = useCallback(() => {
    if (!characterNameValidation.isValid) {
      return;
    }

    if (
      runtimeSession.hasActiveSession &&
      !window.confirm("Starting a new run will replace the current active run. Continue?")
    ) {
      return;
    }

    createNewSession(characterNameValidation.normalizedValue, runtimeSession.worldProfileId);
    setGameOverRecap(null);
    setRuntimeOutcome(null);
    resetRenderer();
    resumeRuntime();
  }, [
    characterNameValidation,
    createNewSession,
    resetRenderer,
    resumeRuntime,
    runtimeSession.hasActiveSession,
    runtimeSession.worldProfileId
  ]);
  const handleOpenNewGame = useCallback(() => {
    showNewGameScene();
  }, [showNewGameScene]);
  const handleOpenGrowth = useCallback(() => {
    showGrowthScene();
  }, [showGrowthScene]);
  const handleCharacterNameChange = useCallback((value: string) => {
    setPendingCharacterName(value);
  }, []);
  const handleReturnToMainMenu = useCallback(() => {
    if (activeScene === "defeat" || activeScene === "victory") {
      endActiveSession();
      setGameOverRecap(null);
      setRuntimeOutcome(null);
    }

    showMainMenuScene();
  }, [activeScene, endActiveSession, showMainMenuScene]);
  const handleOpenSettings = useCallback(() => {
    showSettingsScene();
  }, [showSettingsScene]);
  const handlePurchaseTalentRank = useCallback((talentId: Parameters<typeof purchaseTalentRank>[1]) => {
    setMetaProfile((currentProfile) => purchaseTalentRank(currentProfile, talentId));
  }, []);
  const handlePurchaseShopUnlock = useCallback((unlockId: Parameters<typeof purchaseShopUnlock>[1]) => {
    setMetaProfile((currentProfile) => purchaseShopUnlock(currentProfile, unlockId));
  }, []);
  const handleBossSpawnToast = useCallback(() => {
    pushToast({
      message: "Boss incoming."
    });
  }, [pushToast]);
  const handleApplyDesktopControlBindings = useCallback(
    (nextBindings: DesktopControlBindings) => {
      applyDesktopControlBindings(nextBindings);
    },
    [applyDesktopControlBindings]
  );
  useEffect(() => {
    if (activeScene !== "runtime") {
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
        isMenuOpen ||
        isEditableElement ||
        document.body.dataset.desktopControlCaptureActive === "true"
      ) {
        return;
      }

      event.preventDefault();
      openMenu();
    };

    window.addEventListener("keydown", handleWindowKeyDown);

    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [activeScene, isMenuOpen, openMenu]);
  const hasRuntimeLayer = runtimeSession.hasActiveSession;
  useEffect(() => {
    settledRunRewardKeyRef.current = null;
  }, [runtimeSession.sessionRevision]);
  const settleConcludedRun = useCallback(
    (
      gameState: EmberwakeGameState | null | undefined,
      options?: {
        missionCompleted?: boolean;
        missionItemCount?: number;
      }
    ) => {
      setMetaProfile((currentProfile) => {
        const missionCompleted =
          options?.missionCompleted ?? gameState?.systems.progression.missionCompleted ?? false;
        const missionItemCount =
          options?.missionItemCount ?? gameState?.systems.progression.missionItemCount ?? 0;
        const archivedProfile = gameState
          ? mergeArchiveProgress(
              bankGoldIntoMetaProfile(currentProfile, gameState.systems.progression.goldCollected),
              {
                creatureDefeatCounts: gameState.systems.progression.creatureDefeatCounts,
                discoveredActiveWeaponIds: gameState.systems.progression.discoveredActiveWeaponIds,
                discoveredCreatureIds: gameState.systems.progression.discoveredCreatureIds,
                discoveredFusionIds: gameState.systems.progression.discoveredFusionIds,
                discoveredPassiveItemIds: gameState.systems.progression.discoveredPassiveItemIds
              }
            )
          : currentProfile;

        return recordWorldAttempt(archivedProfile, {
          missionCompleted,
          missionItemCount,
          worldProfileId: runtimeSession.worldProfileId
        });
      });
    },
    [runtimeSession.worldProfileId]
  );
  const updateGameOverRecap = useCallback((gameState: EmberwakeGameState | null) => {
    if (!gameState) {
      return;
    }

    setGameOverRecap({
      defeatDetail: gameState.systems.outcome.detail,
      goldCollected: gameState.systems.progression.goldCollected,
      hostileDefeats: gameState.systems.progression.hostileDefeats,
      playerName: runtimeSession.playerName || "Wanderer",
      runPhaseLabel: gameState.systems.progression.phaseLabel,
      skillPerformanceSummaries: gameState.systems.outcome.skillPerformanceSummaries,
      ticksSurvived: gameState.systems.progression.runtimeTicksSurvived,
      traversalDistanceWorldUnits: gameState.systems.progression.traversalDistanceWorldUnits
    });
  }, [runtimeSession.playerName]);
  const handleRuntimeStateChange = useCallback((gameState: EmberwakeGameState) => {
    latestGameStateRef.current = gameState;

    if (
      gameState.systems.outcome.kind === "defeat" ||
      gameState.systems.outcome.kind === "victory"
    ) {
      const rewardKey = [
        runtimeSession.sessionRevision,
        gameState.systems.outcome.kind,
        gameState.systems.outcome.emittedAtTick ?? gameState.simulation.tick
      ].join(":");

      if (settledRunRewardKeyRef.current !== rewardKey) {
        settledRunRewardKeyRef.current = rewardKey;
        settleConcludedRun(gameState);
      }
    }

    if (
      gameState.systems.outcome.kind === "defeat" ||
      gameState.systems.outcome.kind === "victory"
    ) {
      updateGameOverRecap(gameState);
    }
  }, [runtimeSession.sessionRevision, settleConcludedRun, updateGameOverRecap]);
  const handleAbandonRun = useCallback(() => {
    if (!runtimeSession.hasActiveSession) {
      return;
    }

    if (!window.confirm("Abandon the current run? This will count as a failed attempt.")) {
      return;
    }

    settleConcludedRun(latestGameStateRef.current ?? sessionInitState ?? null);
    endActiveSession();
    setGameOverRecap(null);
    setRuntimeOutcome(null);
    showMainMenuScene();
    pushToast({
      message: "Run abandoned.",
      tone: "success"
    });
  }, [
    endActiveSession,
    pushToast,
    runtimeSession.hasActiveSession,
    sessionInitState,
    settleConcludedRun,
    showMainMenuScene
  ]);
  const latestProgression = (latestGameStateRef.current ?? sessionInitState)?.systems.progression;
  const progressionSnapshot = {
    ...overlayArchiveProgress(
      metaProfile,
      latestProgression
        ? {
            creatureDefeatCounts: latestProgression.creatureDefeatCounts,
            discoveredActiveWeaponIds: latestProgression.discoveredActiveWeaponIds,
            discoveredCreatureIds: latestProgression.discoveredCreatureIds,
            discoveredFusionIds: latestProgression.discoveredFusionIds,
            discoveredPassiveItemIds: latestProgression.discoveredPassiveItemIds
          }
        : null
    ),
    phaseLabel: latestProgression?.phaseLabel ?? "Ember Watch"
  };
  const metaScenePanel = (
    <AppMetaScenePanel
      biomeSeamsVisible={preferences.biomeSeamsVisible}
      canResumeSession={runtimeSession.hasActiveSession}
      characterNameError={characterNameValidation.error}
      desktopControlBindings={desktopControlBindings}
      entityRingsVisible={preferences.entityRingsVisible}
      fullscreenPreferred={preferences.prefersFullscreen}
      gameOverRecap={gameOverRecap}
      isMobileLayout={viewport.layoutMode === "mobile"}
      isShellMenuOpen={isMenuOpen}
      metaProfile={metaProfile}
      onAbandonRun={handleAbandonRun}
      onApplyDesktopControlBindings={handleApplyDesktopControlBindings}
      onBeginNewGame={handleBeginNewGame}
      onCharacterNameChange={handleCharacterNameChange}
      onOpenBestiary={showBestiaryScene}
      onOpenChangelogs={showChangelogsScene}
      onOpenGrowth={handleOpenGrowth}
      onOpenGrimoire={showGrimoireScene}
      onOpenNewGame={handleOpenNewGame}
      onPurchaseShopUnlock={handlePurchaseShopUnlock}
      onPurchaseTalentRank={handlePurchaseTalentRank}
      onOpenSettings={handleOpenSettings}
      onReturnToMainMenu={handleReturnToMainMenu}
      onResumeRuntime={resumeRuntime}
      onSelectWorldProfile={setWorldProfileId}
      onSetBiomeSeamsVisible={setBiomeSeamsVisible}
      onSetEntityRingsVisible={setEntityRingsVisible}
      pendingCharacterName={pendingCharacterName}
      playerName={runtimeSession.playerName}
      playerWorldPosition={(latestGameStateRef.current ?? sessionInitState)?.simulation.entity.worldPosition ?? null}
      progressionSnapshot={progressionSnapshot}
      runtimeOutcome={runtimeOutcome}
      scene={activeScene}
      selectedWorldProfileId={runtimeSession.worldProfileId}
    />
  );
  const shellOverlay = (
    <>
      {metaScenePanel}
      <AppUpdatePrompt
        isApplyingUpdate={isApplyingUpdate}
        isOpen={isPromptOpen}
        isUpdateReady={isUpdateReady}
        onApplyUpdate={() => {
          void applyUpdate();
        }}
        onDismiss={dismissPrompt}
        onReopen={reopenPrompt}
      />
      <ShellToastStack onDismiss={dismissToast} toasts={toasts} />
    </>
  );

  return (
    <main
      className="app-shell"
      data-app-ready="true"
      data-layout-mode={viewport.layoutMode}
      data-renderer-status={rendererState.status}
      data-runtime-ready-ms={rendererState.metrics.rendererReadyMs ?? "pending"}
      data-scene={activeScene}
      ref={shellRef}
    >
      {hasRuntimeLayer ? (
        <Suspense
          fallback={
            <>
              <section className="app-shell__runtime" aria-label="Interactive runtime shell" />
              <section className="app-shell__overlay" aria-label="Shell status overlay">
                {shellOverlay}
              </section>
            </>
          }
        >
          <LazyActiveRuntimeShellContent
            activeScene={activeScene}
            onAbandonRun={handleAbandonRun}
            canInstall={canInstall}
            cycleWorldSeed={cycleWorldSeed}
            desktopControlBindings={desktopControlBindings}
            diagnosticsVisible={diagnosticsVisible}
            inspecteurVisible={inspecteurVisible}
            isFullscreen={isFullscreen}
            isFullscreenSupported={isSupported}
            isMenuOpen={isMenuOpen}
            lastFullscreenError={lastError}
            metaOverlay={shellOverlay}
            metaProgression={deriveBuildMetaProgression(metaProfile)}
            onEnterFullscreen={handleRequestFullscreen}
            onInstall={handleInstall}
            onMenuOpenChange={(nextIsOpen) => {
              if (nextIsOpen) {
                openMenu();
                return;
              }

              closeShellSurface();
            }}
            onBossSpawnToast={handleBossSpawnToast}
            onRendererError={markFailed}
            onRendererReady={markReady}
            onRetryRuntime={handleRetryRuntime}
            onResumeRuntime={resumeRuntime}
            onRuntimeOutcomeChange={setRuntimeOutcome}
            onRuntimeStateChange={handleRuntimeStateChange}
            onSetCameraMode={setCameraMode}
            onSetCameraState={setCameraState}
            onSetDebugPanelVisible={setDebugPanelVisible}
            onSetInspectionPanelVisible={setInspectionPanelVisible}
            onSetLastMetaScene={setLastMetaScene}
            onSetMovementOnboardingDismissed={setMovementOnboardingDismissed}
            onSetRuntimeFeedbackVisible={setRuntimeFeedbackVisible}
            onShowMainMenuScene={showMainMenuScene}
            onShowPauseScene={showPauseScene}
            onShowSettingsScene={handleOpenSettings}
            preferences={preferences}
            profilingConfig={runtimeProfilingConfig}
            rendererState={rendererState}
            runtimeSession={runtimeSession}
            sessionInitState={sessionInitState}
            shellRequestedScene={shellRequestedScene}
            viewport={viewport}
          />
        </Suspense>
      ) : (
        <>
          <section className="app-shell__runtime" aria-label="Interactive runtime shell" />
          <section className="app-shell__overlay" aria-label="Shell status overlay">
            {shellOverlay}
          </section>
        </>
      )}
    </main>
  );
}
