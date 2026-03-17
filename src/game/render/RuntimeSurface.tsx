import { Application } from "@pixi/react";

export function RuntimeSurface() {
  return (
    <div className="runtime-surface" data-runtime-surface="pixi">
      <Application antialias autoDensity backgroundColor={0x09070f} resizeTo={window} />
      <div className="runtime-surface__glow" aria-hidden="true" />
    </div>
  );
}
