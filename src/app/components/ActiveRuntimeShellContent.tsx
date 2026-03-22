import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import "./ActiveRuntimeShellContent.css";
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
import { useRuntimeAutomation } from "../hooks/useRuntimeAutomation";
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
import { createInitialEmberwakeGameState } from "@game";
import type { EmberwakeGameState } from "@game";
import type { RuntimeProfilingConfig } from "@game";

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
  onSetRuntimeFeedbackVisible: (visible: boolean) => void;
  onShowMainMenuScene: () => void;
  onShowPauseScene: () => void;
  onShowSettingsScene: () => void;
  preferences: ShellPreferences;
  profilingConfig: RuntimeProfilingConfig;
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
  onSetRuntimeFeedbackVisible,
  onShowMainMenuScene,
  onShowPauseScene,
  onShowSettingsScene,
  preferences,
  profilingConfig,
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
    viewRotationRadians: runtimeSession.cameraState.rotation,
    touchMovementIntent: mobileVirtualStick.movementIntent
  });
  const runtimeAutomation = useRuntimeAutomation();
  const effectiveRuntimeControlState = useMemo(
    () =>
      runtimeAutomation.movementIntent.isActive
        ? {
            ...runtimeControlState,
            inputOwner: "player-entity" as const,
            movementIntent: runtimeAutomation.movementIntent
          }
        : runtimeControlState,
    [runtimeAutomation.movementIntent, runtimeControlState]
  );
  const controlState = useMemo(
    () =>
      shellRequestedScene === "runtime"
        ? effectiveRuntimeControlState
        : {
            ...effectiveRuntimeControlState,
            debugCameraModifierActive: false,
            inputOwner: "none" as const,
            movementIntent: createIdleMovementIntent("none")
          },
    [effectiveRuntimeControlState, shellRequestedScene]
  );
  const effectiveSessionInitState = useMemo(
    () =>
      sessionInitState ??
      createInitialEmberwakeGameState(runtimeSession.worldSeed, profilingConfig),
    [profilingConfig, runtimeSession.worldSeed, sessionInitState]
  );
  const simulationState = useEntitySimulation({
    controlState,
    initialGameState: effectiveSessionInitState,
    profilingConfig,
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
    desktopControlBindings,
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
    includeSupportEntities: diagnosticsVisible,
    primaryEntityId: simulationState.entity.id,
    selectedWorldPoint: worldDiagnostics.selectedWorldPoint,
    simulatedEntities: simulationState.entities,
    visibleChunks: chunkVisibility.visibleChunks
  });
  const showShellTools =
    activeScene !== "main-menu" && activeScene !== "new-game" && activeScene !== "changelogs";
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
    onRuntimeStateChange(simulationState.gameState);
  }, [onRuntimeStateChange, simulationState.gameState]);

  useEffect(() => {
    onRuntimeOutcomeChange(runtimeOutcome);
  }, [onRuntimeOutcomeChange, runtimeOutcome]);

  useRuntimeTelemetryBridge({
    activeScene,
    diagnosticsVisible,
    publication: runtimePublicationContract.hotPathSurfaceModes,
    rendererState,
    runtime: simulationState.runtime,
    runtimeState: {
      entityCount: simulationState.entities.length,
      floatingDamageNumberCount: simulationState.floatingDamageNumbers.length,
      hostileCount: simulationState.entities.filter((entity) => entity.role === "hostile").length,
      pickupCount: simulationState.entities.filter((entity) => entity.role === "pickup").length,
      playerHealth: simulationState.entity.combat.currentHealth,
      tick: simulationState.tick
    }
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

    if (activeScene === "runtime" && !isMenuOpen) {
      simulationState.controls.resume();
      onSetLastMetaScene("none");
      return;
    }

    simulationState.controls.pause();
    onSetLastMetaScene("none");
  }, [activeScene, isMenuOpen, onSetLastMetaScene, simulationState.controls]);

  const selectedEntityChunk = worldPointToChunkCoordinate(entityWorld.selectedEntity.worldPosition);
  const playerHudVisible =
    activeScene === "runtime" &&
    preferences.runtimeFeedbackVisible &&
    !diagnosticsVisible &&
    !inspecteurVisible;

  return (
    <>
      <section className="app-shell__runtime" aria-label="Interactive runtime shell">
        <RuntimeSceneBoundary
          camera={cameraState}
          currentTick={simulationState.tick}
          floatingDamageNumbers={simulationState.floatingDamageNumbers}
          onOpenSettings={onShowSettingsScene}
          onRendererError={onRendererError}
          onRendererReady={onRendererReady}
          onRetryRuntime={onRetryRuntime}
          onSurfaceElementChange={handleRuntimeSurfaceElementChange}
          onVisualFrame={simulationState.controls.advanceVisualFrame}
          playerLevel={simulationState.gameState.systems.progression.currentLevel}
          playerName={runtimeSession.playerName || "Wanderer"}
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
            onToggleRuntimeFeedback={() => {
              onSetRuntimeFeedbackVisible(!preferences.runtimeFeedbackVisible);
            }}
            onToggleDiagnostics={handleToggleDiagnostics}
            onToggleInspecteur={handleToggleInspecteur}
            runtimeFeedbackVisible={preferences.runtimeFeedbackVisible}
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
            currentLevel={simulationState.gameState.systems.progression.currentLevel}
            currentXp={simulationState.gameState.systems.progression.currentXp}
            fps={simulationState.runtime.fps}
            goldCollected={simulationState.gameState.systems.progression.goldCollected}
            isMobile={isMobileLayout}
            nextLevelXpRequired={simulationState.gameState.systems.progression.nextLevelXpRequired}
            playerHealth={simulationState.entity.combat.currentHealth}
            playerName={runtimeSession.playerName || "Wanderer"}
            zoomMultiplier={cameraState.zoom}
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
