import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";

import { AppMetaScenePanel } from "./components/AppMetaScenePanel";
import { useAppScene } from "./hooks/useAppScene";
import { useDesktopControlBindings } from "./hooks/useDesktopControlBindings";
import { useDocumentViewportLock } from "./hooks/useDocumentViewportLock";
import { useFullscreenController } from "./hooks/useFullscreenController";
import { useInstallPrompt } from "./hooks/useInstallPrompt";
import { useLogicalViewportModel } from "./hooks/useLogicalViewportModel";
import { useRendererHealth } from "./hooks/useRendererHealth";
import { useRuntimeSession } from "./hooks/useRuntimeSession";
import { useShellPreferences } from "./hooks/useShellPreferences";
import { deriveAppSceneId } from "./model/appScene";
import type { RuntimeShellOutcome } from "./model/appScene";
import { defaultCharacterName, validateCharacterName } from "./model/characterName";
import type {
  DesktopControlBindings
} from "../game/input/model/singleEntityControlContract";
import { appConfig } from "../shared/config/appConfig";

const LazyActiveRuntimeShellContent = lazy(async () => {
  const module = await import("./components/ActiveRuntimeShellContent");

  return {
    default: module.ActiveRuntimeShellContent
  };
});

export function AppShell() {
  const shellRef = useRef<HTMLElement>(null);
  const [pendingCharacterName, setPendingCharacterName] = useState(defaultCharacterName);
  const [runtimeOutcome, setRuntimeOutcome] = useState<RuntimeShellOutcome | null>(null);
  useDocumentViewportLock();
  const { applyDesktopControlBindings, desktopControlBindings } = useDesktopControlBindings();
  const { canInstall, promptInstall } = useInstallPrompt();
  const { enterFullscreen, isFullscreen, isSupported, lastError } =
    useFullscreenController(shellRef);
  const viewport = useLogicalViewportModel(shellRef);
  const {
    createNewSession,
    cycleWorldSeed,
    runtimeSession,
    setCameraMode,
    setCameraState
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
  const {
    preferences,
    setDebugPanelVisible,
    setInspectionPanelVisible,
    setLastMetaScene,
    setMovementOnboardingDismissed,
    setPrefersFullscreen
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
      !window.confirm("Starting a new game will replace the current unsaved session. Continue?")
    ) {
      return;
    }

    createNewSession(characterNameValidation.normalizedValue);
    resetRenderer();
    resumeRuntime();
  }, [
    characterNameValidation,
    createNewSession,
    resetRenderer,
    resumeRuntime,
    runtimeSession.hasActiveSession
  ]);
  const handleOpenNewGame = useCallback(() => {
    showNewGameScene();
  }, [showNewGameScene]);
  const handleCharacterNameChange = useCallback((value: string) => {
    setPendingCharacterName(value);
  }, []);
  const handleReturnToMainMenu = useCallback(() => {
    showMainMenuScene();
  }, [showMainMenuScene]);
  const handleOpenSettings = useCallback(() => {
    showSettingsScene();
  }, [showSettingsScene]);
  const handleApplyDesktopControlBindings = useCallback(
    (nextBindings: DesktopControlBindings) => {
      applyDesktopControlBindings(nextBindings);
    },
    [applyDesktopControlBindings]
  );
  const isLoadAvailable = false;
  const hasRuntimeLayer = runtimeSession.hasActiveSession;
  const metaScenePanel = (
    <AppMetaScenePanel
      canResumeSession={runtimeSession.hasActiveSession}
      characterNameError={characterNameValidation.error}
      desktopControlBindings={desktopControlBindings}
      fullscreenPreferred={preferences.prefersFullscreen}
      isLoadAvailable={isLoadAvailable}
      onApplyDesktopControlBindings={handleApplyDesktopControlBindings}
      onBeginNewGame={handleBeginNewGame}
      onCharacterNameChange={handleCharacterNameChange}
      onOpenNewGame={handleOpenNewGame}
      onOpenSettings={handleOpenSettings}
      onReturnToMainMenu={handleReturnToMainMenu}
      onResumeRuntime={resumeRuntime}
      pendingCharacterName={pendingCharacterName}
      playerName={runtimeSession.playerName}
      runtimeOutcome={runtimeOutcome}
      scene={activeScene}
    />
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
                {metaScenePanel}
              </section>
            </>
          }
        >
          <LazyActiveRuntimeShellContent
            activeScene={activeScene}
            canInstall={canInstall}
            cycleWorldSeed={cycleWorldSeed}
            desktopControlBindings={desktopControlBindings}
            diagnosticsVisible={diagnosticsVisible}
            inspecteurVisible={inspecteurVisible}
            isFullscreen={isFullscreen}
            isFullscreenSupported={isSupported}
            isMenuOpen={isMenuOpen}
            lastFullscreenError={lastError}
            metaOverlay={metaScenePanel}
            onEnterFullscreen={handleRequestFullscreen}
            onInstall={handleInstall}
            onMenuOpenChange={(nextIsOpen) => {
              if (nextIsOpen) {
                openMenu();
                return;
              }

              closeShellSurface();
            }}
            onRendererError={markFailed}
            onRendererReady={markReady}
            onRetryRuntime={handleRetryRuntime}
            onResumeRuntime={resumeRuntime}
            onRuntimeOutcomeChange={setRuntimeOutcome}
            onSetCameraMode={setCameraMode}
            onSetCameraState={setCameraState}
            onSetDebugPanelVisible={setDebugPanelVisible}
            onSetInspectionPanelVisible={setInspectionPanelVisible}
            onSetLastMetaScene={setLastMetaScene}
            onSetMovementOnboardingDismissed={setMovementOnboardingDismissed}
            onShowMainMenuScene={showMainMenuScene}
            onShowPauseScene={showPauseScene}
            onShowSettingsScene={handleOpenSettings}
            preferences={preferences}
            rendererState={rendererState}
            runtimeSession={runtimeSession}
            shellRequestedScene={shellRequestedScene}
            viewport={viewport}
          />
        </Suspense>
      ) : (
        <>
          <section className="app-shell__runtime" aria-label="Interactive runtime shell" />
          <section className="app-shell__overlay" aria-label="Shell status overlay">
            {metaScenePanel}
          </section>
        </>
      )}
    </main>
  );
}
