import type { ChunkCoordinate } from "@engine/geometry/primitives";
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

export const createChunkDebugData = (
  chunkCoordinate: ChunkCoordinate,
  seed?: string
): ChunkDebugData => {
  const generatedChunk = createGeneratedChunk(chunkCoordinate, seed);
  const tiles: DebugTile[] = [];
  const primaryTerrainPalette = terrainDefinitions[generatedChunk.primaryTerrain].debugPalette;

  for (const terrainTile of generatedChunk.terrainLayer) {
    const obstacleTile = generatedChunk.obstacleLayer.find(
      (tile) => tile.tileX === terrainTile.tileX && tile.tileY === terrainTile.tileY
    );
    const surfaceModifierTile = generatedChunk.surfaceModifierLayer.find(
      (tile) => tile.tileX === terrainTile.tileX && tile.tileY === terrainTile.tileY
    );
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

  return {
    baseColor: primaryTerrainPalette.baseColor,
    label: `${chunkCoordinate.x},${chunkCoordinate.y} ${terrainDefinitions[generatedChunk.primaryTerrain].label}`,
    overlayColor: primaryTerrainPalette.overlayColor,
    tiles
  };
};
