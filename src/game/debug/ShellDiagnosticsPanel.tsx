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
import { createGenericMoverEntity } from "../entities/model/entityContract";

type ShellDiagnosticsPanelProps = {
  camera: CameraState;
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
  visible: boolean;
  viewport: ReturnTypeUseLogicalViewportModel;
};

const previewEntity = createGenericMoverEntity();

export function ShellDiagnosticsPanel({
  camera,
  fullscreen,
  preferences,
  renderer,
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
          <dt>Entity archetype</dt>
          <dd>{previewEntity.archetype}</dd>
        </div>
        <div>
          <dt>Entity state</dt>
          <dd>{previewEntity.state}</dd>
        </div>
        <div>
          <dt>Entity radius</dt>
          <dd>{previewEntity.footprint.radius}</dd>
        </div>
        <div>
          <dt>Entity layer</dt>
          <dd>{previewEntity.renderLayer}</dd>
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
