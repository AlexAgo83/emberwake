import { useCallback, useMemo, useState } from "react";

import {
  appSceneContract,
  deriveAppSceneId
} from "../model/appScene";
import type {
  AppSceneId,
  AppShellSurfaceId,
  RendererLifecycleStatus
} from "../model/appScene";

type UseAppSceneOptions = {
  rendererStatus: RendererLifecycleStatus;
};

export function useAppScene({ rendererStatus }: UseAppSceneOptions) {
  const [requestedScene, setRequestedScene] = useState<AppSceneId>(appSceneContract.initialScene);
  const [shellSurface, setShellSurface] = useState<AppShellSurfaceId>("none");

  const activeScene = useMemo(
    () => deriveAppSceneId({ rendererStatus, requestedScene }),
    [rendererStatus, requestedScene]
  );
  const closeShellSurface = useCallback(() => {
    setShellSurface("none");
  }, []);
  const openMenu = useCallback(() => {
    setShellSurface("menu");
  }, []);
  const resumeRuntime = useCallback(() => {
    setRequestedScene("runtime");
    setShellSurface("none");
  }, []);
  const showPauseScene = useCallback(() => {
    setRequestedScene("pause");
    setShellSurface("none");
  }, []);
  const showSettingsScene = useCallback(() => {
    setRequestedScene("settings");
    setShellSurface("none");
  }, []);

  return {
    activeScene,
    canRenderRuntime: activeScene !== "failure",
    closeShellSurface,
    isMenuOpen: shellSurface === "menu",
    openMenu,
    requestedScene,
    resumeRuntime,
    shellSurface,
    showPauseScene,
    showSettingsScene
  };
}
