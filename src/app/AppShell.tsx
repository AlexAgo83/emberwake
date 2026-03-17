import { useEffect, useRef } from "react";

import { EntityInspectionPanel } from "./components/EntityInspectionPanel";
import { FullscreenToggleButton } from "./components/FullscreenToggleButton";
import { PlayerHudCard } from "./components/PlayerHudCard";
import { useDocumentViewportLock } from "./hooks/useDocumentViewportLock";
import { useFullscreenController } from "./hooks/useFullscreenController";
import { useInstallPrompt } from "./hooks/useInstallPrompt";
import { useLogicalViewportModel } from "./hooks/useLogicalViewportModel";
import { useRendererHealth } from "./hooks/useRendererHealth";
import { useRuntimeSession } from "./hooks/useRuntimeSession";
import { useShellPreferences } from "./hooks/useShellPreferences";
import { useRuntimeInteractionGuards } from "./hooks/useRuntimeInteractionGuards";
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
import { worldPointToChunkCoordinate } from "../game/world/model/worldContract";
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
  const { cycleWorldSeed, runtimeSession, setCameraState } = useRuntimeSession();
  const { cameraState, resetCamera } = useCameraController({
    debugCameraEnabled: controlState.debugCameraModifierActive,
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
  const simulationState = useEntitySimulation({ controlState });
  const entityWorld = useEntityWorld({
    primaryEntity: simulationState.entity,
    selectedWorldPoint: worldDiagnostics.selectedWorldPoint,
    visibleChunks: chunkVisibility.visibleChunks
  });
  const { markFailed, markReady, rendererState } = useRendererHealth();
  const {
    preferences,
    setDebugPanelVisible,
    setMovementOnboardingDismissed,
    setPrefersFullscreen
  } = useShellPreferences({
    defaultDebugPanelVisible: appConfig.debugOverlayEnabled && appConfig.diagnosticsEnabled
  });
  const isMobileLayout = viewport.layoutMode === "mobile";

  useEffect(() => {
    if (
      preferences.movementOnboardingDismissed ||
      !controlState.movementIntent.isActive ||
      simulationState.entity.state !== "moving"
    ) {
      return;
    }

    setMovementOnboardingDismissed(true);
  }, [
    controlState.movementIntent.isActive,
    preferences.movementOnboardingDismissed,
    setMovementOnboardingDismissed,
    simulationState.entity.state
  ]);
  useDebugPanelHotkey({
    enabled: appConfig.diagnosticsEnabled,
    onToggle: () => {
      setDebugPanelVisible(!preferences.debugPanelVisible);
    }
  });
  const diagnosticsVisible = appConfig.diagnosticsEnabled && preferences.debugPanelVisible;
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
        <header className="shell-topbar">
          <span className="shell-topbar__mode">Emberwake runtime</span>
          <div className="shell-topbar__controls">
            {canInstall ? (
              <button
                className="shell-control shell-control--button"
                onClick={() => {
                  void promptInstall();
                }}
                type="button"
              >
                Install app
              </button>
            ) : null}
            {appConfig.diagnosticsEnabled ? (
              <>
                <button
                  className="shell-control shell-control--button"
                  onClick={() => {
                    setDebugPanelVisible(!preferences.debugPanelVisible);
                  }}
                  type="button"
                >
                  {preferences.debugPanelVisible ? "Hide diagnostics" : "Show diagnostics"}
                </button>
                <button
                  className="shell-control shell-control--button"
                  onClick={resetCamera}
                  type="button"
                >
                  Reset camera
                </button>
              </>
            ) : null}
            <FullscreenToggleButton
              isFullscreen={isFullscreen}
              isSupported={isSupported}
              onEnterFullscreen={handleEnterFullscreen}
            />
          </div>
        </header>

        <div className="shell-player-surfaces">
          <PlayerHudCard
            isMobile={isMobileLayout}
            movementHintVisible={!preferences.movementOnboardingDismissed}
            selectedEntityLabel={
              entityWorld.selectedEntity.id === entityContract.primaryEntityId
                ? "Primary entity"
                : entityWorld.selectedEntity.id.split(":").at(-1) ?? entityWorld.selectedEntity.id
            }
          />
          <EntityInspectionPanel
            entityChunk={`${selectedEntityChunk.x}, ${selectedEntityChunk.y}`}
            entityId={entityWorld.selectedEntity.id}
            entityLabel={entityWorld.selectedEntity.id.split(":").at(-1) ?? entityWorld.selectedEntity.id}
            entityPosition={`${Math.round(entityWorld.selectedEntity.worldPosition.x)}, ${Math.round(entityWorld.selectedEntity.worldPosition.y)}`}
            entitySelectionState={entityWorld.selectedEntity.isSelected ? "selected" : "not selected"}
            entityState={entityWorld.selectedEntity.state}
            isMobile={isMobileLayout}
          />
        </div>

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
          viewport={viewport}
          visible={diagnosticsVisible}
        />
      </section>

      <MobileVirtualStickOverlay stickState={mobileVirtualStick} />
    </main>
  );
}
