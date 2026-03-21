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
});
