import { describe, expect, it } from "vitest";

import { createGenericMoverEntity } from "./entityContract";
import { detectEntityOverlaps, entityOccupancyContract } from "./entityOccupancy";

describe("entityOccupancy", () => {
  it("defines a continuous world-space occupancy baseline", () => {
    expect(entityOccupancyContract.footprintModel).toBe("circle-radius");
    expect(entityOccupancyContract.worldModel.coordinates).toBe("continuous-2d");
    expect(entityOccupancyContract.earlyTraversal.overlapPolicy).toBe("tolerated-and-diagnosed");
  });

  it("detects overlaps without blocking movement", () => {
    const leftEntity = createGenericMoverEntity({
      id: "entity:test:left",
      worldPosition: { x: 0, y: 0 }
    });
    const rightEntity = createGenericMoverEntity({
      id: "entity:test:right",
      worldPosition: { x: 20, y: 0 }
    });

    const overlaps = detectEntityOverlaps([leftEntity, rightEntity]);

    expect(overlaps).toHaveLength(1);
    expect(overlaps[0]?.entityIds).toEqual(["entity:test:left", "entity:test:right"]);
    expect(overlaps[0]?.penetrationDepth).toBeGreaterThan(0);
  });
});
