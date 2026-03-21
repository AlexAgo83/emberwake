import { beforeEach, describe, expect, it } from "vitest";

import {
  readShellPreferences,
  shellPreferencesContract,
  writeShellPreferences
} from "./shellPreferencesStorage";

describe("shellPreferencesStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips shell preferences through local storage", () => {
    const preferences = {
      debugPanelVisible: true,
      inspectionPanelVisible: false,
      lastMetaScene: "settings" as const,
      movementOnboardingDismissed: true,
      prefersFullscreen: true
    };

    writeShellPreferences(preferences);

    expect(
      readShellPreferences({
        debugPanelVisible: false,
        inspectionPanelVisible: false,
        lastMetaScene: "none",
        movementOnboardingDismissed: false,
        prefersFullscreen: false
      })
    ).toEqual(preferences);
  });

  it("invalidates stored shell preferences on version mismatch", () => {
    const fallbackPreferences = {
      debugPanelVisible: false,
      inspectionPanelVisible: false,
      lastMetaScene: "none" as const,
      movementOnboardingDismissed: false,
      prefersFullscreen: false
    };

    window.localStorage.setItem(
      shellPreferencesContract.storageKey,
      JSON.stringify({
        preferences: {
          debugPanelVisible: true,
          prefersFullscreen: true
        },
        version: shellPreferencesContract.storageVersion + 1
      })
    );

    expect(readShellPreferences(fallbackPreferences)).toEqual(fallbackPreferences);
  });
});
