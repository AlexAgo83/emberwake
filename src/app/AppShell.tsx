import { useRef } from "react";

import { EntityInspectionPanel } from "./components/EntityInspectionPanel";
import { ShellMenu } from "./components/ShellMenu";
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
import { RuntimeSurface } from "../game/render/RuntimeSurface";
import { useWorldInteractionDiagnostics } from "../game/world/hooks/useWorldInteractionDiagnostics";
import { useVisibleChunkSet } from "../game/world/hooks/useVisibleChunkSet";
import { appConfig } from "../shared/config/appConfig";

export function AppShell() {
  const shellRef = useRef<HTMLElement>(null);
  const runtimeSurfaceRef = useRef<HTMLDivElement>(null);
  useDocumentViewportLock();
  useRuntimeInteractionGuards(runtimeSurfaceRef);
  const mobileVirtualStick = useMobileVirtualStick({
    surfaceRef: runtimeSurfaceRef
  });
  const { canInstall, promptInstall } = useInstallPrompt();
  const controlState = useSingleEntityControl({
    controlledEntityId: entityContract.primaryEntityId,
    touchMovementIntent: mobileVirtualStick.movementIntent
  });
  const { enterFullscreen, isFullscreen, isSupported, lastError } =
    useFullscreenController(shellRef);
  const viewport = useLogicalViewportModel(shellRef);
  const { cycleWorldSeed, runtimeSession, setCameraMode, setCameraState } = useRuntimeSession();
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
  const { markFailed, markReady, rendererState } = useRendererHealth();
  const {
    preferences,
    setDebugPanelVisible,
    setInspectionPanelVisible,
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

  return (
    <main
      className="app-shell"
      data-app-ready="true"
      data-layout-mode={viewport.layoutMode}
      ref={shellRef}
    >
      <section className="app-shell__runtime" aria-label="Interactive runtime shell">
        <RuntimeSurface
          camera={cameraState}
          onRendererError={markFailed}
          onRendererReady={markReady}
          surfaceRef={runtimeSurfaceRef}
          visibleEntities={entityWorld.visibleEntities}
          visibleChunks={chunkVisibility.visibleChunks}
          viewport={viewport}
          worldSeed={runtimeSession.worldSeed}
        />
      </section>

      <section className="app-shell__overlay" aria-label="Shell status overlay">
        <ShellMenu
          cameraMode={runtimeSession.cameraMode}
          canInstall={canInstall}
          diagnosticsEnabled={appConfig.diagnosticsEnabled}
          diagnosticsVisible={diagnosticsVisible}
          inspecteurVisible={inspecteurVisible}
          isFullscreen={isFullscreen}
          isFullscreenSupported={isSupported}
          onEnterFullscreen={() => {
            void handleEnterFullscreen();
          }}
          onInstall={() => {
            void promptInstall();
          }}
          onResetCamera={resetCamera}
          onSetCameraMode={setCameraMode}
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

        <ShellDiagnosticsPanel
          camera={cameraState}
          control={controlState}
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
