import {
  createGeneratedChunk,
  getSampledWorldTileLayerCacheSizeForTests,
  resetSampledWorldTileLayerCacheForTests,
  sampleWorldTileLayers,
  terrainKinds
} from "./worldGeneration";
import { worldContract } from "./worldContract";

describe("worldGeneration", () => {
  beforeEach(() => {
    resetSampledWorldTileLayerCacheForTests();
  });

  it("keeps chunk generation deterministic for the same seed and coordinates", () => {
    const chunkCoordinate = { x: -2, y: 3 };

    expect(createGeneratedChunk(chunkCoordinate, "alpha-seed")).toEqual(
      createGeneratedChunk(chunkCoordinate, "alpha-seed")
    );
  });

  it("changes generated terrain when chunk coordinates change", () => {
    const firstChunk = createGeneratedChunk({ x: 0, y: 0 }, "alpha-seed");
    const secondChunk = createGeneratedChunk({ x: 1, y: 0 }, "alpha-seed");

    expect(firstChunk.chunkId).not.toBe(secondChunk.chunkId);
    expect(firstChunk.terrainLayer).not.toEqual(secondChunk.terrainLayer);
  });

  it("builds full terrain, obstacle, and surface layers without render-only fields", () => {
    const generatedChunk = createGeneratedChunk({ x: 0, y: 0 });

    expect(generatedChunk.terrainLayer).toHaveLength(worldContract.chunkSizeInTiles ** 2);
    expect(generatedChunk.obstacleLayer).toHaveLength(worldContract.chunkSizeInTiles ** 2);
    expect(generatedChunk.surfaceModifierLayer).toHaveLength(worldContract.chunkSizeInTiles ** 2);
    expect(terrainKinds).toContain(generatedChunk.primaryTerrain);
    expect(generatedChunk.terrainLayer[0]).toEqual({
      terrainKind: expect.any(String),
      tileX: expect.any(Number),
      tileY: expect.any(Number),
      variant: expect.any(Number)
    });
    expect(generatedChunk.terrainLayer[0]).not.toHaveProperty("color");
    expect(generatedChunk.terrainLayer[0]).not.toHaveProperty("entityId");
  });

  it("keeps the origin tile traversable and normal for bootstrap safety", () => {
    expect(sampleWorldTileLayers(0, 0)).toMatchObject({
      modifierKind: "normal",
      obstacleKind: "none"
    });
  });

  it("reuses sampled tile layers and keeps the cache bounded", () => {
    const firstSample = sampleWorldTileLayers(4, -3, "alpha-seed");
    const repeatedSample = sampleWorldTileLayers(4, -3, "alpha-seed");

    expect(repeatedSample).toBe(firstSample);

    for (let index = 0; index < 9000; index += 1) {
      sampleWorldTileLayers(index, index * -1, "alpha-seed");
    }

    expect(getSampledWorldTileLayerCacheSizeForTests()).toBeLessThanOrEqual(8192);
  });

  it("keeps obstacle and surface features relatively sparse while forming clustered patches", () => {
    const featureTiles = Array.from({ length: 48 * 48 }, (_, index) => {
      const tileX = (index % 48) - 24;
      const tileY = Math.floor(index / 48) - 24;
      const tileLayers = sampleWorldTileLayers(tileX, tileY, "alpha-seed");

      return {
        modifierKind: tileLayers.modifierKind,
        obstacleKind: tileLayers.obstacleKind,
        tileX,
        tileY
      };
    });
    const obstacleTiles = featureTiles.filter((tile) => tile.obstacleKind === "solid");
    const modifierTiles = featureTiles.filter((tile) => tile.modifierKind !== "normal");
    const obstacleTileKeys = new Set(obstacleTiles.map((tile) => `${tile.tileX}:${tile.tileY}`));
    const modifierTileKeys = new Set(modifierTiles.map((tile) => `${tile.tileX}:${tile.tileY}`));
    const countTilesWithOrthogonalNeighbor = (
      tiles: typeof featureTiles,
      keySet: Set<string>
    ) =>
      tiles.filter((tile) =>
        [
          `${tile.tileX + 1}:${tile.tileY}`,
          `${tile.tileX - 1}:${tile.tileY}`,
          `${tile.tileX}:${tile.tileY + 1}`,
          `${tile.tileX}:${tile.tileY - 1}`
        ].some((neighborKey) => keySet.has(neighborKey))
      ).length;

    expect(obstacleTiles.length).toBeGreaterThan(0);
    expect(obstacleTiles.length).toBeLessThan(220);
    expect(modifierTiles.length).toBeGreaterThan(0);
    expect(modifierTiles.length).toBeLessThan(280);
    expect(countTilesWithOrthogonalNeighbor(obstacleTiles, obstacleTileKeys)).toBeGreaterThan(
      Math.floor(obstacleTiles.length * 0.5)
    );
    expect(countTilesWithOrthogonalNeighbor(modifierTiles, modifierTileKeys)).toBeGreaterThan(
      Math.floor(modifierTiles.length * 0.5)
    );
  });
});
