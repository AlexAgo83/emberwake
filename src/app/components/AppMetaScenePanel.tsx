import { memo } from "react";

import type { AppSceneId } from "../model/appScene";

type AppMetaScenePanelProps = {
  fullscreenPreferred: boolean;
  onResumeRuntime: () => void;
  scene: AppSceneId;
};

export const AppMetaScenePanel = memo(function AppMetaScenePanel({
  fullscreenPreferred,
  onResumeRuntime,
  scene
}: AppMetaScenePanelProps) {
  if (scene !== "pause" && scene !== "settings") {
    return null;
  }

  const title = scene === "pause" ? "Runtime paused" : "Settings";
  const detail =
    scene === "pause"
      ? "The shell owns the pause scene and holds the runtime while the player is outside the live loop."
      : "Settings stay shell-owned. Returning to runtime resumes the live loop without rebuilding gameplay state.";

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
          <dd>Shell scene / runtime state preserved</dd>
        </div>
      </dl>
      <button
        className="shell-control shell-control--button"
        onClick={onResumeRuntime}
        type="button"
      >
        Resume runtime
      </button>
    </aside>
  );
});
