import { Application } from "@pixi/react";
import type { RefObject } from "react";

import { RuntimeSurfaceBoundary } from "./RuntimeSurfaceBoundary";
import { WorldScene } from "../world/render/WorldScene";
import type { CameraState } from "../camera/model/cameraMath";
import type { ChunkCoordinate } from "../world/types";

type RuntimeSurfaceProps = {
  camera: CameraState;
  onRendererError?: (message: string) => void;
  onRendererReady?: () => void;
  surfaceRef?: RefObject<HTMLDivElement | null>;
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
        </Application>
      </RuntimeSurfaceBoundary>
      <div className="runtime-surface__glow" aria-hidden="true" />
    </div>
  );
}
