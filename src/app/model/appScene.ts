export type RendererLifecycleStatus = "degraded" | "failed" | "initializing" | "ready";

export type AppSceneId = "boot" | "failure" | "pause" | "runtime" | "settings";

export type AppShellSurfaceId = "menu" | "none";

export const appSceneContract = {
  initialScene: "runtime",
  metaScenes: ["pause", "settings"],
  shellOwnedSurfaces: ["menu"],
  terminalScenes: ["failure"]
} as const satisfies {
  initialScene: AppSceneId;
  metaScenes: readonly AppSceneId[];
  shellOwnedSurfaces: readonly Exclude<AppShellSurfaceId, "none">[];
  terminalScenes: readonly AppSceneId[];
};

export const deriveAppSceneId = ({
  rendererStatus,
  requestedScene
}: {
  rendererStatus: RendererLifecycleStatus;
  requestedScene: AppSceneId;
}): AppSceneId => {
  if (rendererStatus === "failed") {
    return "failure";
  }

  if (rendererStatus === "initializing" && requestedScene === "runtime") {
    return "boot";
  }

  return requestedScene;
};
