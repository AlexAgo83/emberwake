import { Application } from "@pixi/react";
import type { RefObject } from "react";

type RuntimeSurfaceProps = {
  surfaceRef?: RefObject<HTMLDivElement | null>;
};

export function RuntimeSurface({ surfaceRef }: RuntimeSurfaceProps) {
  return (
    <div className="runtime-surface" data-runtime-surface="pixi" ref={surfaceRef}>
      <Application
        antialias
        autoDensity
        backgroundColor={0x09070f}
        resizeTo={surfaceRef ?? window}
      />
      <div className="runtime-surface__glow" aria-hidden="true" />
    </div>
  );
}
