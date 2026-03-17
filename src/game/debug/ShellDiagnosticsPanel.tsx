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
import type { SimulatedEntity } from "../entities/model/entitySimulation";
import type { SingleEntityControlState } from "../input/model/singleEntityControlContract";
import type { ChunkCoordinate, WorldPoint } from "../world/types";

type ShellDiagnosticsPanelProps = {
  camera: CameraState;
  control: SingleEntityControlState;
  entity: SimulatedEntity;
  fullscreen: {
    isFullscreen: boolean;
    isSupported: boolean;
    lastError: string | null;
  };
  preferences: ShellPreferences;
  renderer: {
    message: string;
    status: "degraded" | "failed" | "initializing" | "ready";
  };
  worldDiagnostics: {
    hoveredChunkCoordinate: ChunkCoordinate | null;
    hoveredWorldPoint: WorldPoint | null;
    selectedChunkCoordinate: ChunkCoordinate | null;
    selectedWorldPoint: WorldPoint | null;
  };
  worldRender: {
    cachedChunkIds: string[];
    preloadMargin: number;
    trackedEntities: number;
    visibleEntities: number;
    visibleChunks: ChunkCoordinate[];
  };
  visible: boolean;
  viewport: ReturnTypeUseLogicalViewportModel;
};

export function ShellDiagnosticsPanel({
  camera,
  control,
  entity,
  fullscreen,
  preferences,
  renderer,
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
        <p>Shell diagnostics</p>
        <span>{renderer.status}</span>
      </header>

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
          <dt>Chunk id</dt>
          <dd>{chunkCoordinateToId({ x: 0, y: 0 })}</dd>
        </div>
        <div>
          <dt>Chunk signature</dt>
          <dd>{sampleChunkDebugSignature({ x: 0, y: 0 })}</dd>
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
          <dd>{viewport.performanceBudget.frameRateFloor}+ FPS</dd>
        </div>
      </dl>

      {fullscreen.lastError ? (
        <p className="shell-diagnostics__warning">Fullscreen fallback: {fullscreen.lastError}</p>
      ) : null}
    </aside>
  );
}
