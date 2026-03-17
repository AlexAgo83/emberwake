import { singleEntityControlContract } from "./singleEntityControlContract";
import { resolveVirtualStickState } from "./virtualStickMath";

describe("virtualStickMath", () => {
  it("keeps the stick idle inside the dead zone", () => {
    const state = resolveVirtualStickState(
      { x: 100, y: 100 },
      { x: 110, y: 110 }
    );

    expect(state.movementIntent).toEqual({
      isActive: false,
      magnitude: 0,
      source: "touch",
      vector: {
        x: 0,
        y: 0
      }
    });
  });

  it("clamps the knob position while keeping a normalized direction", () => {
    const state = resolveVirtualStickState(
      { x: 100, y: 100 },
      { x: 300, y: 100 }
    );

    expect(state.knobPosition).toEqual({
      x: 100 + singleEntityControlContract.virtualStick.maxRadiusPixels,
      y: 100
    });
    expect(state.movementIntent.isActive).toBe(true);
    expect(state.movementIntent.magnitude).toBe(1);
    expect(state.movementIntent.vector).toEqual({
      x: 1,
      y: 0
    });
  });

  it("scales magnitude proportionally beyond the dead zone", () => {
    const currentX =
      100 +
      singleEntityControlContract.virtualStick.deadZonePixels +
      (singleEntityControlContract.virtualStick.maxRadiusPixels -
        singleEntityControlContract.virtualStick.deadZonePixels) /
        2;
    const state = resolveVirtualStickState(
      { x: 100, y: 100 },
      { x: currentX, y: 100 }
    );

    expect(state.movementIntent.isActive).toBe(true);
    expect(state.movementIntent.magnitude).toBeCloseTo(0.5);
    expect(state.movementIntent.vector).toEqual({
      x: 1,
      y: 0
    });
  });
});
