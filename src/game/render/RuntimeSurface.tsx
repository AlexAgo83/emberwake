import { Application } from "@pixi/react";
import type { RefObject } from "react";

import { RuntimeSurfaceBoundary } from "./RuntimeSurfaceBoundary";
import { EntityScene } from "../entities/render/EntityScene";
import { WorldScene } from "../world/render/WorldScene";
import type { CameraState } from "../camera/model/cameraMath";
import type { ChunkCoordinate } from "../world/types";
import type { SimulatedEntity } from "../entities/model/entitySimulation";

type RuntimeSurfaceProps = {
  camera: CameraState;
  onRendererError?: (message: string) => void;
  onRendererReady?: () => void;
  surfaceRef?: RefObject<HTMLDivElement | null>;
  visibleEntities: SimulatedEntity[];
  visibleChunks: ChunkCoordinate[];
  viewport: {
    fitScale: number;
    screenSize: {
      height: number;
      width: number;
    };
  };
};

export function RuntimeSurface({
  camera,
  onRendererError,
  onRendererReady,
  surfaceRef,
  visibleEntities,
  visibleChunks,
  viewport
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
          <WorldScene camera={camera} viewport={viewport} visibleChunks={visibleChunks} />
          <EntityScene camera={camera} entities={visibleEntities} viewport={viewport} />
        </Application>
      </RuntimeSurfaceBoundary>
      <div className="runtime-surface__glow" aria-hidden="true" />
    </div>
  );
}
