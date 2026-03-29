import { lazy, Suspense } from "react";

import type { DesktopControlBindings } from "../../game/input/model/singleEntityControlContract";
import "./SettingsSceneContent.css";

export type SettingsView = "desktop-controls" | "graphics" | "menu";

type SettingsSceneContentProps = {
  desktopControlBindings: DesktopControlBindings;
  entityRingsVisible: boolean;
  isMobileLayout: boolean;
  onApplyDesktopControlBindings: (bindings: DesktopControlBindings) => void;
  onSetEntityRingsVisible: (visible: boolean) => void;
  onSetSettingsView: (view: SettingsView) => void;
  settingsView: SettingsView;
};

const LazyDesktopControlSettingsSection = lazy(async () => {
  const module = await import("./DesktopControlSettingsSection");

  return {
    default: module.DesktopControlSettingsSection
  };
});

export default function SettingsSceneContent({
  desktopControlBindings,
  entityRingsVisible,
  isMobileLayout,
  onApplyDesktopControlBindings,
  onSetEntityRingsVisible,
  onSetSettingsView,
  settingsView
}: SettingsSceneContentProps) {
  return (
    <div className="app-meta-scene__scene-body app-meta-scene__scene-body--settings">
      {settingsView === "menu" ? (
        <div className="app-meta-scene__settings-grid">
          <article className="app-meta-scene__settings-card">
            <div className="app-meta-scene__settings-card-copy">
              <div className="app-meta-scene__settings-card-header">
                <h3 className="app-meta-scene__settings-card-title">Desktop controls</h3>
                <span className="app-meta-scene__settings-card-tag">
                  {isMobileLayout ? "Desktop only" : "Keyboard"}
                </span>
              </div>
              <p className="app-meta-scene__settings-card-detail">
                Remap the large-screen movement bindings used by the player entity.
              </p>
            </div>
            <button
              className="shell-control shell-control--button"
              disabled={isMobileLayout}
              onClick={() => {
                onSetSettingsView("desktop-controls");
              }}
              type="button"
            >
              Desktop controls
            </button>
            {isMobileLayout ? (
              <p className="app-meta-scene__settings-card-note">
                Desktop control calibration is only exposed on large-screen shell layouts.
              </p>
            ) : null}
          </article>

          <article className="app-meta-scene__settings-card">
            <div className="app-meta-scene__settings-card-copy">
              <div className="app-meta-scene__settings-card-header">
                <h3 className="app-meta-scene__settings-card-title">Graphics</h3>
                <span className="app-meta-scene__settings-card-tag">
                  {entityRingsVisible ? "Entity rings on" : "Entity rings off"}
                </span>
              </div>
              <p className="app-meta-scene__settings-card-detail">
                Tune player-facing runtime presentation helpers such as entity rings and pickup outlines.
              </p>
            </div>
            <button
              className="shell-control shell-control--button"
              onClick={() => {
                onSetSettingsView("graphics");
              }}
              type="button"
            >
              Graphics
            </button>
          </article>
        </div>
      ) : settingsView === "desktop-controls" ? (
        isMobileLayout ? (
          <div className="app-meta-scene__subsurface app-meta-scene__subsurface--settings">
            <p className="app-meta-scene__lead">
              Desktop control calibration is only exposed on large-screen shell layouts.
            </p>
          </div>
        ) : (
          <Suspense
            fallback={
              <p className="settings-controls__status">Loading desktop control bindings…</p>
            }
          >
            <LazyDesktopControlSettingsSection
              bindings={desktopControlBindings}
              onApply={onApplyDesktopControlBindings}
            />
          </Suspense>
        )
      ) : (
        <div className="app-meta-scene__subsurface app-meta-scene__subsurface--settings app-meta-scene__settings-panel">
          <div className="app-meta-scene__settings-panel-copy">
            <p className="app-meta-scene__lead">
              Control whether sprite-backed entities and pickups keep their runtime rings and readability halos.
            </p>
            <p className="app-meta-scene__settings-card-note">
              Applies to sprite-backed player, hostile, and pickup ring treatment. It does not change combat arcs,
              bars, or pickup gameplay.
            </p>
          </div>
          <div className="app-meta-scene__settings-toggle-row">
            <span className="app-meta-scene__settings-toggle-label">Entity rings</span>
            <button
              aria-pressed={entityRingsVisible}
              className="shell-control shell-control--button"
              onClick={() => {
                onSetEntityRingsVisible(!entityRingsVisible);
              }}
              type="button"
            >
              {entityRingsVisible ? "Disable entity rings" : "Enable entity rings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
