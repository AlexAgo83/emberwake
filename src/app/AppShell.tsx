import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { useSampledValue } from "./hooks/useSampledValue";
import { useShellPreferences } from "./hooks/useShellPreferences";
import { useRuntimeTelemetryBridge } from "./hooks/useRuntimeTelemetryBridge";
import { useRuntimeInteractionGuards } from "./hooks/useRuntimeInteractionGuards";
import { runtimePublicationContract } from "./model/runtimePublicationContract";
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
  const runtimeSurfaceRef = useRef<HTMLDivElement | null>(null);
  const [runtimeSurfaceElement, setRuntimeSurfaceElement] = useState<HTMLDivElement | null>(null);
  useDocumentViewportLock();
  const handleRuntimeSurfaceElementChange = useCallback((element: HTMLDivElement | null) => {
    runtimeSurfaceRef.current = element;
    setRuntimeSurfaceElement(element);
  }, []);
  useRuntimeInteractionGuards(runtimeSurfaceElement);
  const mobileVirtualStick = useMobileVirtualStick({
    surfaceElement: runtimeSurfaceElement
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
  const {
    activeScene,
    closeShellSurface,
    isMenuOpen,
    openMenu,
    resumeRuntime,
    shellSurface,
    showPauseScene,
    showSettingsScene
  } = appScene;
  const controlState = useMemo(
    () =>
      activeScene === "runtime"
        ? runtimeControlState
        : {
            ...runtimeControlState,
            debugCameraModifierActive: false,
            inputOwner: "none" as const,
            movementIntent: createIdleMovementIntent("none")
          },
    [activeScene, runtimeControlState]
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
    surfaceElement: runtimeSurfaceElement,
    viewport
  });
  const chunkVisibility = useVisibleChunkSet(cameraState, viewport);
  const worldDiagnostics = useWorldInteractionDiagnostics({
    camera: cameraState,
    surfaceElement: runtimeSurfaceElement,
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
  const diagnosticsVisible = appConfig.diagnosticsEnabled && preferences.debugPanelVisible;
  const inspecteurVisible = preferences.inspectionPanelVisible;
  const handleToggleDiagnostics = useCallback(() => {
    setDebugPanelVisible(!preferences.debugPanelVisible);
  }, [preferences.debugPanelVisible, setDebugPanelVisible]);
  const handleToggleInspecteur = useCallback(() => {
    setInspectionPanelVisible(!preferences.inspectionPanelVisible);
  }, [preferences.inspectionPanelVisible, setInspectionPanelVisible]);
  const handleMenuOpenChange = useCallback((isOpen: boolean) => {
    if (isOpen) {
      openMenu();
      return;
    }

    closeShellSurface();
  }, [closeShellSurface, openMenu]);
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
  const handleCloseInspectionPanel = useCallback(() => {
    setInspectionPanelVisible(false);
  }, [setInspectionPanelVisible]);
  const handleCloseDiagnostics = useCallback(() => {
    setDebugPanelVisible(false);
  }, [setDebugPanelVisible]);
  const diagnosticsPanelProps = useMemo(
    () => ({
      camera: cameraState,
      control: runtimeControlState,
      entity: entityWorld.selectedEntity ?? simulationState.entity,
      fullscreen: {
        isFullscreen,
        isSupported,
        lastError
      },
      onClose: handleCloseDiagnostics,
      preferences,
      publication: runtimePublicationContract.hotPathSurfaceModes,
      renderer: rendererState,
      simulation: {
        ...simulationState.runtime,
        tick: simulationState.tick
      },
      simulationControls: {
        ...simulationState.controls,
        cycleWorldSeed
      },
      viewport,
      worldDiagnostics,
      worldRender: {
        cachedChunkIds: chunkVisibility.cachedChunkIds,
        overlappingPairs: entityWorld.overlappingPairs.length,
        preloadMargin: chunkVisibility.preloadMargin,
        trackedEntities: entityWorld.trackedEntities.length,
        visibleEntities: entityWorld.visibleEntities.length,
        visibleChunks: chunkVisibility.visibleChunks,
        worldSeed: runtimeSession.worldSeed
      }
    }),
    [
      cameraState,
      chunkVisibility.cachedChunkIds,
      chunkVisibility.preloadMargin,
      chunkVisibility.visibleChunks,
      cycleWorldSeed,
      entityWorld.overlappingPairs.length,
      entityWorld.selectedEntity,
      entityWorld.trackedEntities.length,
      entityWorld.visibleEntities.length,
      handleCloseDiagnostics,
      isFullscreen,
      isSupported,
      lastError,
      preferences,
      rendererState,
      runtimeControlState,
      runtimeSession.worldSeed,
      simulationState.controls,
      simulationState.entity,
      simulationState.runtime,
      simulationState.tick,
      viewport,
      worldDiagnostics
    ]
  );
  const sampledDiagnosticsPanelProps = useSampledValue(diagnosticsPanelProps, {
    enabled: diagnosticsVisible,
    intervalMs: runtimePublicationContract.diagnosticsSamplingIntervalMs
  });

  useRuntimeTelemetryBridge({
    activeScene,
    diagnosticsVisible,
    publication: runtimePublicationContract.hotPathSurfaceModes,
    rendererState,
    runtime: simulationState.runtime
  });

  useDebugPanelHotkey({
    enabled: appConfig.diagnosticsEnabled,
    onToggle: handleToggleDiagnostics
  });
  const selectedEntityChunk = worldPointToChunkCoordinate(entityWorld.selectedEntity.worldPosition);

  useEffect(() => {
    if (activeScene === "pause" || activeScene === "settings") {
      simulationState.controls.pause();
      setLastMetaScene(activeScene);
      return;
    }

    if (activeScene === "runtime") {
      simulationState.controls.resume();
      setLastMetaScene("none");
    }
  }, [activeScene, setLastMetaScene, simulationState.controls]);

  return (
    <main
      className="app-shell"
      data-app-ready="true"
      data-layout-mode={viewport.layoutMode}
      data-renderer-status={rendererState.status}
      data-runtime-ready-ms={rendererState.metrics.rendererReadyMs ?? "pending"}
      data-scene={activeScene}
      data-shell-surface={shellSurface}
      ref={shellRef}
    >
      <section className="app-shell__runtime" aria-label="Interactive runtime shell">
        <RuntimeSceneBoundary
          camera={cameraState}
          onOpenSettings={showSettingsScene}
          onRendererError={markFailed}
          onRendererReady={markReady}
          onRetryRuntime={handleRetryRuntime}
          onSurfaceElementChange={handleRuntimeSurfaceElementChange}
          onVisualFrame={simulationState.controls.advanceVisualFrame}
          rendererMessage={rendererState.message}
          scene={activeScene}
          visibleEntities={entityWorld.visibleEntities}
          visibleChunks={chunkVisibility.visibleChunks}
          viewport={viewport}
          worldSeed={runtimeSession.worldSeed}
        />
      </section>

      <section className="app-shell__overlay" aria-label="Shell status overlay">
        <ShellMenu
          activeScene={activeScene}
          cameraMode={runtimeSession.cameraMode}
          canInstall={canInstall}
          diagnosticsEnabled={appConfig.diagnosticsEnabled}
          diagnosticsVisible={diagnosticsVisible}
          inspecteurVisible={inspecteurVisible}
          isOpen={isMenuOpen}
          isFullscreen={isFullscreen}
          isFullscreenSupported={isSupported}
          onEnterFullscreen={handleRequestFullscreen}
          onInstall={handleInstall}
          onOpenChange={handleMenuOpenChange}
          onResetCamera={resetCamera}
          onResumeRuntime={resumeRuntime}
          onSetCameraMode={setCameraMode}
          onShowPauseScene={showPauseScene}
          onShowSettingsScene={showSettingsScene}
          onToggleDiagnostics={handleToggleDiagnostics}
          onToggleInspecteur={handleToggleInspecteur}
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
            onClose={handleCloseInspectionPanel}
          />
        ) : null}

        <AppMetaScenePanel
          fullscreenPreferred={preferences.prefersFullscreen}
          onResumeRuntime={resumeRuntime}
          scene={activeScene}
        />

        {diagnosticsVisible ? (
          <ShellDiagnosticsPanel
            {...sampledDiagnosticsPanelProps}
            visible={diagnosticsVisible}
          />
        ) : null}
      </section>

      <MobileVirtualStickOverlay stickState={mobileVirtualStick} />
    </main>
  );
}
