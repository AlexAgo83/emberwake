import type { ChunkCoordinate } from "@engine/geometry/primitives";
import {
  chunkCoordinateToId,
  chunkWorldSize,
  sampleChunkDebugSignature,
  sampleDeterministicSignature,
  worldContract
} from "@engine/world/worldContract";
import type { TerrainKind } from "@game/content/world/worldData";

export { terrainKinds } from "@game/content/world/worldData";

export type GeneratedTerrainTile = {
  terrainKind: TerrainKind;
  tileX: number;
  tileY: number;
  variant: 0 | 1 | 2;
};

export type GeneratedChunk = {
  chunkCoordinate: ChunkCoordinate;
  chunkId: string;
  primaryTerrain: TerrainKind;
  seed: string;
  signature: number;
  terrainLayer: GeneratedTerrainTile[];
};

const terrainThresholds: Array<{
  max: number;
  terrainKind: TerrainKind;
}> = [
  { max: 24, terrainKind: "glowfen" },
  { max: 110, terrainKind: "ashfield" },
  { max: 214, terrainKind: "emberplain" },
  { max: 255, terrainKind: "obsidian" }
];

const pickTerrainKind = (macroValue: number): TerrainKind =>
  terrainThresholds.find((threshold) => macroValue <= threshold.max)?.terrainKind ?? "ashfield";

export const createGeneratedChunk = (
  chunkCoordinate: ChunkCoordinate,
  seed = worldContract.defaultSeed
): GeneratedChunk => {
  const chunkId = chunkCoordinateToId(chunkCoordinate, seed);
  const signature = sampleChunkDebugSignature(chunkCoordinate, seed);
  const terrainLayer: GeneratedTerrainTile[] = [];
  const chunkTileOffsetX = chunkCoordinate.x * worldContract.chunkSizeInTiles;
  const chunkTileOffsetY = chunkCoordinate.y * worldContract.chunkSizeInTiles;
  const macroValue = signature % 256;
  const primaryTerrain = pickTerrainKind(macroValue);

  for (let tileX = 0; tileX < worldContract.chunkSizeInTiles; tileX += 1) {
    for (let tileY = 0; tileY < worldContract.chunkSizeInTiles; tileY += 1) {
      const worldTileX = chunkTileOffsetX + tileX;
      const worldTileY = chunkTileOffsetY + tileY;
      const tileSignature = sampleDeterministicSignature(`${seed}:${worldTileX}:${worldTileY}`);
      const terrainBias = (macroValue + (tileSignature % 61)) % 256;

      terrainLayer.push({
        terrainKind: pickTerrainKind(terrainBias),
        tileX,
        tileY,
        variant: (tileSignature % 3) as 0 | 1 | 2
      });
    }
  }

  return {
    chunkCoordinate,
    chunkId,
    primaryTerrain,
    seed,
    signature,
    terrainLayer
  };
};

export const chunkGenerationContract = {
  boundaries: {
    excludesAssets: true,
    excludesEntities: true,
    excludesRenderColors: true
  },
  terrainLayerOnly: true,
  worldSizeAssumption: "generation is chunk-local but seed-global"
} as const;

export const sampleChunkWorldArea = () => chunkWorldSize;
