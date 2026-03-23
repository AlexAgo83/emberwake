export type RendererLifecycleStatus = "degraded" | "failed" | "initializing" | "ready";

export type AppSceneId =
  | "boot"
  | "bestiary"
  | "changelogs"
  | "defeat"
  | "failure"
  | "grimoire"
  | "main-menu"
  | "new-game"
  | "pause"
  | "runtime"
  | "settings"
  | "victory";

export type AppShellSurfaceId = "menu" | "none";

export type RuntimeShellOutcome = {
  detail: string;
  emittedAtTick: number | null;
  kind: "defeat" | "none" | "recovery" | "restart-needed" | "victory";
  phaseId: string | null;
  shellScene: "defeat" | "none" | "pause" | "victory";
  skillPerformanceSummaries: Array<{
    attacksTriggered: number;
    fusionId: string | null;
    hostileDefeats: number;
    label: string;
    totalDamage: number;
    weaponId: string;
  }>;
};

export const appSceneContract = {
  initialScene: "main-menu",
  metaScenes: [
    "main-menu",
    "new-game",
    "changelogs",
    "grimoire",
    "bestiary",
    "pause",
    "settings",
    "defeat",
    "victory"
  ],
  outcomeScenes: ["defeat", "pause", "victory"],
  shellOwnedSurfaces: ["menu"],
  terminalScenes: ["failure", "defeat", "victory"]
} as const satisfies {
  initialScene: AppSceneId;
  metaScenes: readonly AppSceneId[];
  outcomeScenes: readonly AppSceneId[];
  shellOwnedSurfaces: readonly Exclude<AppShellSurfaceId, "none">[];
  terminalScenes: readonly AppSceneId[];
};

export const deriveAppSceneId = ({
  rendererStatus,
  runtimeOutcome,
  requestedScene
}: {
  rendererStatus: RendererLifecycleStatus;
  runtimeOutcome?: RuntimeShellOutcome | null;
  requestedScene: AppSceneId;
}): AppSceneId => {
  if (rendererStatus === "failed") {
    return "failure";
  }

  if (runtimeOutcome && runtimeOutcome.kind !== "none" && runtimeOutcome.shellScene !== "none") {
    return runtimeOutcome.shellScene;
  }

  if (rendererStatus === "initializing" && requestedScene === "runtime") {
    return "boot";
  }

  return requestedScene;
};
