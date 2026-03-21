import { beforeEach, describe, expect, it } from "vitest";

import {
  desktopControlBindingsContract,
  readDesktopControlBindings,
  writeDesktopControlBindings
} from "./desktopControlBindingsStorage";
import { createDefaultDesktopControlBindings } from "../../game/input/model/singleEntityControlContract";

describe("desktopControlBindingsStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips desktop control bindings through local storage", () => {
    const bindings = createDefaultDesktopControlBindings();
    bindings.up[0] = "i";

    writeDesktopControlBindings(bindings);

    expect(readDesktopControlBindings()).toEqual(bindings);
  });

  it("invalidates stored desktop control bindings on version mismatch", () => {
    const fallbackBindings = createDefaultDesktopControlBindings();

    window.localStorage.setItem(
      desktopControlBindingsContract.storageKey,
      JSON.stringify({
        desktopControlBindings: {
          up: ["i", "ArrowUp"]
        },
        version: desktopControlBindingsContract.storageVersion + 1
      })
    );

    expect(readDesktopControlBindings(fallbackBindings)).toEqual(fallbackBindings);
  });
});
