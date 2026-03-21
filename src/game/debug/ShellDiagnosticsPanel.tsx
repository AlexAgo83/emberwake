import { memo } from "react";

import {
  chunkCoordinateToId,
  chunkWorldSize,
  sampleChunkDebugSignature,
  worldPointToChunkCoordinate,
  worldContract
} from "../world/model/worldContract";
import type { ShellPreferences } from "../../shared/lib/shellPreferencesStorage";
import type { ReturnTypeUseLogicalViewportModel } from "./types";
import type { CameraState } from "../camera/model/cameraMath";
import type { PresentedEntity } from "../entities/model/entityContract";
import type { SimulatedEntity } from "../entities/model/entitySimulation";
import type { SimulationSpeedOption } from "../entities/model/entitySimulation";
import type { SingleEntityControlState } from "../input/model/singleEntityControlContract";
import type { ChunkCoordinate, WorldPoint } from "../world/types";

type ShellDiagnosticsPanelProps = {
  camera: CameraState;
  control: SingleEntityControlState;
  entity: PresentedEntity<SimulatedEntity>;
  fullscreen: {
    isFullscreen: boolean;
    isSupported: boolean;
    lastError: string | null;
  };
  preferences: ShellPreferences;
  publication: {
    diagnostics: string;
    runtimeScene: string;
    shellChrome: string;
  };
  renderer: {
    metrics: {
      attempt: number;
      bootStartedAtMs: number;
      rendererReadyMs: number | null;
    };
    message: string;
    status: "degraded" | "failed" | "initializing" | "ready";
  };
  simulation: {
    accumulatorMs: number;
    fixedStepMs: number;
    framesWithCatchUp: number;
    fps: number;
    frameTimeMs: number;
    isPaused: boolean;
    maxFrameTimeMs: number;
    schedulerMode: "internal-raf" | "pixi-ticker-master";
    simulationStepsLastFrame: number;
    simulationStepsTotal: number;
    speedMultiplier: SimulationSpeedOption;
    tick: number;
    visualFrameCount: number;
  };
  simulationControls: {
    cycleWorldSeed: () => void;
    resume: () => void;
    setSpeedMultiplier: (speedMultiplier: SimulationSpeedOption) => void;
    stepOnce: () => void;
    togglePaused: () => void;
  };
  onClose: () => void;
  worldDiagnostics: {
    hoveredChunkCoordinate: ChunkCoordinate | null;
    hoveredWorldPoint: WorldPoint | null;
    selectedChunkCoordinate: ChunkCoordinate | null;
    selectedWorldPoint: WorldPoint | null;
  };
  worldRender: {
    cachedChunkIds: string[];
    overlappingPairs: number;
    preloadMargin: number;
    trackedEntities: number;
    visibleEntities: number;
    visibleChunks: ChunkCoordinate[];
    worldSeed: string;
  };
  visible: boolean;
  viewport: ReturnTypeUseLogicalViewportModel;
};

function ShellDiagnosticsPanelComponent({
  camera,
  control,
  entity,
  fullscreen,
  preferences,
  publication,
  renderer,
  simulation,
  simulationControls,
  onClose,
  worldDiagnostics,
  worldRender,
  visible,
  viewport
}: ShellDiagnosticsPanelProps) {
  if (!visible) {
    return null;
  }

  return (
    <aside className="shell-diagnostics" aria-label="Shell diagnostics">
      <header className="shell-diagnostics__header">
        <div className="shell-diagnostics__title">
          <p>Shell diagnostics</p>
          <span>{renderer.status}</span>
        </div>
        <button
          aria-label="Close diagnostics"
          className="panel-dismiss"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </header>

      <div className="shell-diagnostics__controls" role="group" aria-label="Simulation controls">
        <button
          className="shell-control shell-control--button"
          onClick={simulationControls.togglePaused}
          type="button"
        >
          {simulation.isPaused ? "Resume sim" : "Pause sim"}
        </button>
        <button
          className="shell-control shell-control--button"
          disabled={!simulation.isPaused}
          onClick={simulationControls.stepOnce}
          type="button"
        >
          Step sim
        </button>
        {([0.5, 1, 2] as const).map((speedMultiplier) => (
          <button
            className="shell-control shell-control--button"
            data-active={simulation.speedMultiplier === speedMultiplier}
            key={speedMultiplier}
            onClick={() => {
              simulationControls.setSpeedMultiplier(speedMultiplier);
              simulationControls.resume();
            }}
            type="button"
          >
            {speedMultiplier}x
          </button>
        ))}
        <button
          className="shell-control shell-control--button"
          onClick={simulationControls.cycleWorldSeed}
          type="button"
        >
          Cycle seed
        </button>
      </div>

      <dl className="shell-diagnostics__grid">
        <div>
          <dt>Layout</dt>
          <dd>{viewport.layoutMode}</dd>
        </div>
        <div>
          <dt>Screen</dt>
          <dd>
            {Math.round(viewport.screenSize.width)} x {Math.round(viewport.screenSize.height)}
          </dd>
        </div>
        <div>
          <dt>Logical</dt>
          <dd>
            {viewport.logicalSize.width} x {viewport.logicalSize.height}
          </dd>
        </div>
        <div>
          <dt>Visible world</dt>
          <dd>
            {Math.round(viewport.visibleWorldSize.width)} x{" "}
            {Math.round(viewport.visibleWorldSize.height)}
          </dd>
        </div>
        <div>
          <dt>World origin</dt>
          <dd>
            {viewport.worldOrigin.x}, {viewport.worldOrigin.y}
          </dd>
        </div>
        <div>
          <dt>Camera world</dt>
          <dd>
            {Math.round(camera.worldPosition.x)}, {Math.round(camera.worldPosition.y)}
          </dd>
        </div>
        <div>
          <dt>Camera chunk</dt>
          <dd>
            {worldPointToChunkCoordinate(camera.worldPosition).x},{" "}
            {worldPointToChunkCoordinate(camera.worldPosition).y}
          </dd>
        </div>
        <div>
          <dt>Camera zoom</dt>
          <dd>{camera.zoom.toFixed(3)}x</dd>
        </div>
        <div>
          <dt>Camera rotation</dt>
          <dd>{camera.rotation.toFixed(3)}rad</dd>
        </div>
        <div>
          <dt>Frame time</dt>
          <dd>{simulation.frameTimeMs.toFixed(2)}ms</dd>
        </div>
        <div>
          <dt>FPS</dt>
          <dd>{simulation.fps.toFixed(1)}</dd>
        </div>
        <div>
          <dt>Sim tick</dt>
          <dd>{simulation.tick}</dd>
        </div>
        <div>
          <dt>Sim cadence</dt>
          <dd>{(1000 / simulation.fixedStepMs).toFixed(0)}hz / {simulation.fixedStepMs.toFixed(2)}ms</dd>
        </div>
        <div>
          <dt>Sim paused</dt>
          <dd>{simulation.isPaused ? "yes" : "no"}</dd>
        </div>
        <div>
          <dt>Sim speed</dt>
          <dd>{simulation.speedMultiplier.toFixed(1)}x</dd>
        </div>
        <div>
          <dt>Steps / frame</dt>
          <dd>{simulation.simulationStepsLastFrame}</dd>
        </div>
        <div>
          <dt>Accumulator</dt>
          <dd>{simulation.accumulatorMs.toFixed(2)}ms</dd>
        </div>
        <div>
          <dt>Frame loop</dt>
          <dd>{simulation.schedulerMode}</dd>
        </div>
        <div>
          <dt>Visual frames</dt>
          <dd>{simulation.visualFrameCount}</dd>
        </div>
        <div>
          <dt>Sim steps total</dt>
          <dd>{simulation.simulationStepsTotal}</dd>
        </div>
        <div>
          <dt>Catch-up frames</dt>
          <dd>{simulation.framesWithCatchUp}</dd>
        </div>
        <div>
          <dt>Max frame time</dt>
          <dd>{simulation.maxFrameTimeMs.toFixed(2)}ms</dd>
        </div>
        <div>
          <dt>Control owner</dt>
          <dd>{control.inputOwner}</dd>
        </div>
        <div>
          <dt>Control entity</dt>
          <dd>{control.controlledEntityId}</dd>
        </div>
        <div>
          <dt>Intent source</dt>
          <dd>{control.movementIntent.source}</dd>
        </div>
        <div>
          <dt>Intent magnitude</dt>
          <dd>{control.movementIntent.magnitude.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Entity archetype</dt>
          <dd>{entity.archetype}</dd>
        </div>
        <div>
          <dt>Entity state</dt>
          <dd>{entity.state}</dd>
        </div>
        <div>
          <dt>Entity selected</dt>
          <dd>{entity.isSelected ? "yes" : "no"}</dd>
        </div>
        <div>
          <dt>Entity radius</dt>
          <dd>{entity.footprint.radius}</dd>
        </div>
        <div>
          <dt>Entity layer</dt>
          <dd>{entity.renderLayer}</dd>
        </div>
        <div>
          <dt>Entity world</dt>
          <dd>
            {Math.round(entity.worldPosition.x)}, {Math.round(entity.worldPosition.y)}
          </dd>
        </div>
        <div>
          <dt>Entity chunk</dt>
          <dd>
            {worldPointToChunkCoordinate(entity.worldPosition).x},{" "}
            {worldPointToChunkCoordinate(entity.worldPosition).y}
          </dd>
        </div>
        <div>
          <dt>Entity velocity</dt>
          <dd>
            {Math.round(entity.velocity.x)}, {Math.round(entity.velocity.y)}
          </dd>
        </div>
        <div>
          <dt>Entity speed</dt>
          <dd>{Math.hypot(entity.velocity.x, entity.velocity.y).toFixed(1)}wu/s</dd>
        </div>
        <div>
          <dt>Entity facing</dt>
          <dd>{entity.orientation.toFixed(3)}rad</dd>
        </div>
        <div>
          <dt>Chunk baseline</dt>
          <dd>
            {worldContract.chunkSizeInTiles}x{worldContract.chunkSizeInTiles} / {chunkWorldSize}wu
          </dd>
        </div>
        <div>
          <dt>World seed</dt>
          <dd>{worldRender.worldSeed}</dd>
        </div>
        <div>
          <dt>Chunk id</dt>
          <dd>{chunkCoordinateToId({ x: 0, y: 0 }, worldRender.worldSeed)}</dd>
        </div>
        <div>
          <dt>Chunk signature</dt>
          <dd>{sampleChunkDebugSignature({ x: 0, y: 0 }, worldRender.worldSeed)}</dd>
        </div>
        <div>
          <dt>Visible chunks</dt>
          <dd>{worldRender.visibleChunks.length}</dd>
        </div>
        <div>
          <dt>Tracked entities</dt>
          <dd>{worldRender.trackedEntities}</dd>
        </div>
        <div>
          <dt>Entity overlaps</dt>
          <dd>{worldRender.overlappingPairs}</dd>
        </div>
        <div>
          <dt>Visible entities</dt>
          <dd>{worldRender.visibleEntities}</dd>
        </div>
        <div>
          <dt>Chunk cache</dt>
          <dd>
            {worldRender.cachedChunkIds.length} / preload {worldRender.preloadMargin}
          </dd>
        </div>
        <div>
          <dt>Hover world</dt>
          <dd>
            {worldDiagnostics.hoveredWorldPoint
              ? `${Math.round(worldDiagnostics.hoveredWorldPoint.x)}, ${Math.round(worldDiagnostics.hoveredWorldPoint.y)}`
              : "none"}
          </dd>
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
          <dt>Picked world</dt>
          <dd>
            {worldDiagnostics.selectedWorldPoint
              ? `${Math.round(worldDiagnostics.selectedWorldPoint.x)}, ${Math.round(worldDiagnostics.selectedWorldPoint.y)}`
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
          <dt>Fit scale</dt>
          <dd>{viewport.fitScale.toFixed(3)}x</dd>
        </div>
        <div>
          <dt>Renderer</dt>
          <dd>{renderer.message}</dd>
        </div>
        <div>
          <dt>Renderer ready</dt>
          <dd>
            {renderer.metrics.rendererReadyMs === null
              ? "pending"
              : `${renderer.metrics.rendererReadyMs.toFixed(0)}ms`}
          </dd>
        </div>
        <div>
          <dt>Renderer attempts</dt>
          <dd>{renderer.metrics.attempt + 1}</dd>
        </div>
        <div>
          <dt>Fullscreen</dt>
          <dd>
            {fullscreen.isSupported ? "supported" : "unsupported"} /{" "}
            {fullscreen.isFullscreen ? "active" : "inactive"}
          </dd>
        </div>
        <div>
          <dt>Fullscreen pref</dt>
          <dd>{preferences.prefersFullscreen ? "on" : "off"}</dd>
        </div>
        <div>
          <dt>Debug pref</dt>
          <dd>{preferences.debugPanelVisible ? "visible" : "hidden"}</dd>
        </div>
        <div>
          <dt>Spaces</dt>
          <dd>{viewport.spaces.join(" / ")}</dd>
        </div>
        <div>
          <dt>Perf floor</dt>
          <dd>{viewport.performanceBudget.frameRateFloor}+ FPS / {viewport.performanceBudget.acceptableFrameTimeMs.toFixed(2)}ms</dd>
        </div>
        <div>
          <dt>Startup JS budget</dt>
          <dd>{viewport.performanceBudget.shellStartup.maxInitialJsKb}kb</dd>
        </div>
        <div>
          <dt>Lazy runtime budget</dt>
          <dd>{viewport.performanceBudget.runtimeActivation.maxLazyRuntimeJsKb}kb</dd>
        </div>
        <div>
          <dt>Ready budget</dt>
          <dd>{viewport.performanceBudget.runtimeActivation.maxRendererReadyMs}ms</dd>
        </div>
        <div>
          <dt>Catch-up ratio budget</dt>
          <dd>{(viewport.performanceBudget.framePacing.maxCatchUpFramesRatio * 100).toFixed(0)}%</dd>
        </div>
        <div>
          <dt>Tracked frames min</dt>
          <dd>{viewport.performanceBudget.framePacing.minTrackedVisualFrames}</dd>
        </div>
        <div>
          <dt>Steps / visual frame budget</dt>
          <dd>{viewport.performanceBudget.framePacing.maxSimulationStepsPerVisualFrame}</dd>
        </div>
        <div>
          <dt>Runtime scene mode</dt>
          <dd>{publication.runtimeScene}</dd>
        </div>
        <div>
          <dt>Shell chrome mode</dt>
          <dd>{publication.shellChrome}</dd>
        </div>
        <div>
          <dt>Diagnostics mode</dt>
          <dd>{publication.diagnostics}</dd>
        </div>
        <div>
          <dt>Perf reference</dt>
          <dd>
            {viewport.performanceBudget.referenceDeviceClass} / {viewport.performanceBudget.referenceViewport.width} x{" "}
            {viewport.performanceBudget.referenceViewport.height}
          </dd>
        </div>
      </dl>

      {fullscreen.lastError ? (
        <p className="shell-diagnostics__warning">Fullscreen fallback: {fullscreen.lastError}</p>
      ) : null}
    </aside>
  );
}

export const ShellDiagnosticsPanel = memo(ShellDiagnosticsPanelComponent);
