import { describe, expect, it } from "vitest";

import { systemTuning } from "./systemTuning";

describe("systemTuning", () => {
  it("derives viewport, runtime presentation, and pathfinding values from authored JSON", () => {
    expect(systemTuning.viewport.mobileWidth).toBe(900);
    expect(systemTuning.runtimePresentation.hitReactionVisibleTicks).toBe(10);
    expect(systemTuning.hostilePathfinding.waypointAdvanceDistanceWorldUnits).toBeGreaterThan(0);
  });
});
