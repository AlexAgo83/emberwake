import { Application } from "@pixi/react";
import type { PropsWithChildren, RefObject } from "react";

import { RuntimeSurfaceBoundary } from "./RuntimeSurfaceBoundary";

type RuntimeCanvasProps = PropsWithChildren<{
  backgroundColor?: number;
  className?: string;
  dataRuntimeSurface?: string;
  glowClassName?: string;
  onRendererError?: (message: string) => void;
  onRendererReady?: () => void;
  surfaceRef?: RefObject<HTMLDivElement | null>;
}>;

export function RuntimeCanvas({
  backgroundColor = 0x09070f,
  children,
  className = "runtime-surface",
  dataRuntimeSurface = "pixi",
  glowClassName = "runtime-surface__glow",
  onRendererError,
  onRendererReady,
  surfaceRef
}: RuntimeCanvasProps) {
  return (
    <div className={className} data-runtime-surface={dataRuntimeSurface} ref={surfaceRef}>
      <RuntimeSurfaceBoundary
        onError={(error) => {
          onRendererError?.(error.message);
        }}
      >
        <Application
          antialias
          autoDensity
          backgroundColor={backgroundColor}
          onInit={onRendererReady}
          resizeTo={surfaceRef ?? window}
        >
          {children}
        </Application>
      </RuntimeSurfaceBoundary>
      <div className={glowClassName} aria-hidden="true" />
    </div>
  );
}
