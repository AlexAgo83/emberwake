import { useEffect } from "react";

type UseDebugPanelHotkeyOptions = {
  enabled: boolean;
  onToggle: () => void;
};

export function useDebugPanelHotkey({ enabled, onToggle }: UseDebugPanelHotkeyOptions) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key !== "`") {
        return;
      }

      event.preventDefault();
      onToggle();
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [enabled, onToggle]);
}
