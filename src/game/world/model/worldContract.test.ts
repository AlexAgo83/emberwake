import {
  chunkCoordinateToId,
  chunkCoordinateToWorldOrigin,
  chunkWorldSize,
  sampleChunkDebugSignature,
  screenPointToWorldPoint,
  worldContract,
  worldPointToChunkCoordinate,
  worldPointToScreenPoint
} from "./worldContract";

describe("worldContract", () => {
  it("uses a fixed deterministic 16x16 chunk baseline", () => {
    expect(worldContract.chunkSizeInTiles).toBe(16);
    expect(worldContract.tileSizeInWorldUnits).toBe(64);
    expect(chunkWorldSize).toBe(1024);
  });

  it("supports negative and positive world coordinates", () => {
    expect(worldPointToChunkCoordinate({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
    expect(worldPointToChunkCoordinate({ x: 1500, y: -1 })).toEqual({ x: 1, y: -1 });
    expect(worldPointToChunkCoordinate({ x: -1025, y: -2048 })).toEqual({ x: -2, y: -2 });
  });

  it("builds deterministic chunk identities and signatures from seed and coordinates", () => {
    const chunkCoordinate = { x: -3, y: 4 };

    expect(chunkCoordinateToId(chunkCoordinate, "alpha")).toBe("alpha:-3:4");
    expect(sampleChunkDebugSignature(chunkCoordinate, "alpha")).toBe(
      sampleChunkDebugSignature(chunkCoordinate, "alpha")
    );
    expect(sampleChunkDebugSignature(chunkCoordinate, "alpha")).not.toBe(
      sampleChunkDebugSignature(chunkCoordinate, "beta")
    );
  });

  it("round-trips world and screen points through the viewport projection contract", () => {
    const viewport = {
      fitScale: 0.5,
      screenSize: {
        height: 1600,
        width: 900
      },
      worldOrigin: chunkCoordinateToWorldOrigin({ x: 0, y: 0 })
    };

    const worldPoint = { x: 128, y: -256 };
    const screenPoint = worldPointToScreenPoint(worldPoint, viewport);

    expect(screenPointToWorldPoint(screenPoint, viewport)).toEqual(worldPoint);
  });
});
