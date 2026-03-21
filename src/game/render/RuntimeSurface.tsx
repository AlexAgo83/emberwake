import { Fragment } from "react";
import type { ReactNode, RefObject } from "react";

import type { CameraState } from "@engine/camera/cameraMath";
import { RuntimeCanvas } from "@engine-pixi/components/RuntimeCanvas";
import {
  emberwakeRuntimeRenderLayerOrder,
  type EmberwakeRuntimeRenderLayerId
} from "@game/presentation/emberwakeRenderLayers";
import { EntityScene } from "../entities/render/EntityScene";
import type { PresentedEntity } from "../entities/model/entityContract";
import { WorldScene } from "../world/render/WorldScene";
import type { ChunkCoordinate } from "../world/types";
import type { SimulatedEntity } from "../entities/model/entitySimulation";

type RuntimeSurfaceProps = {
  camera: CameraState;
  onRendererError?: (message: string) => void;
  onRendererReady?: () => void;
  surfaceRef?: RefObject<HTMLDivElement | null>;
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
  surfaceRef,
  visibleEntities,
  visibleChunks,
  viewport,
  worldSeed
}: RuntimeSurfaceProps) {
  const renderLayers: Record<EmberwakeRuntimeRenderLayerId, ReactNode> = {
    entities: <EntityScene camera={camera} entities={visibleEntities} viewport={viewport} />,
    feedback: null,
    world: (
      <WorldScene
        camera={camera}
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
      surfaceRef={surfaceRef}
    >
      {emberwakeRuntimeRenderLayerOrder.map((layerId) => (
        <Fragment key={layerId}>{renderLayers[layerId]}</Fragment>
      ))}
    </RuntimeCanvas>
  );
}
