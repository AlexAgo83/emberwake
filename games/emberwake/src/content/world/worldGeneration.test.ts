import { describe, expect, it } from "vitest";

import { createGeneratedChunk, sampleWorldTileLayers } from "./worldGeneration";

describe("worldGeneration", () => {
  it("keeps world tile sampling deterministic", () => {
    const firstSample = sampleWorldTileLayers(18, -11, "emberwake:test-seed");
    const secondSample = sampleWorldTileLayers(18, -11, "emberwake:test-seed");

    expect(secondSample).toEqual(firstSample);
  });

  it("produces contiguous terrain adjacency inside generated chunks", () => {
    const generatedChunk = createGeneratedChunk({ x: 2, y: -1 }, "emberwake:terrain-clusters");
    let adjacencyPairs = 0;

    for (const terrainTile of generatedChunk.terrainLayer) {
      const rightNeighbor = generatedChunk.terrainLayer.find(
        (candidate) =>
          candidate.tileX === terrainTile.tileX + 1 &&
          candidate.tileY === terrainTile.tileY &&
          candidate.terrainKind === terrainTile.terrainKind
      );
      const bottomNeighbor = generatedChunk.terrainLayer.find(
        (candidate) =>
          candidate.tileX === terrainTile.tileX &&
          candidate.tileY === terrainTile.tileY + 1 &&
          candidate.terrainKind === terrainTile.terrainKind
      );

      if (rightNeighbor) {
        adjacencyPairs += 1;
      }

      if (bottomNeighbor) {
        adjacencyPairs += 1;
      }
    }

    expect(adjacencyPairs).toBeGreaterThan(24);
  });
});
