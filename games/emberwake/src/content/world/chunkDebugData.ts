import type { ChunkCoordinate } from "@engine/geometry/primitives";
import { chunkCoordinateToId } from "@engine/world/worldContract";
import { createGeneratedChunk } from "@game/content/world/worldGeneration";
import {
  movementSurfaceModifierDefinitions,
  obstacleDefinitions,
  terrainDefinitions
} from "@game/content/world/worldData";

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

const chunkDebugDataCacheLimit = 192;
const chunkDebugDataCache = new Map<string, ChunkDebugData>();

export const createChunkDebugData = (
  chunkCoordinate: ChunkCoordinate,
  seed?: string
): ChunkDebugData => {
  const cacheKey = chunkCoordinateToId(chunkCoordinate, seed);
  const cachedDebugData = chunkDebugDataCache.get(cacheKey);

  if (cachedDebugData) {
    return cachedDebugData;
  }

  const generatedChunk = createGeneratedChunk(chunkCoordinate, seed);
  const tiles: DebugTile[] = [];
  const primaryTerrainPalette = terrainDefinitions[generatedChunk.primaryTerrain].debugPalette;
  const obstacleIndex = new Map(
    generatedChunk.obstacleLayer.map((tile) => [`${tile.tileX}:${tile.tileY}`, tile])
  );
  const surfaceModifierIndex = new Map(
    generatedChunk.surfaceModifierLayer.map((tile) => [`${tile.tileX}:${tile.tileY}`, tile])
  );

  for (const terrainTile of generatedChunk.terrainLayer) {
    const tileKey = `${terrainTile.tileX}:${terrainTile.tileY}`;
    const obstacleTile = obstacleIndex.get(tileKey);
    const surfaceModifierTile = surfaceModifierIndex.get(tileKey);
    const terrainColors = terrainDefinitions[terrainTile.terrainKind].debugPalette;
    const obstacleColor =
      obstacleTile && obstacleDefinitions[obstacleTile.obstacleKind].debugColor !== null
        ? obstacleDefinitions[obstacleTile.obstacleKind].debugColor
        : null;
    const surfaceAccentColor =
      surfaceModifierTile &&
      movementSurfaceModifierDefinitions[surfaceModifierTile.modifierKind].accentColor !== null
        ? movementSurfaceModifierDefinitions[surfaceModifierTile.modifierKind].accentColor
        : null;

    tiles.push({
      color: obstacleColor ?? surfaceAccentColor ?? terrainColors.variants[terrainTile.variant],
      x: terrainTile.tileX,
      y: terrainTile.tileY
    });
  }

  const debugData = {
    baseColor: primaryTerrainPalette.baseColor,
    label: `${chunkCoordinate.x},${chunkCoordinate.y} ${terrainDefinitions[generatedChunk.primaryTerrain].label}`,
    overlayColor: primaryTerrainPalette.overlayColor,
    tiles
  };

  chunkDebugDataCache.set(cacheKey, debugData);

  if (chunkDebugDataCache.size > chunkDebugDataCacheLimit) {
    const oldestCacheKey = chunkDebugDataCache.keys().next().value;

    if (oldestCacheKey !== undefined) {
      chunkDebugDataCache.delete(oldestCacheKey);
    }
  }

  return debugData;
};

export const resetChunkDebugDataCacheForTests = () => {
  chunkDebugDataCache.clear();
};
