import { useCallback, useMemo, useRef, useState } from "react";

import { ActiveRuntimeShellContent } from "./components/ActiveRuntimeShellContent";
import { AppMetaScenePanel } from "./components/AppMetaScenePanel";
import { useAppScene } from "./hooks/useAppScene";
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
import { appConfig } from "../shared/config/appConfig";

export function AppShell() {
  const shellRef = useRef<HTMLElement>(null);
  const [pendingCharacterName, setPendingCharacterName] = useState(defaultCharacterName);
  const [runtimeOutcome, setRuntimeOutcome] = useState<RuntimeShellOutcome | null>(null);
  useDocumentViewportLock();
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
  const isLoadAvailable = false;
  const hasRuntimeLayer = runtimeSession.hasActiveSession;

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
        <ActiveRuntimeShellContent
          activeScene={activeScene}
          canInstall={canInstall}
          cycleWorldSeed={cycleWorldSeed}
          diagnosticsVisible={diagnosticsVisible}
          inspecteurVisible={inspecteurVisible}
          isFullscreen={isFullscreen}
          isFullscreenSupported={isSupported}
          isMenuOpen={isMenuOpen}
          lastFullscreenError={lastError}
          metaOverlay={
            <AppMetaScenePanel
              canResumeSession={runtimeSession.hasActiveSession}
              characterNameError={characterNameValidation.error}
              fullscreenPreferred={preferences.prefersFullscreen}
              isLoadAvailable={isLoadAvailable}
              onBeginNewGame={handleBeginNewGame}
              onCharacterNameChange={handleCharacterNameChange}
              onOpenNewGame={handleOpenNewGame}
              onOpenSettings={showSettingsScene}
              onReturnToMainMenu={handleReturnToMainMenu}
              onResumeRuntime={resumeRuntime}
              pendingCharacterName={pendingCharacterName}
              playerName={runtimeSession.playerName}
              runtimeOutcome={runtimeOutcome}
              scene={activeScene}
            />
          }
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
          onShowMainMenuScene={showMainMenuScene}
          onShowPauseScene={showPauseScene}
          onShowSettingsScene={showSettingsScene}
          preferences={preferences}
          rendererState={rendererState}
          runtimeSession={runtimeSession}
          shellRequestedScene={shellRequestedScene}
          viewport={viewport}
        />
      ) : (
        <>
          <section className="app-shell__runtime" aria-label="Interactive runtime shell" />
          <section className="app-shell__overlay" aria-label="Shell status overlay">
            <AppMetaScenePanel
              canResumeSession={runtimeSession.hasActiveSession}
              characterNameError={characterNameValidation.error}
              fullscreenPreferred={preferences.prefersFullscreen}
              isLoadAvailable={isLoadAvailable}
              onBeginNewGame={handleBeginNewGame}
              onCharacterNameChange={handleCharacterNameChange}
              onOpenNewGame={handleOpenNewGame}
              onOpenSettings={showSettingsScene}
              onReturnToMainMenu={handleReturnToMainMenu}
              onResumeRuntime={resumeRuntime}
              pendingCharacterName={pendingCharacterName}
              playerName={runtimeSession.playerName}
              runtimeOutcome={runtimeOutcome}
              scene={activeScene}
            />
          </section>
        </>
      )}
    </main>
  );
}
