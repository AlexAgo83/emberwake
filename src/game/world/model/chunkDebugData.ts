import { createGeneratedChunk } from "./worldGeneration";
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

const terrainPalette = {
  ashfield: {
    baseColor: 0x1b1f25,
    overlayColor: 0xffc36e,
    variants: [0x222932, 0x1a2128, 0x262e38]
  },
  emberplain: {
    baseColor: 0x301d27,
    overlayColor: 0xff8b63,
    variants: [0x41242f, 0x3a212b, 0x4b2b36]
  },
  glowfen: {
    baseColor: 0x16242f,
    overlayColor: 0x4ce2ff,
    variants: [0x1f3342, 0x18303d, 0x214255]
  },
  obsidian: {
    baseColor: 0x21192d,
    overlayColor: 0xd88cff,
    variants: [0x2a2038, 0x241d32, 0x312746]
  }
} as const;

export const createChunkDebugData = (
  chunkCoordinate: ChunkCoordinate,
  seed?: string
): ChunkDebugData => {
  const generatedChunk = createGeneratedChunk(chunkCoordinate, seed);
  const tiles: DebugTile[] = [];
  const primaryTerrainPalette = terrainPalette[generatedChunk.primaryTerrain];

  for (const terrainTile of generatedChunk.terrainLayer) {
    const terrainColors = terrainPalette[terrainTile.terrainKind];

    tiles.push({
      color: terrainColors.variants[terrainTile.variant],
      x: terrainTile.tileX,
      y: terrainTile.tileY
    });
  }

  return {
    baseColor: primaryTerrainPalette.baseColor,
    label: `${chunkCoordinate.x},${chunkCoordinate.y} ${generatedChunk.primaryTerrain}`,
    overlayColor: primaryTerrainPalette.overlayColor,
    tiles
  };
};
