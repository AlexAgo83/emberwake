import { Fragment } from "react";
import type { ReactNode } from "react";

import { RuntimeCanvas, type CameraState } from "@engine-pixi";
import {
  emberwakeRuntimeRenderLayerOrder,
  type EmberwakeRuntimeRenderLayerId
} from "@game/presentation/emberwakeRenderLayers";
import type { EmberwakeRenderSurfaceMode } from "@game";
import { EntityScene } from "../entities/render/EntityScene";
import type { PresentedEntity } from "../entities/model/entityContract";
import { WorldScene } from "../world/render/WorldScene";
import type { ChunkCoordinate } from "../world/types";
import type { SimulatedEntity } from "../entities/model/entitySimulation";

type RuntimeSurfaceProps = {
  camera: CameraState;
  onRendererError?: (message: string) => void;
  onRendererReady?: () => void;
  onSurfaceElementChange?: (element: HTMLDivElement | null) => void;
  renderSurfaceMode: EmberwakeRenderSurfaceMode;
  onVisualFrame?: (timestampMs: number) => void;
  visibleEntities: Array<PresentedEntity<SimulatedEntity>>;
  visibleChunks: ChunkCoordinate[];
  viewport: {
    fitScale: number;
    screenSize: {
      height: number;
      width: number;
    };
  };
  worldSeed: string;
};

export function RuntimeSurface({
  camera,
  onRendererError,
  onRendererReady,
  onSurfaceElementChange,
  renderSurfaceMode,
  onVisualFrame,
  visibleEntities,
  visibleChunks,
  viewport,
  worldSeed
}: RuntimeSurfaceProps) {
  const renderLayers: Record<EmberwakeRuntimeRenderLayerId, ReactNode> = {
    entities: (
      <EntityScene
        camera={camera}
        entities={visibleEntities}
        renderSurfaceMode={renderSurfaceMode}
        viewport={viewport}
      />
    ),
    feedback: null,
    world: (
      <WorldScene
        camera={camera}
        renderSurfaceMode={renderSurfaceMode}
        viewport={viewport}
        visibleChunks={visibleChunks}
        worldSeed={worldSeed}
      />
    )
  };

  return (
    <RuntimeCanvas
      onRendererError={onRendererError}
      onRendererReady={onRendererReady}
      onSurfaceElementChange={onSurfaceElementChange}
      onVisualFrame={onVisualFrame}
    >
      {emberwakeRuntimeRenderLayerOrder.map((layerId) => (
        <Fragment key={layerId}>{renderLayers[layerId]}</Fragment>
      ))}
    </RuntimeCanvas>
  );
}
