import { describe, expect, it } from "vitest";

import {
  areDesktopControlBindingsEqual,
  assignDesktopControlBinding,
  createDesktopControlConflictSet,
  describeDesktopMovementBindings,
  formatDesktopControlBindingKey,
  validateDesktopControlBindingKey
} from "./desktopControlBindings";
import { createDefaultDesktopControlBindings } from "../../game/input/model/singleEntityControlContract";

describe("desktopControlBindings", () => {
  it("validates supported and unsupported capture keys", () => {
    expect(validateDesktopControlBindingKey("W")).toEqual({
      error: null,
      normalizedKey: "w"
    });
    expect(validateDesktopControlBindingKey("ArrowUp")).toEqual({
      error: null,
      normalizedKey: "ArrowUp"
    });
    expect(validateDesktopControlBindingKey("Shift").error).toMatch(/modifier/i);
  });

  it("detects duplicate bindings across movement slots", () => {
    const conflictingBindings = assignDesktopControlBinding({
      bindings: createDefaultDesktopControlBindings(),
      direction: "up",
      key: "a",
      slotIndex: 0
    });

    expect(createDesktopControlConflictSet(conflictingBindings)).toEqual(
      new Set(["left:0", "up:0"])
    );
  });

  it("formats and describes the current movement binding summary", () => {
    expect(formatDesktopControlBindingKey("ArrowLeft")).toBe("Arrow Left");
    expect(describeDesktopMovementBindings(createDefaultDesktopControlBindings())).toBe(
      "WASD / arrows"
    );

    const customBindings = assignDesktopControlBinding({
      bindings: createDefaultDesktopControlBindings(),
      direction: "up",
      key: "i",
      slotIndex: 0
    });

    expect(areDesktopControlBindingsEqual(customBindings, createDefaultDesktopControlBindings())).toBe(
      false
    );
    expect(describeDesktopMovementBindings(customBindings)).toBe("IASD / arrows");
  });
});
