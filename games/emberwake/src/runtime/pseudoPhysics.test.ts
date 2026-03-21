import { describe, expect, it } from "vitest";

import { resolvePseudoPhysicalMovement } from "./pseudoPhysics";

describe("pseudoPhysics", () => {
  it("blocks movement on a blocked axis while preserving sliding on the free axis", () => {
    const result = resolvePseudoPhysicalMovement({
      currentPosition: { x: 0, y: 0 },
      currentVelocity: { x: 0, y: 0 },
      desiredVelocity: { x: 120, y: 120 },
      footprintRadius: 12,
      isBlockedAtPosition: (worldPosition) => worldPosition.x > 0,
      stepSeconds: 1 / 60,
      surfaceModifierKind: "normal"
    });

    expect(result.worldPosition.x).toBe(0);
    expect(result.worldPosition.y).toBeGreaterThan(0);
    expect(result.velocity.x).toBe(0);
    expect(result.velocity.y).toBeGreaterThan(0);
  });

  it("separates the moving entity from static colliders without requiring rigid-body response", () => {
    const result = resolvePseudoPhysicalMovement({
      currentPosition: { x: 0, y: 0 },
      currentVelocity: { x: 0, y: 0 },
      desiredVelocity: { x: 0, y: 0 },
      footprintRadius: 24,
      isBlockedAtPosition: () => false,
      staticColliders: [
        {
          footprint: { radius: 24 },
          id: "entity:test:static",
          worldPosition: { x: 10, y: 0 }
        }
      ],
      stepSeconds: 1 / 60,
      surfaceModifierKind: "normal"
    });

    expect(result.worldPosition.x).toBeLessThan(0);
  });
});
