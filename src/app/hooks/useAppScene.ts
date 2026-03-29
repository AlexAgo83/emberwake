import { useCallback, useMemo, useState } from "react";

import {
  appSceneContract,
  deriveAppSceneId
} from "../model/appScene";
import type {
  AppSceneId,
  AppShellSurfaceId,
  RendererLifecycleStatus,
  RuntimeShellOutcome
} from "../model/appScene";

type UseAppSceneOptions = {
  rendererStatus: RendererLifecycleStatus;
  runtimeOutcome?: RuntimeShellOutcome | null;
};

export function useAppScene({ rendererStatus, runtimeOutcome }: UseAppSceneOptions) {
  const [requestedScene, setRequestedScene] = useState<AppSceneId>(appSceneContract.initialScene);
  const [shellSurface, setShellSurface] = useState<AppShellSurfaceId>("none");

  const activeScene = useMemo(
    () => deriveAppSceneId({ rendererStatus, runtimeOutcome, requestedScene }),
    [rendererStatus, requestedScene, runtimeOutcome]
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
  const showMainMenuScene = useCallback(() => {
    setRequestedScene("main-menu");
    setShellSurface("none");
  }, []);
  const showNewGameScene = useCallback(() => {
    setRequestedScene("new-game");
    setShellSurface("none");
  }, []);
  const showChangelogsScene = useCallback(() => {
    setRequestedScene("changelogs");
    setShellSurface("none");
  }, []);
  const showGrowthScene = useCallback(() => {
    setRequestedScene("growth");
    setShellSurface("none");
  }, []);
  const showGrimoireScene = useCallback(() => {
    setRequestedScene("grimoire");
    setShellSurface("none");
  }, []);
  const showBestiaryScene = useCallback(() => {
    setRequestedScene("bestiary");
    setShellSurface("none");
  }, []);
  const showLootArchiveScene = useCallback(() => {
    setRequestedScene("loot-archive");
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
    runtimeOutcome,
    showBestiaryScene,
    showLootArchiveScene,
    shellSurface,
    showChangelogsScene,
    showGrowthScene,
    showGrimoireScene,
    showMainMenuScene,
    showNewGameScene,
    showPauseScene,
    showSettingsScene
  };
}
