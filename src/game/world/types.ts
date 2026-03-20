import type { WorldPoint } from "@engine/geometry/primitives";

export type { ChunkCoordinate, ScreenPoint, WorldPoint } from "@engine/geometry/primitives";

export type ViewportProjectionContract = {
  fitScale: number;
  screenSize: {
    height: number;
    width: number;
  };
  worldOrigin: WorldPoint;
};
