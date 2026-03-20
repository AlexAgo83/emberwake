import type {
  ChunkCoordinate,
  ScreenPoint,
  WorldPoint
} from "../geometry/primitives";

export type ViewportProjectionContract = {
  fitScale: number;
  screenSize: {
    height: number;
    width: number;
  };
  worldOrigin: WorldPoint;
};

export const worldContract: {
  chunkSizeInTiles: number;
  defaultSeed: string;
  tileSizeInWorldUnits: number;
} = {
  chunkSizeInTiles: 16,
  defaultSeed: "emberwake-default-seed",
  tileSizeInWorldUnits: 64
};

export const chunkWorldSize = worldContract.chunkSizeInTiles * worldContract.tileSizeInWorldUnits;

const hashString = (value: string) => {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return hash >>> 0;
};

export const sampleDeterministicSignature = (value: string) => hashString(value);

export const worldToChunkIndex = (worldCoordinate: number) =>
  Math.floor(worldCoordinate / chunkWorldSize);

export const worldPointToChunkCoordinate = (worldPoint: WorldPoint): ChunkCoordinate => ({
  x: worldToChunkIndex(worldPoint.x),
  y: worldToChunkIndex(worldPoint.y)
});

export const chunkCoordinateToWorldOrigin = (chunkCoordinate: ChunkCoordinate): WorldPoint => ({
  x: chunkCoordinate.x * chunkWorldSize,
  y: chunkCoordinate.y * chunkWorldSize
});

export const chunkCoordinateToId = (
  chunkCoordinate: ChunkCoordinate,
  seed = worldContract.defaultSeed
) => `${seed}:${chunkCoordinate.x}:${chunkCoordinate.y}`;

export const sampleChunkDebugSignature = (
  chunkCoordinate: ChunkCoordinate,
  seed = worldContract.defaultSeed
) => sampleDeterministicSignature(chunkCoordinateToId(chunkCoordinate, seed));

export const worldPointToScreenPoint = (
  worldPoint: WorldPoint,
  viewport: ViewportProjectionContract
): ScreenPoint => ({
  x: (worldPoint.x - viewport.worldOrigin.x) * viewport.fitScale + viewport.screenSize.width / 2,
  y: (worldPoint.y - viewport.worldOrigin.y) * viewport.fitScale + viewport.screenSize.height / 2
});

export const screenPointToWorldPoint = (
  screenPoint: ScreenPoint,
  viewport: ViewportProjectionContract
): WorldPoint => ({
  x: (screenPoint.x - viewport.screenSize.width / 2) / viewport.fitScale + viewport.worldOrigin.x,
  y: (screenPoint.y - viewport.screenSize.height / 2) / viewport.fitScale + viewport.worldOrigin.y
});
