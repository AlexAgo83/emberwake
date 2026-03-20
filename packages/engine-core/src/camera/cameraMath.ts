import { cameraContract } from "./cameraContract";
import type { WorldPoint } from "../geometry/primitives";

export type CameraState = {
  rotation: number;
  worldPosition: WorldPoint;
  zoom: number;
};

export const createDefaultCameraState = (): CameraState => ({
  rotation: cameraContract.resetRotation,
  worldPosition: { ...cameraContract.resetWorldPosition },
  zoom: cameraContract.resetZoom
});

export const clampZoom = (zoom: number) =>
  Math.min(cameraContract.maxZoom, Math.max(cameraContract.minZoom, zoom));

export const rotateScreenDeltaIntoWorld = (
  deltaX: number,
  deltaY: number,
  rotation: number,
  scale: number
): WorldPoint => {
  const safeScale = Math.max(scale, 0.0001);
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);

  return {
    x: (cosine * deltaX + sine * deltaY) / safeScale,
    y: (-sine * deltaX + cosine * deltaY) / safeScale
  };
};

export const panCamera = (
  cameraState: CameraState,
  deltaX: number,
  deltaY: number,
  scale: number
): CameraState => {
  const worldDelta = rotateScreenDeltaIntoWorld(deltaX, deltaY, cameraState.rotation, scale);

  return {
    ...cameraState,
    worldPosition: {
      x: cameraState.worldPosition.x - worldDelta.x,
      y: cameraState.worldPosition.y - worldDelta.y
    }
  };
};

export const zoomCamera = (cameraState: CameraState, deltaY: number): CameraState => ({
  ...cameraState,
  zoom: clampZoom(cameraState.zoom * (1 - deltaY * cameraContract.zoomStepMultiplier))
});

export const rotateCamera = (cameraState: CameraState, deltaRotation: number): CameraState => ({
  ...cameraState,
  rotation: cameraState.rotation + deltaRotation
});
