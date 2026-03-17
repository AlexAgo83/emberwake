export type ShellPreferences = {
  debugPanelVisible: boolean;
  prefersFullscreen: boolean;
};

const STORAGE_KEY = "emberwake.shell-preferences";

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
    return {
      ...fallbackPreferences,
      ...(JSON.parse(rawPreferences) as Partial<ShellPreferences>)
    };
  } catch {
    return fallbackPreferences;
  }
};

export const writeShellPreferences = (preferences: ShellPreferences) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
};
