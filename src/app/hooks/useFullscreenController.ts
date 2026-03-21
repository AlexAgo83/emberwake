import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";

type FullscreenController = {
  enterFullscreen: () => Promise<void>;
  isFullscreen: boolean;
  lastError: string | null;
  isSupported: boolean;
};

const hasFullscreenApi = (element: HTMLElement | null) =>
  typeof document !== "undefined" &&
  typeof document.fullscreenEnabled === "boolean" &&
  document.fullscreenEnabled &&
  element !== null &&
  typeof element.requestFullscreen === "function";

export function useFullscreenController(shellRef: RefObject<HTMLElement | null>): FullscreenController {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === shellRef.current);
    };

    setIsSupported(hasFullscreenApi(shellRef.current));
    handleFullscreenChange();
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [shellRef]);

  const enterFullscreen = useCallback(async () => {
    const shellElement = shellRef.current;
    if (!shellElement || !hasFullscreenApi(shellElement)) {
      return;
    }

    if (document.fullscreenElement === shellElement) {
      return;
    }

    try {
      await shellElement.requestFullscreen();
      setLastError(null);
      setIsFullscreen(document.fullscreenElement === shellElement);
    } catch {
      setLastError("Fullscreen request was rejected by the browser.");
    }
  }, [shellRef]);

  return {
    enterFullscreen,
    isFullscreen,
    lastError,
    isSupported
  };
}
