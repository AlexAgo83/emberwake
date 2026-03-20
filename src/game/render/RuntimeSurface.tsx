import { Application } from "@pixi/react";
import type { RefObject } from "react";

import type { CameraState } from "@engine/camera/cameraMath";
import { RuntimeSurfaceBoundary } from "@engine-pixi/components/RuntimeSurfaceBoundary";
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
  return (
    <div className="runtime-surface" data-runtime-surface="pixi" ref={surfaceRef}>
      <RuntimeSurfaceBoundary
        onError={(error) => {
          onRendererError?.(error.message);
        }}
      >
        <Application
          antialias
          autoDensity
          backgroundColor={0x09070f}
          onInit={onRendererReady}
          resizeTo={surfaceRef ?? window}
        >
          <WorldScene
            camera={camera}
            viewport={viewport}
            visibleChunks={visibleChunks}
            worldSeed={worldSeed}
          />
          <EntityScene camera={camera} entities={visibleEntities} viewport={viewport} />
        </Application>
      </RuntimeSurfaceBoundary>
      <div className="runtime-surface__glow" aria-hidden="true" />
    </div>
  );
}
