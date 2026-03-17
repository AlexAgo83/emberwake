import { useRef } from "react";

import { FullscreenToggleButton } from "./components/FullscreenToggleButton";
import { useDocumentViewportLock } from "./hooks/useDocumentViewportLock";
import { useFullscreenController } from "./hooks/useFullscreenController";
import { useLogicalViewportModel } from "./hooks/useLogicalViewportModel";
import { useRendererHealth } from "./hooks/useRendererHealth";
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
import { singleEntityControlContract } from "../game/input/model/singleEntityControlContract";
import { RuntimeSurface } from "../game/render/RuntimeSurface";
import {
  chunkWorldSize,
  sampleChunkDebugSignature,
  worldContract
} from "../game/world/model/worldContract";
import { useWorldInteractionDiagnostics } from "../game/world/hooks/useWorldInteractionDiagnostics";
import { useVisibleChunkSet } from "../game/world/hooks/useVisibleChunkSet";
import { appConfig } from "../shared/config/appConfig";
import { runtimeContract } from "../shared/constants/runtimeContract";

export function AppShell() {
  const shellRef = useRef<HTMLElement>(null);
  const runtimeSurfaceRef = useRef<HTMLDivElement>(null);
  useDocumentViewportLock();
  useRuntimeInteractionGuards(runtimeSurfaceRef);
  const mobileVirtualStick = useMobileVirtualStick({
    surfaceRef: runtimeSurfaceRef
  });
  const controlState = useSingleEntityControl({
    controlledEntityId: entityContract.primaryEntityId,
    touchMovementIntent: mobileVirtualStick.movementIntent
  });
  const { enterFullscreen, isFullscreen, isSupported, lastError } =
    useFullscreenController(shellRef);
  const viewport = useLogicalViewportModel(shellRef);
  const { cameraState, resetCamera } = useCameraController({
    debugCameraEnabled: controlState.debugCameraModifierActive,
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
  const { preferences, setDebugPanelVisible, setPrefersFullscreen } = useShellPreferences({
    defaultDebugPanelVisible: appConfig.debugOverlayEnabled && appConfig.diagnosticsEnabled
  });
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
        />
      </section>

      <section className="app-shell__overlay" aria-label="Shell status overlay">
        <header className="shell-topbar">
          <span className="shell-topbar__mode">Fullscreen-first shell</span>
          {appConfig.diagnosticsEnabled ? (
            <div className="shell-topbar__controls">
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
            </div>
          ) : null}
          <FullscreenToggleButton
            isFullscreen={isFullscreen}
            isSupported={isSupported}
            onEnterFullscreen={handleEnterFullscreen}
          />
        </header>

        <div className="shell-identity">
          <p className="shell-identity__eyebrow">Static runtime foundation</p>
          <h1>{appConfig.name}</h1>
          <p className="shell-identity__body">
            React owns the shell, Pixi owns the world surface, and the first playable loop
            will land on top of this fullscreen-ready scaffold.
          </p>
        </div>

        <dl className="shell-status">
          <div>
            <dt>Renderer</dt>
            <dd>PixiJS via @pixi/react</dd>
          </div>
          <div>
            <dt>Runtime</dt>
            <dd>Static PWA shell</dd>
          </div>
          <div>
            <dt>Target</dt>
            <dd>{appConfig.logicalWidth}px logical width baseline</dd>
          </div>
          <div>
            <dt>Layout mode</dt>
            <dd>{viewport.layoutMode}</dd>
          </div>
          <div>
            <dt>Fit scale</dt>
            <dd>{viewport.fitScale.toFixed(3)}x</dd>
          </div>
          <div>
            <dt>Visible world</dt>
            <dd>
              {Math.round(viewport.visibleWorldSize.width)} ×{" "}
              {Math.round(viewport.visibleWorldSize.height)}
            </dd>
          </div>
          <div>
            <dt>Spaces</dt>
            <dd>{viewport.spaces.join(" / ")}</dd>
          </div>
          <div>
            <dt>World posture</dt>
            <dd>{runtimeContract.worldAssumption}</dd>
          </div>
          <div>
            <dt>World seed</dt>
            <dd>{worldContract.defaultSeed}</dd>
          </div>
          <div>
            <dt>Camera</dt>
            <dd>
              {Math.round(cameraState.worldPosition.x)}, {Math.round(cameraState.worldPosition.y)} /{" "}
              {cameraState.zoom.toFixed(2)}x / {cameraState.rotation.toFixed(2)}rad
            </dd>
          </div>
          <div>
            <dt>Control owner</dt>
            <dd>{controlState.inputOwner}</dd>
          </div>
          <div>
            <dt>Desktop fallback</dt>
            <dd>WASD / arrows steer the entity</dd>
          </div>
          <div>
            <dt>Debug camera</dt>
            <dd>
              Hold {singleEntityControlContract.debugCameraModifierKey} + drag / wheel / Q E R
            </dd>
          </div>
          <div>
            <dt>Entity</dt>
            <dd>
              {Math.round(simulationState.entity.worldPosition.x)},{" "}
              {Math.round(simulationState.entity.worldPosition.y)} /{" "}
              {simulationState.entity.state}
            </dd>
          </div>
          <div>
            <dt>Tracked entities</dt>
            <dd>{entityWorld.trackedEntities.length}</dd>
          </div>
          <div>
            <dt>Visible entities</dt>
            <dd>{entityWorld.visibleEntities.length}</dd>
          </div>
          <div>
            <dt>Selected entity</dt>
            <dd>{entityWorld.selectedEntity?.id ?? "none"}</dd>
          </div>
          <div>
            <dt>Chunk baseline</dt>
            <dd>
              {worldContract.chunkSizeInTiles}x{worldContract.chunkSizeInTiles} / {chunkWorldSize}wu
            </dd>
          </div>
          <div>
            <dt>Visible chunks</dt>
            <dd>{chunkVisibility.visibleChunks.length}</dd>
          </div>
          <div>
            <dt>Chunk cache</dt>
            <dd>
              {chunkVisibility.cachedChunkIds.length} / preload {chunkVisibility.preloadMargin}
            </dd>
          </div>
          <div>
            <dt>Chunk signature</dt>
            <dd>{sampleChunkDebugSignature({ x: 0, y: 0 })}</dd>
          </div>
          <div>
            <dt>Hover chunk</dt>
            <dd>
              {worldDiagnostics.hoveredChunkCoordinate
                ? `${worldDiagnostics.hoveredChunkCoordinate.x}, ${worldDiagnostics.hoveredChunkCoordinate.y}`
                : "none"}
            </dd>
          </div>
          <div>
            <dt>Picked chunk</dt>
            <dd>
              {worldDiagnostics.selectedChunkCoordinate
                ? `${worldDiagnostics.selectedChunkCoordinate.x}, ${worldDiagnostics.selectedChunkCoordinate.y}`
                : "none"}
            </dd>
          </div>
          <div>
            <dt>Shell perf floor</dt>
            <dd>{viewport.performanceBudget.frameRateFloor}+ FPS target</dd>
          </div>
          <div>
            <dt>Input ownership</dt>
            <dd>Scroll, selection, and drag guarded by shell</dd>
          </div>
          <div>
            <dt>Renderer health</dt>
            <dd>{rendererState.status}</dd>
          </div>
        </dl>

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
            trackedEntities: entityWorld.trackedEntities.length,
            visibleEntities: entityWorld.visibleEntities.length,
            preloadMargin: chunkVisibility.preloadMargin,
            visibleChunks: chunkVisibility.visibleChunks
          }}
          preferences={preferences}
          renderer={rendererState}
          viewport={viewport}
          visible={diagnosticsVisible}
        />
      </section>

      <MobileVirtualStickOverlay stickState={mobileVirtualStick} />
    </main>
  );
}
