import { chunkWorldSize } from "@engine";
import { describe, expect, it } from "vitest";

import { deriveBiomeSeamSegments } from "./biomeSeamPresentation";

describe("biomeSeamPresentation", () => {
  it("creates a vertical seam between neighboring chunks with different primary terrain assets", () => {
    const segments = deriveBiomeSeamSegments([
      {
        chunkCoordinate: { x: 0, y: 0 },
        debugData: {
          baseColor: 0x111111,
          overlayColor: 0x222222,
          primaryTerrainAssetId: "map.terrain.ashfield.runtime"
        },
        origin: { x: 0, y: 0 }
      },
      {
        chunkCoordinate: { x: 1, y: 0 },
        debugData: {
          baseColor: 0x333333,
          overlayColor: 0x444444,
          primaryTerrainAssetId: "map.terrain.glowfen.runtime"
        },
        origin: { x: chunkWorldSize, y: 0 }
      }
    ]);

    expect(segments).toHaveLength(1);
    expect(segments[0]?.orientation).toBe("vertical");
  });

  it("creates a horizontal seam between stacked chunks with different primary terrain assets", () => {
    const segments = deriveBiomeSeamSegments([
      {
        chunkCoordinate: { x: 0, y: 0 },
        debugData: {
          baseColor: 0x111111,
          overlayColor: 0x222222,
          primaryTerrainAssetId: "map.terrain.ashfield.runtime"
        },
        origin: { x: 0, y: 0 }
      },
      {
        chunkCoordinate: { x: 0, y: 1 },
        debugData: {
          baseColor: 0x333333,
          overlayColor: 0x444444,
          primaryTerrainAssetId: "map.terrain.obsidian.runtime"
        },
        origin: { x: 0, y: chunkWorldSize }
      }
    ]);

    expect(segments).toHaveLength(1);
    expect(segments[0]?.orientation).toBe("horizontal");
  });

  it("does not create a seam when adjacent chunks use the same primary terrain asset", () => {
    const segments = deriveBiomeSeamSegments([
      {
        chunkCoordinate: { x: 0, y: 0 },
        debugData: {
          baseColor: 0x111111,
          overlayColor: 0x222222,
          primaryTerrainAssetId: "map.terrain.ashfield.runtime"
        },
        origin: { x: 0, y: 0 }
      },
      {
        chunkCoordinate: { x: 1, y: 0 },
        debugData: {
          baseColor: 0x333333,
          overlayColor: 0x444444,
          primaryTerrainAssetId: "map.terrain.ashfield.runtime"
        },
        origin: { x: chunkWorldSize, y: 0 }
      }
    ]);

    expect(segments).toHaveLength(0);
  });
});
