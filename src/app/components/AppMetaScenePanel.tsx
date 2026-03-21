import { memo } from "react";

import type { AppSceneId, RuntimeShellOutcome } from "../model/appScene";

type AppMetaScenePanelProps = {
  fullscreenPreferred: boolean;
  onResumeRuntime: () => void;
  runtimeOutcome?: RuntimeShellOutcome | null;
  scene: AppSceneId;
};

export const AppMetaScenePanel = memo(function AppMetaScenePanel({
  fullscreenPreferred,
  onResumeRuntime,
  runtimeOutcome,
  scene
}: AppMetaScenePanelProps) {
  if (scene !== "pause" && scene !== "settings" && scene !== "defeat" && scene !== "victory") {
    return null;
  }

  const title =
    scene === "pause"
      ? "Runtime paused"
      : scene === "settings"
        ? "Settings"
        : scene === "defeat"
          ? "Runtime interrupted"
          : "Victory";
  const detail =
    scene === "pause"
      ? "The shell owns the pause scene and holds the runtime while the player is outside the live loop."
      : scene === "settings"
        ? "Settings stay shell-owned. Returning to runtime resumes the live loop without rebuilding gameplay state."
        : runtimeOutcome?.detail ??
          (scene === "defeat"
            ? "The shell has taken ownership after a gameplay outcome requested recovery or restart."
            : "The shell presents the gameplay outcome without reading arbitrary runtime internals.");
  const resumeLabel =
    scene === "defeat" ? "Restart runtime" : scene === "victory" ? "Continue runtime" : "Resume runtime";
  const ownershipLabel =
    scene === "defeat" || scene === "victory"
      ? `Shell scene / gameplay outcome ${runtimeOutcome?.kind ?? scene}`
      : "Shell scene / runtime state preserved";

  return (
    <aside className="app-meta-scene" aria-label={title}>
      <p className="app-meta-scene__eyebrow">Meta flow</p>
      <h2 className="app-meta-scene__title">{title}</h2>
      <p className="app-meta-scene__detail">{detail}</p>
      <dl className="app-meta-scene__facts">
        <div>
          <dt>Runtime re-entry</dt>
          <dd>Resume current session</dd>
        </div>
        <div>
          <dt>Fullscreen preference</dt>
          <dd>{fullscreenPreferred ? "remembered" : "off"}</dd>
        </div>
        <div>
          <dt>Ownership</dt>
          <dd>{ownershipLabel}</dd>
        </div>
      </dl>
      <button
        className="shell-control shell-control--button"
        onClick={onResumeRuntime}
        type="button"
      >
        {resumeLabel}
      </button>
    </aside>
  );
});
