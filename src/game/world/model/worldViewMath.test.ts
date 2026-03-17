import { createDefaultCameraState } from "../../camera/model/cameraMath";
import { chunkWorldSize } from "./worldContract";
import {
  createWorldPickingSample,
  getVisibleChunkCoordinates,
  screenPointToWorldPointWithCamera,
  worldPointToScreenPointWithCamera
} from "./worldViewMath";

const viewport = {
  fitScale: 1,
  screenSize: {
    height: 600,
    width: 800
  }
};

describe("worldViewMath", () => {
  it("round-trips a world point through screen space with a camera transform", () => {
    const camera = {
      ...createDefaultCameraState(),
      rotation: Math.PI / 8,
      worldPosition: {
        x: 120,
        y: -80
      },
      zoom: 1.35
    };
    const worldPoint = {
      x: 480,
      y: 320
    };

    const screenPoint = worldPointToScreenPointWithCamera(worldPoint, camera, viewport);
    const resolvedWorldPoint = screenPointToWorldPointWithCamera(screenPoint, camera, viewport);

    expect(resolvedWorldPoint.x).toBeCloseTo(worldPoint.x);
    expect(resolvedWorldPoint.y).toBeCloseTo(worldPoint.y);
  });

  it("derives visible chunks from the rotated camera viewport with preload", () => {
    const camera = {
      ...createDefaultCameraState(),
      rotation: Math.PI / 6,
      zoom: 1.2
    };

    const visibleChunks = getVisibleChunkCoordinates(camera, viewport, 1);

    expect(visibleChunks.length).toBeGreaterThan(0);
    expect(visibleChunks).toContainEqual({ x: -1, y: -1 });
    expect(visibleChunks).toContainEqual({ x: 1, y: 1 });
  });

  it("resolves a world picking sample from a screen point", () => {
    const sample = createWorldPickingSample(
      {
        x: viewport.screenSize.width / 2 + chunkWorldSize,
        y: viewport.screenSize.height / 2
      },
      createDefaultCameraState(),
      viewport
    );

    expect(sample.chunkCoordinate).toEqual({
      x: 1,
      y: 0
    });
    expect(sample.worldPoint.x).toBeCloseTo(chunkWorldSize);
    expect(sample.worldPoint.y).toBeCloseTo(0);
  });
});
