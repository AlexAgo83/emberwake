import { createGeneratedChunk } from "./worldGeneration";
import { terrainDefinitions } from "../data/worldData";
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

export const createChunkDebugData = (
  chunkCoordinate: ChunkCoordinate,
  seed?: string
): ChunkDebugData => {
  const generatedChunk = createGeneratedChunk(chunkCoordinate, seed);
  const tiles: DebugTile[] = [];
  const primaryTerrainPalette = terrainDefinitions[generatedChunk.primaryTerrain].debugPalette;

  for (const terrainTile of generatedChunk.terrainLayer) {
    const terrainColors = terrainDefinitions[terrainTile.terrainKind].debugPalette;

    tiles.push({
      color: terrainColors.variants[terrainTile.variant],
      x: terrainTile.tileX,
      y: terrainTile.tileY
    });
  }

  return {
    baseColor: primaryTerrainPalette.baseColor,
    label: `${chunkCoordinate.x},${chunkCoordinate.y} ${terrainDefinitions[generatedChunk.primaryTerrain].label}`,
    overlayColor: primaryTerrainPalette.overlayColor,
    tiles
  };
};
