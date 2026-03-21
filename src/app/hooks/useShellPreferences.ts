import { useCallback, useEffect, useState } from "react";

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

  const setDebugPanelVisible = useCallback((debugPanelVisible: boolean) => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      debugPanelVisible
    }));
  }, []);
  const setInspectionPanelVisible = useCallback((inspectionPanelVisible: boolean) => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      inspectionPanelVisible
    }));
  }, []);
  const setLastMetaScene = useCallback((lastMetaScene: ShellPreferences["lastMetaScene"]) => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      lastMetaScene
    }));
  }, []);
  const setPrefersFullscreen = useCallback((prefersFullscreen: boolean) => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      prefersFullscreen
    }));
  }, []);
  const setMovementOnboardingDismissed = useCallback((movementOnboardingDismissed: boolean) => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      movementOnboardingDismissed
    }));
  }, []);

  return {
    preferences,
    setDebugPanelVisible,
    setInspectionPanelVisible,
    setLastMetaScene,
    setPrefersFullscreen,
    setMovementOnboardingDismissed
  };
}
