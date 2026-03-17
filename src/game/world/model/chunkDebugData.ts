import { sampleChunkDebugSignature, worldContract } from "./worldContract";
import type { ChunkCoordinate } from "../types";

type DebugTile = {
  color: number;
  x: number;
  y: number;
};

export type ChunkDebugData = {
  baseColor: number;
  label: string;
  overlayColor: number;
  tiles: DebugTile[];
};

const colorPalette = [0x21192d, 0x16242f, 0x2b1f1f, 0x1c2820, 0x22222f, 0x301d27];
const overlayPalette = [0xffa457, 0x4ce2ff, 0xff5f7a, 0x9fff7a, 0xd88cff, 0xffd36e];

export const createChunkDebugData = (chunkCoordinate: ChunkCoordinate): ChunkDebugData => {
  const signature = sampleChunkDebugSignature(chunkCoordinate);
  const tileCount = worldContract.chunkSizeInTiles;
  const tiles: DebugTile[] = [];

  for (let tileX = 0; tileX < tileCount; tileX += 1) {
    for (let tileY = 0; tileY < tileCount; tileY += 1) {
      const tileSignature = (signature + tileX * 73 + tileY * 97) >>> 0;

      tiles.push({
        color: colorPalette[tileSignature % colorPalette.length],
        x: tileX,
        y: tileY
      });
    }
  }

  return {
    baseColor: colorPalette[signature % colorPalette.length],
    label: `${chunkCoordinate.x},${chunkCoordinate.y}`,
    overlayColor: overlayPalette[signature % overlayPalette.length],
    tiles
  };
};
