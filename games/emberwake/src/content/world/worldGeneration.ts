import type { ChunkCoordinate } from "@engine/geometry/primitives";
import type { WorldPoint } from "@engine/geometry/primitives";
import {
  chunkCoordinateToId,
  chunkWorldSize,
  sampleChunkDebugSignature,
  sampleDeterministicSignature,
  worldPointToTileCoordinate,
  worldContract
} from "@engine/world/worldContract";
import type {
  MovementSurfaceModifierKind,
  ObstacleKind,
  TerrainKind
} from "@game/content/world/worldData";

export {
  movementSurfaceModifierDefinitions,
  obstacleDefinitions,
  terrainKinds
} from "@game/content/world/worldData";

export type GeneratedTerrainTile = {
  terrainKind: TerrainKind;
  tileX: number;
  tileY: number;
  variant: 0 | 1 | 2;
};

export type GeneratedObstacleTile = {
  obstacleKind: ObstacleKind;
  tileX: number;
  tileY: number;
  variant: 0 | 1;
};

export type GeneratedSurfaceModifierTile = {
  modifierKind: MovementSurfaceModifierKind;
  tileX: number;
  tileY: number;
};

export type GeneratedChunk = {
  chunkCoordinate: ChunkCoordinate;
  chunkId: string;
  obstacleLayer: GeneratedObstacleTile[];
  primaryTerrain: TerrainKind;
  seed: string;
  signature: number;
  surfaceModifierLayer: GeneratedSurfaceModifierTile[];
  terrainLayer: GeneratedTerrainTile[];
};

export type SampledWorldTileLayers = {
  modifierKind: MovementSurfaceModifierKind;
  obstacleKind: ObstacleKind;
  terrainKind: TerrainKind;
  variant: 0 | 1 | 2;
  worldTileX: number;
  worldTileY: number;
};

const sampledWorldTileLayerCacheLimit = 8192;
const sampledWorldTileLayerCache = new Map<string, SampledWorldTileLayers>();

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

const protectedBootstrapTileRadius = 1;

const isProtectedBootstrapTile = (worldTileX: number, worldTileY: number) =>
  Math.abs(worldTileX) <= protectedBootstrapTileRadius &&
  Math.abs(worldTileY) <= protectedBootstrapTileRadius;

const sampleChunkMacroValue = (
  chunkCoordinate: ChunkCoordinate,
  seed: string
) => sampleChunkDebugSignature(chunkCoordinate, seed) % 256;

const sampleTerrainAtWorldTile = (
  worldTileX: number,
  worldTileY: number,
  seed: string
): Pick<SampledWorldTileLayers, "terrainKind" | "variant"> => {
  const chunkCoordinate = {
    x: Math.floor(worldTileX / worldContract.chunkSizeInTiles),
    y: Math.floor(worldTileY / worldContract.chunkSizeInTiles)
  };
  const macroValue = sampleChunkMacroValue(chunkCoordinate, seed);
  const tileSignature = sampleDeterministicSignature(`${seed}:${worldTileX}:${worldTileY}`);
  const terrainBias = (macroValue + (tileSignature % 61)) % 256;

  return {
    terrainKind: pickTerrainKind(terrainBias),
    variant: (tileSignature % 3) as 0 | 1 | 2
  };
};

const obstacleThresholdByTerrain: Record<TerrainKind, number> = {
  ashfield: 20,
  emberplain: 16,
  glowfen: 28,
  obsidian: 36
};

const sampleObstacleAtWorldTile = (
  worldTileX: number,
  worldTileY: number,
  terrainKind: TerrainKind,
  seed: string
): Pick<SampledWorldTileLayers, "obstacleKind"> & { variant: 0 | 1 } => {
  if (isProtectedBootstrapTile(worldTileX, worldTileY)) {
    return {
      obstacleKind: "none",
      variant: 0
    };
  }

  const tileSignature = sampleDeterministicSignature(`${seed}:obstacle:${worldTileX}:${worldTileY}`);
  const clusterSignature = sampleDeterministicSignature(
    `${seed}:obstacle-cluster:${Math.floor(worldTileX / 2)}:${Math.floor(worldTileY / 2)}`
  );
  const obstacleValue = (clusterSignature + (tileSignature % 53)) % 256;

  return {
    obstacleKind:
      obstacleValue < obstacleThresholdByTerrain[terrainKind] ? "solid" : "none",
    variant: (tileSignature % 2) as 0 | 1
  };
};

const sampleSurfaceModifierAtWorldTile = (
  worldTileX: number,
  worldTileY: number,
  terrainKind: TerrainKind,
  obstacleKind: ObstacleKind,
  seed: string
): MovementSurfaceModifierKind => {
  if (obstacleKind !== "none" || isProtectedBootstrapTile(worldTileX, worldTileY)) {
    return "normal";
  }

  const tileSignature = sampleDeterministicSignature(`${seed}:surface:${worldTileX}:${worldTileY}`);
  const clusterSignature = sampleDeterministicSignature(
    `${seed}:surface-cluster:${Math.floor(worldTileX / 3)}:${Math.floor(worldTileY / 3)}`
  );
  const modifierValue = (clusterSignature + (tileSignature % 71)) % 256;

  if (terrainKind === "glowfen" && modifierValue < 108) {
    return "slow";
  }

  if (terrainKind === "obsidian" && modifierValue < 68) {
    return "slippery";
  }

  if (terrainKind === "ashfield" && modifierValue < 20) {
    return "slow";
  }

  if (terrainKind === "emberplain" && modifierValue < 14) {
    return "slippery";
  }

  return "normal";
};

const getSampledWorldTileLayerCacheKey = (
  worldTileX: number,
  worldTileY: number,
  seed: string
) => `${seed}:${worldTileX}:${worldTileY}`;

export const sampleWorldTileLayers = (
  worldTileX: number,
  worldTileY: number,
  seed = worldContract.defaultSeed
): SampledWorldTileLayers => {
  const cacheKey = getSampledWorldTileLayerCacheKey(worldTileX, worldTileY, seed);
  const cachedLayers = sampledWorldTileLayerCache.get(cacheKey);

  if (cachedLayers) {
    return cachedLayers;
  }

  const terrainSample = sampleTerrainAtWorldTile(worldTileX, worldTileY, seed);
  const obstacleSample = sampleObstacleAtWorldTile(
    worldTileX,
    worldTileY,
    terrainSample.terrainKind,
    seed
  );

  const sampledLayers = {
    modifierKind: sampleSurfaceModifierAtWorldTile(
      worldTileX,
      worldTileY,
      terrainSample.terrainKind,
      obstacleSample.obstacleKind,
      seed
    ),
    obstacleKind: obstacleSample.obstacleKind,
    terrainKind: terrainSample.terrainKind,
    variant: terrainSample.variant,
    worldTileX,
    worldTileY
  };

  sampledWorldTileLayerCache.set(cacheKey, sampledLayers);

  if (sampledWorldTileLayerCache.size > sampledWorldTileLayerCacheLimit) {
    const oldestCacheKey = sampledWorldTileLayerCache.keys().next().value;

    if (oldestCacheKey !== undefined) {
      sampledWorldTileLayerCache.delete(oldestCacheKey);
    }
  }

  return sampledLayers;
};

export const sampleWorldPointLayers = (
  worldPoint: WorldPoint,
  seed = worldContract.defaultSeed
): SampledWorldTileLayers => {
  const tileCoordinate = worldPointToTileCoordinate(worldPoint);

  return sampleWorldTileLayers(tileCoordinate.x, tileCoordinate.y, seed);
};

export const createGeneratedChunk = (
  chunkCoordinate: ChunkCoordinate,
  seed = worldContract.defaultSeed
): GeneratedChunk => {
  const chunkId = chunkCoordinateToId(chunkCoordinate, seed);
  const signature = sampleChunkDebugSignature(chunkCoordinate, seed);
  const obstacleLayer: GeneratedObstacleTile[] = [];
  const surfaceModifierLayer: GeneratedSurfaceModifierTile[] = [];
  const terrainLayer: GeneratedTerrainTile[] = [];
  const chunkTileOffsetX = chunkCoordinate.x * worldContract.chunkSizeInTiles;
  const chunkTileOffsetY = chunkCoordinate.y * worldContract.chunkSizeInTiles;
  const macroValue = signature % 256;
  const primaryTerrain = pickTerrainKind(macroValue);

  for (let tileX = 0; tileX < worldContract.chunkSizeInTiles; tileX += 1) {
    for (let tileY = 0; tileY < worldContract.chunkSizeInTiles; tileY += 1) {
      const worldTileX = chunkTileOffsetX + tileX;
      const worldTileY = chunkTileOffsetY + tileY;
      const tileLayers = sampleWorldTileLayers(worldTileX, worldTileY, seed);

      terrainLayer.push({
        terrainKind: tileLayers.terrainKind,
        tileX,
        tileY,
        variant: tileLayers.variant
      });
      obstacleLayer.push({
        obstacleKind: tileLayers.obstacleKind,
        tileX,
        tileY,
        variant: (tileLayers.variant % 2) as 0 | 1
      });
      surfaceModifierLayer.push({
        modifierKind: tileLayers.modifierKind,
        tileX,
        tileY
      });
    }
  }

  return {
    chunkCoordinate,
    chunkId,
    obstacleLayer,
    primaryTerrain,
    seed,
    signature,
    surfaceModifierLayer,
    terrainLayer
  };
};

export const resetSampledWorldTileLayerCacheForTests = () => {
  sampledWorldTileLayerCache.clear();
};

export const getSampledWorldTileLayerCacheSizeForTests = () =>
  sampledWorldTileLayerCache.size;

export const chunkGenerationContract = {
  boundaries: {
    excludesAssets: true,
    excludesEntities: true,
    excludesRenderColors: true
  },
  obstacleLayer: true,
  surfaceModifierLayer: true,
  terrainLayerOnly: false,
  worldSizeAssumption: "generation is chunk-local but seed-global"
} as const;

export const sampleChunkWorldArea = () => chunkWorldSize;
