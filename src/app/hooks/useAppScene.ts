import { useMemo, useState } from "react";

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

  return {
    activeScene,
    canRenderRuntime: activeScene !== "failure",
    closeShellSurface: () => {
      setShellSurface("none");
    },
    isMenuOpen: shellSurface === "menu",
    openMenu: () => {
      setShellSurface("menu");
    },
    requestedScene,
    resumeRuntime: () => {
      setRequestedScene("runtime");
      setShellSurface("none");
    },
    shellSurface,
    showPauseScene: () => {
      setRequestedScene("pause");
      setShellSurface("none");
    },
    showSettingsScene: () => {
      setRequestedScene("settings");
      setShellSurface("none");
    }
  };
}
