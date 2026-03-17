export type ChunkCoordinate = {
  x: number;
  y: number;
};

export type ScreenPoint = {
  x: number;
  y: number;
};

export type WorldPoint = {
  x: number;
  y: number;
};

export type ViewportProjectionContract = {
  fitScale: number;
  screenSize: {
    height: number;
    width: number;
  };
  worldOrigin: WorldPoint;
};
