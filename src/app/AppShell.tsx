import { useEffect, useMemo, useRef } from "react";

import { AppMetaScenePanel } from "./components/AppMetaScenePanel";
import { EntityInspectionPanel } from "./components/EntityInspectionPanel";
import { RuntimeSceneBoundary } from "./components/RuntimeSceneBoundary";
import { ShellMenu } from "./components/ShellMenu";
import { useAppScene } from "./hooks/useAppScene";
import { useDocumentViewportLock } from "./hooks/useDocumentViewportLock";
import { useFullscreenController } from "./hooks/useFullscreenController";
import { useInstallPrompt } from "./hooks/useInstallPrompt";
import { useLogicalViewportModel } from "./hooks/useLogicalViewportModel";
import { useRendererHealth } from "./hooks/useRendererHealth";
import { useRuntimeSession } from "./hooks/useRuntimeSession";
import { useShellPreferences } from "./hooks/useShellPreferences";
import { useRuntimeInteractionGuards } from "./hooks/useRuntimeInteractionGuards";
import { worldPointToChunkCoordinate } from "@engine/world/worldContract";
import { useCameraController } from "../game/camera/hooks/useCameraController";
import { ShellDiagnosticsPanel } from "../game/debug/ShellDiagnosticsPanel";
import { useDebugPanelHotkey } from "../game/debug/hooks/useDebugPanelHotkey";
import { useEntitySimulation } from "../game/entities/hooks/useEntitySimulation";
import { useEntityWorld } from "../game/entities/hooks/useEntityWorld";
import { entityContract } from "../game/entities/model/entityContract";
import { MobileVirtualStickOverlay } from "../game/input/components/MobileVirtualStickOverlay";
import { useMobileVirtualStick } from "../game/input/hooks/useMobileVirtualStick";
import { useSingleEntityControl } from "../game/input/hooks/useSingleEntityControl";
import { useWorldInteractionDiagnostics } from "../game/world/hooks/useWorldInteractionDiagnostics";
import { useVisibleChunkSet } from "../game/world/hooks/useVisibleChunkSet";
import { appConfig } from "../shared/config/appConfig";
import { createIdleMovementIntent } from "../game/input/model/singleEntityControlContract";

export function AppShell() {
  const shellRef = useRef<HTMLElement>(null);
  const runtimeSurfaceRef = useRef<HTMLDivElement>(null);
  useDocumentViewportLock();
  useRuntimeInteractionGuards(runtimeSurfaceRef);
  const mobileVirtualStick = useMobileVirtualStick({
    surfaceRef: runtimeSurfaceRef
  });
  const { canInstall, promptInstall } = useInstallPrompt();
  const runtimeControlState = useSingleEntityControl({
    controlledEntityId: entityContract.primaryEntityId,
    touchMovementIntent: mobileVirtualStick.movementIntent
  });
  const { enterFullscreen, isFullscreen, isSupported, lastError } =
    useFullscreenController(shellRef);
  const viewport = useLogicalViewportModel(shellRef);
  const { cycleWorldSeed, runtimeSession, setCameraMode, setCameraState } = useRuntimeSession();
  const { markFailed, markReady, rendererState, reset: resetRenderer } = useRendererHealth();
  const appScene = useAppScene({
    rendererStatus: rendererState.status
  });
  const controlState = useMemo(
    () =>
      appScene.activeScene === "runtime"
        ? runtimeControlState
        : {
            ...runtimeControlState,
            debugCameraModifierActive: false,
            inputOwner: "none" as const,
            movementIntent: createIdleMovementIntent("none")
          },
    [appScene.activeScene, runtimeControlState]
  );
  const simulationState = useEntitySimulation({ controlState });
  const followedWorldPosition =
    simulationState.presentation.cameraTarget?.worldPosition ?? simulationState.entity.worldPosition;
  const { cameraState, resetCamera } = useCameraController({
    cameraMode: runtimeSession.cameraMode,
    debugCameraEnabled: controlState.debugCameraModifierActive,
    followedWorldPosition,
    initialCameraState: runtimeSession.cameraState,
    onCameraStateChange: setCameraState,
    surfaceRef: runtimeSurfaceRef,
    viewport
  });
  const chunkVisibility = useVisibleChunkSet(cameraState, viewport);
  const worldDiagnostics = useWorldInteractionDiagnostics({
    camera: cameraState,
    surfaceRef: runtimeSurfaceRef,
    viewport
  });
  const entityWorld = useEntityWorld({
    primaryEntity: simulationState.entity,
    selectedWorldPoint: worldDiagnostics.selectedWorldPoint,
    visibleChunks: chunkVisibility.visibleChunks
  });
  const {
    preferences,
    setDebugPanelVisible,
    setInspectionPanelVisible,
    setLastMetaScene,
    setPrefersFullscreen
  } = useShellPreferences({
    defaultDebugPanelVisible: false
  });
  const isMobileLayout = viewport.layoutMode === "mobile";

  useDebugPanelHotkey({
    enabled: appConfig.diagnosticsEnabled,
    onToggle: () => {
      setDebugPanelVisible(!preferences.debugPanelVisible);
    }
  });
  const diagnosticsVisible = appConfig.diagnosticsEnabled && preferences.debugPanelVisible;
  const inspecteurVisible = preferences.inspectionPanelVisible;
  const handleEnterFullscreen = async () => {
    setPrefersFullscreen(true);
    await enterFullscreen();
  };
  const selectedEntityChunk = worldPointToChunkCoordinate(entityWorld.selectedEntity.worldPosition);

  useEffect(() => {
    if (appScene.activeScene === "pause" || appScene.activeScene === "settings") {
      simulationState.controls.pause();
      setLastMetaScene(appScene.activeScene);
      return;
    }

    if (appScene.activeScene === "runtime") {
      simulationState.controls.resume();
      setLastMetaScene("none");
    }
  }, [appScene.activeScene, setLastMetaScene, simulationState.controls]);

  return (
    <main
      className="app-shell"
      data-app-ready="true"
      data-layout-mode={viewport.layoutMode}
      data-renderer-status={rendererState.status}
      data-runtime-ready-ms={rendererState.metrics.rendererReadyMs ?? "pending"}
      data-scene={appScene.activeScene}
      data-shell-surface={appScene.shellSurface}
      ref={shellRef}
    >
      <section className="app-shell__runtime" aria-label="Interactive runtime shell">
        <RuntimeSceneBoundary
          camera={cameraState}
          onOpenSettings={appScene.showSettingsScene}
          onRendererError={markFailed}
          onRendererReady={markReady}
          onRetryRuntime={() => {
            appScene.resumeRuntime();
            resetRenderer();
          }}
          rendererMessage={rendererState.message}
          scene={appScene.activeScene}
          surfaceRef={runtimeSurfaceRef}
          visibleEntities={entityWorld.visibleEntities}
          visibleChunks={chunkVisibility.visibleChunks}
          viewport={viewport}
          worldSeed={runtimeSession.worldSeed}
        />
      </section>

      <section className="app-shell__overlay" aria-label="Shell status overlay">
        <ShellMenu
          activeScene={appScene.activeScene}
          cameraMode={runtimeSession.cameraMode}
          canInstall={canInstall}
          diagnosticsEnabled={appConfig.diagnosticsEnabled}
          diagnosticsVisible={diagnosticsVisible}
          inspecteurVisible={inspecteurVisible}
          isOpen={appScene.isMenuOpen}
          isFullscreen={isFullscreen}
          isFullscreenSupported={isSupported}
          onEnterFullscreen={() => {
            void handleEnterFullscreen();
          }}
          onInstall={() => {
            void promptInstall();
          }}
          onOpenChange={(isOpen) => {
            if (isOpen) {
              appScene.openMenu();
              return;
            }

            appScene.closeShellSurface();
          }}
          onResetCamera={resetCamera}
          onResumeRuntime={appScene.resumeRuntime}
          onSetCameraMode={setCameraMode}
          onShowPauseScene={appScene.showPauseScene}
          onShowSettingsScene={appScene.showSettingsScene}
          onToggleDiagnostics={() => {
            setDebugPanelVisible(!preferences.debugPanelVisible);
          }}
          onToggleInspecteur={() => {
            setInspectionPanelVisible(!preferences.inspectionPanelVisible);
          }}
        />

        {inspecteurVisible ? (
          <EntityInspectionPanel
            entityChunk={`${selectedEntityChunk.x}, ${selectedEntityChunk.y}`}
            entityId={entityWorld.selectedEntity.id}
            entityLabel={entityWorld.selectedEntity.id.split(":").at(-1) ?? entityWorld.selectedEntity.id}
            entityPosition={`${Math.round(entityWorld.selectedEntity.worldPosition.x)}, ${Math.round(entityWorld.selectedEntity.worldPosition.y)}`}
            entitySelectionState={entityWorld.selectedEntity.isSelected ? "selected" : "not selected"}
            entityState={entityWorld.selectedEntity.state}
            isMobile={isMobileLayout}
            onClose={() => {
              setInspectionPanelVisible(false);
            }}
          />
        ) : null}

        <AppMetaScenePanel
          fullscreenPreferred={preferences.prefersFullscreen}
          onResumeRuntime={appScene.resumeRuntime}
          scene={appScene.activeScene}
        />

        <ShellDiagnosticsPanel
          camera={cameraState}
          control={runtimeControlState}
          entity={entityWorld.selectedEntity ?? simulationState.entity}
          fullscreen={{
            isFullscreen,
            isSupported,
            lastError
          }}
          worldDiagnostics={worldDiagnostics}
          worldRender={{
            cachedChunkIds: chunkVisibility.cachedChunkIds,
            overlappingPairs: entityWorld.overlappingPairs.length,
            trackedEntities: entityWorld.trackedEntities.length,
            visibleEntities: entityWorld.visibleEntities.length,
            preloadMargin: chunkVisibility.preloadMargin,
            visibleChunks: chunkVisibility.visibleChunks,
            worldSeed: runtimeSession.worldSeed
          }}
          preferences={preferences}
          renderer={rendererState}
          simulation={{
            ...simulationState.runtime,
            tick: simulationState.tick
          }}
          simulationControls={{
            ...simulationState.controls,
            cycleWorldSeed
          }}
          onClose={() => {
            setDebugPanelVisible(false);
          }}
          viewport={viewport}
          visible={diagnosticsVisible}
        />
      </section>

      <MobileVirtualStickOverlay stickState={mobileVirtualStick} />
    </main>
  );
}
