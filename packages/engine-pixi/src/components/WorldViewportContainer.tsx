import { extend } from "@pixi/react";
import { Container } from "pixi.js";
import type { PropsWithChildren } from "react";

import type { CameraState } from "@engine/camera/cameraMath";

extend({
  Container
});

type ViewportLike = {
  fitScale: number;
  screenSize: {
    height: number;
    width: number;
  };
};

type WorldViewportContainerProps = PropsWithChildren<{
  camera: CameraState;
  viewport: ViewportLike;
}>;

export function WorldViewportContainer({
  camera,
  children,
  viewport
}: WorldViewportContainerProps) {
  const scale = viewport.fitScale * camera.zoom;

  return (
    <pixiContainer
      pivot={camera.worldPosition}
      rotation={-camera.rotation}
      scale={scale}
      sortableChildren
      x={viewport.screenSize.width / 2}
      y={viewport.screenSize.height / 2}
    >
      {children}
    </pixiContainer>
  );
}
