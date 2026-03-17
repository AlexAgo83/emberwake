import {
  createIdleMovementIntent,
  createKeyboardMovementIntent,
  createMovementIntent,
  singleEntityControlContract
} from "./singleEntityControlContract";

describe("singleEntityControlContract", () => {
  it("creates an idle movement intent by default", () => {
    expect(createIdleMovementIntent()).toEqual({
      isActive: false,
      magnitude: 0,
      source: "none",
      vector: {
        x: 0,
        y: 0
      }
    });
  });

  it("normalizes movement vectors while preserving the input source", () => {
    const movementIntent = createMovementIntent(1, 1, "keyboard");

    expect(movementIntent.isActive).toBe(true);
    expect(movementIntent.source).toBe("keyboard");
    expect(movementIntent.magnitude).toBe(1);
    expect(movementIntent.vector.x).toBeCloseTo(Math.SQRT1_2);
    expect(movementIntent.vector.y).toBeCloseTo(Math.SQRT1_2);
  });

  it("derives keyboard movement from the configured fallback bindings", () => {
    const movementIntent = createKeyboardMovementIntent(
      new Set([
        singleEntityControlContract.keyboardBindings.up[0],
        singleEntityControlContract.keyboardBindings.right[1]
      ])
    );

    expect(movementIntent.isActive).toBe(true);
    expect(movementIntent.source).toBe("keyboard");
    expect(movementIntent.vector.x).toBeCloseTo(Math.SQRT1_2);
    expect(movementIntent.vector.y).toBeCloseTo(-Math.SQRT1_2);
  });

  it("ignores non-movement keys when deriving a keyboard intent", () => {
    const movementIntent = createKeyboardMovementIntent(new Set(["Shift", "q"]));

    expect(movementIntent).toEqual({
      isActive: false,
      magnitude: 0,
      source: "keyboard",
      vector: {
        x: 0,
        y: 0
      }
    });
  });
});
