export type ShellPreferences = {
  debugPanelVisible: boolean;
  movementOnboardingDismissed: boolean;
  prefersFullscreen: boolean;
};

const STORAGE_KEY = "emberwake.shell-preferences";
const STORAGE_VERSION = 1;

type PersistedShellPreferences = {
  preferences: ShellPreferences;
  version: number;
};

export const readShellPreferences = (
  fallbackPreferences: ShellPreferences
): ShellPreferences => {
  if (typeof window === "undefined") {
    return fallbackPreferences;
  }

  const rawPreferences = window.localStorage.getItem(STORAGE_KEY);
  if (!rawPreferences) {
    return fallbackPreferences;
  }

  try {
    const parsedPreferences = JSON.parse(rawPreferences) as Partial<PersistedShellPreferences>;

    if (parsedPreferences.version !== STORAGE_VERSION || !parsedPreferences.preferences) {
      return fallbackPreferences;
    }

    return {
      ...fallbackPreferences,
      ...parsedPreferences.preferences
    };
  } catch {
    return fallbackPreferences;
  }
};

export const writeShellPreferences = (preferences: ShellPreferences) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      preferences,
      version: STORAGE_VERSION
    } satisfies PersistedShellPreferences)
  );
};
