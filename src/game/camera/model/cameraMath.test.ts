import { cameraContract } from "@engine/camera/cameraContract";
import {
  clampZoom,
  createDefaultCameraState,
  panCamera,
  rotateCamera,
  rotateScreenDeltaIntoWorld,
  zoomCamera
} from "./cameraMath";

describe("cameraMath", () => {
  it("clamps zoom into explicit bounds", () => {
    expect(clampZoom(0.01)).toBe(cameraContract.minZoom);
    expect(clampZoom(99)).toBe(cameraContract.maxZoom);
    expect(clampZoom(1.25)).toBe(1.25);
  });

  it("uses a stable reset camera state", () => {
    expect(createDefaultCameraState()).toEqual({
      rotation: 0,
      worldPosition: { x: 0, y: 0 },
      zoom: 1.25
    });
  });

  it("pans camera in world space using screen deltas", () => {
    const cameraState = createDefaultCameraState();
    const nextState = panCamera(cameraState, 90, -45, 0.5);

    expect(nextState.worldPosition).toEqual({
      x: -180,
      y: 90
    });
  });

  it("rotates deltas into world space using camera rotation", () => {
    const rotatedDelta = rotateScreenDeltaIntoWorld(10, 0, Math.PI / 2, 1);

    expect(Math.round(rotatedDelta.x)).toBe(0);
    expect(Math.round(rotatedDelta.y)).toBe(-10);
  });

  it("supports zoom and rotation updates", () => {
    const zoomed = zoomCamera(createDefaultCameraState(), -200);
    const rotated = rotateCamera(createDefaultCameraState(), cameraContract.rotationStepRadians);

    expect(zoomed.zoom).toBeGreaterThan(1.25);
    expect(rotated.rotation).toBe(cameraContract.rotationStepRadians);
  });
});
