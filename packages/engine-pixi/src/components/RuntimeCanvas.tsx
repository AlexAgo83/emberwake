import { Application } from "@pixi/react";
import { useCallback, useState } from "react";
import type { PropsWithChildren } from "react";

import { RuntimeFrameLoopBridge } from "./RuntimeFrameLoopBridge";
import { RuntimeSurfaceBoundary } from "./RuntimeSurfaceBoundary";

type RuntimeCanvasProps = PropsWithChildren<{
  backgroundColor?: number;
  className?: string;
  dataRuntimeSurface?: string;
  glowClassName?: string;
  onRendererError?: (message: string) => void;
  onRendererReady?: () => void;
  onSurfaceElementChange?: (element: HTMLDivElement | null) => void;
  onVisualFrame?: (timestampMs: number) => void;
}>;

export function RuntimeCanvas({
  backgroundColor = 0x09070f,
  children,
  className = "runtime-surface",
  dataRuntimeSurface = "pixi",
  glowClassName = "runtime-surface__glow",
  onRendererError,
  onRendererReady,
  onSurfaceElementChange,
  onVisualFrame
}: RuntimeCanvasProps) {
  const [surfaceElement, setSurfaceElement] = useState<HTMLDivElement | null>(null);
  const handleSurfaceRef = useCallback(
    (element: HTMLDivElement | null) => {
      setSurfaceElement((currentElement) =>
        currentElement === element ? currentElement : element
      );
      onSurfaceElementChange?.(element);
    },
    [onSurfaceElementChange]
  );

  return (
    <div className={className} data-runtime-surface={dataRuntimeSurface} ref={handleSurfaceRef}>
      <RuntimeSurfaceBoundary
        onError={(error) => {
          onRendererError?.(error.message);
        }}
      >
        <Application
          antialias
          autoDensity
          autoStart
          backgroundColor={backgroundColor}
          onInit={onRendererReady}
          resizeTo={surfaceElement ?? window}
          sharedTicker={false}
        >
          <RuntimeFrameLoopBridge onVisualFrame={onVisualFrame} />
          {children}
        </Application>
      </RuntimeSurfaceBoundary>
      <div className={glowClassName} aria-hidden="true" />
    </div>
  );
}
