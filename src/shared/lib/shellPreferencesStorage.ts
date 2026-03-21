import { persistenceDomainCatalog } from "./persistence/storageDomainCatalog";
import {
  readVersionedStorageDomain,
  writeVersionedStorageDomain
} from "./persistence/storageDomain";

export type ShellPreferences = {
  debugPanelVisible: boolean;
  inspectionPanelVisible: boolean;
  lastMetaScene: "none" | "pause" | "settings";
  movementOnboardingDismissed: boolean;
  prefersFullscreen: boolean;
  runtimeFeedbackVisible: boolean;
};

export const shellPreferencesContract = {
  invalidationPolicy: "drop-on-version-mismatch",
  ...persistenceDomainCatalog.shellPreferences
} as const;

export const readShellPreferences = (
  fallbackPreferences: ShellPreferences
): ShellPreferences =>
  readVersionedStorageDomain({
    contract: persistenceDomainCatalog.shellPreferences,
    fallbackValue: fallbackPreferences,
    merge: (currentFallbackPreferences, persistedPreferences) => ({
      ...currentFallbackPreferences,
      ...persistedPreferences
    }),
    payloadKey: "preferences"
  });

export const writeShellPreferences = (preferences: ShellPreferences) => {
  writeVersionedStorageDomain({
    contract: persistenceDomainCatalog.shellPreferences,
    payload: preferences,
    payloadKey: "preferences"
  });
};
