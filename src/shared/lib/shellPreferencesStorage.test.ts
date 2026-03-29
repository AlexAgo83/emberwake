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
      biomeSeamsVisible: true,
      debugPanelVisible: true,
      entityRingsVisible: false,
      inspectionPanelVisible: false,
      lastMetaScene: "settings" as const,
      movementOnboardingDismissed: true,
      prefersFullscreen: true,
      runtimeFeedbackVisible: false
    };

    writeShellPreferences(preferences);

    expect(
      readShellPreferences({
        biomeSeamsVisible: false,
        debugPanelVisible: false,
        entityRingsVisible: false,
        inspectionPanelVisible: false,
        lastMetaScene: "none",
        movementOnboardingDismissed: false,
        prefersFullscreen: false,
        runtimeFeedbackVisible: true
      })
    ).toEqual(preferences);
  });

  it("invalidates stored shell preferences on version mismatch", () => {
    const fallbackPreferences = {
      biomeSeamsVisible: false,
      debugPanelVisible: false,
      entityRingsVisible: false,
      inspectionPanelVisible: false,
      lastMetaScene: "none" as const,
      movementOnboardingDismissed: false,
      prefersFullscreen: false,
      runtimeFeedbackVisible: true
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
