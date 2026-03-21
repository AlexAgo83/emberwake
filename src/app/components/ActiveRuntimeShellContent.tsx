import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { EntityInspectionPanel } from "./EntityInspectionPanel";
import { PlayerHudCard } from "./PlayerHudCard";
import { RuntimeSceneBoundary } from "./RuntimeSceneBoundary";
import { ShellMenu } from "./ShellMenu";
import { runtimePublicationContract } from "../model/runtimePublicationContract";
import type { AppSceneId, RuntimeShellOutcome } from "../model/appScene";
import { worldPointToChunkCoordinate } from "@engine";
import { useCameraController } from "../../game/camera/hooks/useCameraController";
import { ShellDiagnosticsPanel } from "../../game/debug/ShellDiagnosticsPanel";
import { useDebugPanelHotkey } from "../../game/debug/hooks/useDebugPanelHotkey";
import { useEntitySimulation } from "../../game/entities/hooks/useEntitySimulation";
import { useEntityWorld } from "../../game/entities/hooks/useEntityWorld";
import { entityContract } from "../../game/entities/model/entityContract";
import { MobileVirtualStickOverlay } from "../../game/input/components/MobileVirtualStickOverlay";
import { useMobileVirtualStick } from "../../game/input/hooks/useMobileVirtualStick";
import { useSingleEntityControl } from "../../game/input/hooks/useSingleEntityControl";
import { createIdleMovementIntent } from "../../game/input/model/singleEntityControlContract";
import { useWorldInteractionDiagnostics } from "../../game/world/hooks/useWorldInteractionDiagnostics";
import { useVisibleChunkSet } from "../../game/world/hooks/useVisibleChunkSet";
import { appConfig } from "../../shared/config/appConfig";
import type { CameraMode } from "../../game/camera/model/cameraMode";
import type { CameraState } from "../../game/camera/model/cameraMath";
import type { RendererState } from "../hooks/useRendererHealth";
import { useRuntimeTelemetryBridge } from "../hooks/useRuntimeTelemetryBridge";
import { useRuntimeInteractionGuards } from "../hooks/useRuntimeInteractionGuards";
import type { RuntimeSessionState } from "../../shared/lib/runtimeSessionStorage";
import type { ShellPreferences } from "../../shared/lib/shellPreferencesStorage";
import type { ReturnTypeUseLogicalViewportModel } from "../../game/debug/types";
import type { DesktopControlBindings } from "../../game/input/model/singleEntityControlContract";
import { describeDesktopMovementBindings } from "../model/desktopControlBindings";
import type { EmberwakeGameState } from "@game";

type ActiveRuntimeShellContentProps = {
  activeScene: AppSceneId;
  canInstall: boolean;
  cycleWorldSeed: () => void;
  desktopControlBindings: DesktopControlBindings;
  diagnosticsVisible: boolean;
  inspecteurVisible: boolean;
  isFullscreen: boolean;
  isFullscreenSupported: boolean;
  isMenuOpen: boolean;
  lastFullscreenError: string | null;
  metaOverlay: ReactNode;
  onEnterFullscreen: () => void;
  onInstall: () => void;
  onMenuOpenChange: (isOpen: boolean) => void;
  onRendererError: (message: string) => void;
  onRendererReady: () => void;
  onRetryRuntime: () => void;
  onResumeRuntime: () => void;
  onRuntimeOutcomeChange: (runtimeOutcome: RuntimeShellOutcome | null) => void;
  onRuntimeStateChange: (gameState: EmberwakeGameState) => void;
  onSetCameraMode: (cameraMode: CameraMode) => void;
  onSetCameraState: (cameraState: CameraState) => void;
  onSetDebugPanelVisible: (visible: boolean) => void;
  onSetInspectionPanelVisible: (visible: boolean) => void;
  onSetLastMetaScene: (scene: ShellPreferences["lastMetaScene"]) => void;
  onSetMovementOnboardingDismissed: (dismissed: boolean) => void;
  onShowMainMenuScene: () => void;
  onShowPauseScene: () => void;
  onShowSettingsScene: () => void;
  preferences: ShellPreferences;
  rendererState: RendererState;
  runtimeSession: RuntimeSessionState;
  sessionInitState?: EmberwakeGameState;
  shellRequestedScene: AppSceneId;
  viewport: ReturnTypeUseLogicalViewportModel;
};

export function ActiveRuntimeShellContent({
  activeScene,
  canInstall,
  cycleWorldSeed,
  desktopControlBindings,
  diagnosticsVisible,
  inspecteurVisible,
  isFullscreen,
  isFullscreenSupported,
  isMenuOpen,
  lastFullscreenError,
  metaOverlay,
  onEnterFullscreen,
  onInstall,
  onMenuOpenChange,
  onRendererError,
  onRendererReady,
  onRetryRuntime,
  onResumeRuntime,
  onRuntimeOutcomeChange,
  onRuntimeStateChange,
  onSetCameraMode,
  onSetCameraState,
  onSetDebugPanelVisible,
  onSetInspectionPanelVisible,
  onSetLastMetaScene,
  onSetMovementOnboardingDismissed,
  onShowMainMenuScene,
  onShowPauseScene,
  onShowSettingsScene,
  preferences,
  rendererState,
  runtimeSession,
  sessionInitState,
  shellRequestedScene,
  viewport
}: ActiveRuntimeShellContentProps) {
  const runtimeSurfaceRef = useRef<HTMLDivElement | null>(null);
  const [runtimeSurfaceElement, setRuntimeSurfaceElement] = useState<HTMLDivElement | null>(null);
  const handleRuntimeSurfaceElementChange = useCallback((element: HTMLDivElement | null) => {
    if (runtimeSurfaceRef.current === element) {
      return;
    }

    runtimeSurfaceRef.current = element;
    setRuntimeSurfaceElement(element);
  }, []);

  const mobileVirtualStick = useMobileVirtualStick({
    surfaceElement: runtimeSurfaceElement
  });
  useRuntimeInteractionGuards(runtimeSurfaceElement);
  const runtimeControlState = useSingleEntityControl({
    controlledEntityId: entityContract.primaryEntityId,
    keyboardBindings: desktopControlBindings,
    touchMovementIntent: mobileVirtualStick.movementIntent
  });
  const controlState = useMemo(
    () =>
      shellRequestedScene === "runtime"
        ? runtimeControlState
        : {
            ...runtimeControlState,
            debugCameraModifierActive: false,
            inputOwner: "none" as const,
            movementIntent: createIdleMovementIntent("none")
          },
    [runtimeControlState, shellRequestedScene]
  );
  const simulationState = useEntitySimulation({
    controlState,
    initialGameState: sessionInitState,
    sessionRevision: runtimeSession.sessionRevision
  });
  const runtimeOutcome = useMemo(() => {
    const rawRuntimeOutcome = simulationState.presentation.overlays?.runtimeOutcome;

    if (!rawRuntimeOutcome || rawRuntimeOutcome.kind === "none") {
      return null;
    }

    return rawRuntimeOutcome as RuntimeShellOutcome;
  }, [simulationState.presentation.overlays]);
  const followedWorldPosition =
    simulationState.presentation.cameraTarget?.worldPosition ?? simulationState.entity.worldPosition;
  const { cameraState, resetCamera } = useCameraController({
    cameraMode: runtimeSession.cameraMode,
    debugCameraEnabled: controlState.debugCameraModifierActive,
    followedWorldPosition,
    initialCameraState: runtimeSession.cameraState,
    onCameraStateChange: onSetCameraState,
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
  const showShellTools = activeScene !== "main-menu" && activeScene !== "new-game";
  const isMobileLayout = viewport.layoutMode === "mobile";

  const handleToggleDiagnostics = useCallback(() => {
    onSetDebugPanelVisible(!preferences.debugPanelVisible);
  }, [onSetDebugPanelVisible, preferences.debugPanelVisible]);
  const handleToggleInspecteur = useCallback(() => {
    onSetInspectionPanelVisible(!preferences.inspectionPanelVisible);
  }, [onSetInspectionPanelVisible, preferences.inspectionPanelVisible]);
  const handleCloseInspectionPanel = useCallback(() => {
    onSetInspectionPanelVisible(false);
  }, [onSetInspectionPanelVisible]);
  const handleCloseDiagnostics = useCallback(() => {
    onSetDebugPanelVisible(false);
  }, [onSetDebugPanelVisible]);

  const diagnosticsPanelProps = useMemo(
    () => ({
      camera: cameraState,
      control: runtimeControlState,
      entity: entityWorld.selectedEntity ?? simulationState.entity,
      fullscreen: {
        isFullscreen,
        isSupported: isFullscreenSupported,
        lastError: lastFullscreenError
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
      isFullscreenSupported,
      lastFullscreenError,
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

  useEffect(() => {
    onRuntimeOutcomeChange(runtimeOutcome);
  }, [onRuntimeOutcomeChange, runtimeOutcome]);

  useEffect(() => {
    onRuntimeStateChange(simulationState.gameState);
  }, [onRuntimeStateChange, simulationState.gameState]);

  useRuntimeTelemetryBridge({
    activeScene,
    diagnosticsVisible,
    publication: runtimePublicationContract.hotPathSurfaceModes,
    rendererState,
    runtime: simulationState.runtime
  });

  useDebugPanelHotkey({
    enabled: appConfig.diagnosticsEnabled && showShellTools,
    onToggle: handleToggleDiagnostics
  });

  useEffect(() => {
    if (!preferences.movementOnboardingDismissed && controlState.movementIntent.isActive) {
      onSetMovementOnboardingDismissed(true);
    }
  }, [
    controlState.movementIntent.isActive,
    onSetMovementOnboardingDismissed,
    preferences.movementOnboardingDismissed
  ]);

  useEffect(() => {
    if (activeScene === "pause" || activeScene === "settings") {
      simulationState.controls.pause();
      onSetLastMetaScene(activeScene);
      return;
    }

    if (activeScene === "runtime") {
      simulationState.controls.resume();
      onSetLastMetaScene("none");
      return;
    }

    simulationState.controls.pause();
    onSetLastMetaScene("none");
  }, [activeScene, onSetLastMetaScene, simulationState.controls]);

  const selectedEntityChunk = worldPointToChunkCoordinate(entityWorld.selectedEntity.worldPosition);
  const movementSummary = useMemo(
    () => describeDesktopMovementBindings(desktopControlBindings),
    [desktopControlBindings]
  );
  const playerHudVisible =
    activeScene === "runtime" && !diagnosticsVisible && !inspecteurVisible;

  return (
    <>
      <section className="app-shell__runtime" aria-label="Interactive runtime shell">
        <RuntimeSceneBoundary
          camera={cameraState}
          onOpenSettings={onShowSettingsScene}
          onRendererError={onRendererError}
          onRendererReady={onRendererReady}
          onRetryRuntime={onRetryRuntime}
          onSurfaceElementChange={handleRuntimeSurfaceElementChange}
          onVisualFrame={simulationState.controls.advanceVisualFrame}
          renderSurfaceMode={diagnosticsVisible ? "diagnostics" : "player"}
          rendererMessage={rendererState.message}
          scene={activeScene}
          visibleEntities={entityWorld.visibleEntities}
          visibleChunks={chunkVisibility.visibleChunks}
          viewport={viewport}
          worldSeed={runtimeSession.worldSeed}
        />
      </section>

      <section className="app-shell__overlay" aria-label="Shell status overlay">
        {showShellTools ? (
          <ShellMenu
            activeScene={activeScene}
            cameraMode={runtimeSession.cameraMode}
            canInstall={canInstall}
            diagnosticsEnabled={appConfig.diagnosticsEnabled}
            diagnosticsVisible={diagnosticsVisible}
            inspecteurVisible={inspecteurVisible}
            isOpen={isMenuOpen}
            isFullscreen={isFullscreen}
            isFullscreenSupported={isFullscreenSupported}
            layoutMode={viewport.layoutMode}
            onEnterFullscreen={onEnterFullscreen}
            onInstall={onInstall}
            onOpenChange={onMenuOpenChange}
            onResetCamera={resetCamera}
            onRetryRuntime={onRetryRuntime}
            onResumeRuntime={onResumeRuntime}
            onSetCameraMode={onSetCameraMode}
            onShowMainMenuScene={onShowMainMenuScene}
            onShowPauseScene={onShowPauseScene}
            onShowSettingsScene={onShowSettingsScene}
            onToggleDiagnostics={handleToggleDiagnostics}
            onToggleInspecteur={handleToggleInspecteur}
          />
        ) : null}

        {showShellTools && inspecteurVisible ? (
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

        {playerHudVisible ? (
          <PlayerHudCard
            isMobile={isMobileLayout}
            movementHintVisible={!preferences.movementOnboardingDismissed}
            movementSummary={movementSummary}
            playerName={runtimeSession.playerName || "Wanderer"}
          />
        ) : null}

        {metaOverlay}

        {showShellTools && diagnosticsVisible ? (
          <ShellDiagnosticsPanel
            {...diagnosticsPanelProps}
            visible={diagnosticsVisible}
          />
        ) : null}
      </section>

      <MobileVirtualStickOverlay stickState={mobileVirtualStick} />
    </>
  );
}
