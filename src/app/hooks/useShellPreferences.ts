import { useEffect, useState } from "react";

import {
  readShellPreferences,
  writeShellPreferences
} from "../../shared/lib/shellPreferencesStorage";
import type { ShellPreferences } from "../../shared/lib/shellPreferencesStorage";

type UseShellPreferencesOptions = {
  defaultDebugPanelVisible: boolean;
};

export function useShellPreferences({
  defaultDebugPanelVisible
}: UseShellPreferencesOptions) {
  const [preferences, setPreferences] = useState<ShellPreferences>(() =>
    readShellPreferences({
      debugPanelVisible: defaultDebugPanelVisible,
      inspectionPanelVisible: false,
      lastMetaScene: "none",
      movementOnboardingDismissed: false,
      prefersFullscreen: false
    })
  );

  useEffect(() => {
    writeShellPreferences(preferences);
  }, [preferences]);

  return {
    preferences,
    setDebugPanelVisible: (debugPanelVisible: boolean) => {
      setPreferences((currentPreferences) => ({
        ...currentPreferences,
        debugPanelVisible
      }));
    },
    setInspectionPanelVisible: (inspectionPanelVisible: boolean) => {
      setPreferences((currentPreferences) => ({
        ...currentPreferences,
        inspectionPanelVisible
      }));
    },
    setLastMetaScene: (lastMetaScene: ShellPreferences["lastMetaScene"]) => {
      setPreferences((currentPreferences) => ({
        ...currentPreferences,
        lastMetaScene
      }));
    },
    setPrefersFullscreen: (prefersFullscreen: boolean) => {
      setPreferences((currentPreferences) => ({
        ...currentPreferences,
        prefersFullscreen
      }));
    },
    setMovementOnboardingDismissed: (movementOnboardingDismissed: boolean) => {
      setPreferences((currentPreferences) => ({
        ...currentPreferences,
        movementOnboardingDismissed
      }));
    }
  };
}
