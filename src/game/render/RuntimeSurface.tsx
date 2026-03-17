import { Application } from "@pixi/react";
import type { RefObject } from "react";

import { RuntimeSurfaceBoundary } from "./RuntimeSurfaceBoundary";

type RuntimeSurfaceProps = {
  onRendererError?: (message: string) => void;
  onRendererReady?: () => void;
  surfaceRef?: RefObject<HTMLDivElement | null>;
};

export function RuntimeSurface({
  onRendererError,
  onRendererReady,
  surfaceRef
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
        />
      </RuntimeSurfaceBoundary>
      <div className="runtime-surface__glow" aria-hidden="true" />
    </div>
  );
}
