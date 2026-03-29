import { lazy, Suspense } from "react";

import type { DesktopControlBindings } from "../../game/input/model/singleEntityControlContract";
import "./SettingsSceneContent.css";

export type SettingsView = "desktop-controls" | "graphics" | "menu";

type SettingsSceneContentProps = {
  biomeSeamsVisible: boolean;
  desktopControlBindings: DesktopControlBindings;
  entityRingsVisible: boolean;
  isMobileLayout: boolean;
  onApplyDesktopControlBindings: (bindings: DesktopControlBindings) => void;
  onSetBiomeSeamsVisible: (visible: boolean) => void;
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
  biomeSeamsVisible,
  desktopControlBindings,
  entityRingsVisible,
  isMobileLayout,
  onApplyDesktopControlBindings,
  onSetBiomeSeamsVisible,
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
                <h3 className="app-meta-scene__settings-card-title">Controls</h3>
                <span className="app-meta-scene__settings-card-tag">
                  {isMobileLayout ? "Desktop only" : "Keyboard"}
                </span>
              </div>
              <p className="app-meta-scene__settings-card-detail">
                Input options and desktop calibration.
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
              Controls
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
                <h3 className="app-meta-scene__settings-card-title">Display</h3>
                <span className="app-meta-scene__settings-card-tag">
                  {entityRingsVisible || biomeSeamsVisible ? "Helpers on" : "Helpers off"}
                </span>
              </div>
              <p className="app-meta-scene__settings-card-detail">
                Optional runtime display helpers.
              </p>
            </div>
            <button
              className="shell-control shell-control--button"
              onClick={() => {
                onSetSettingsView("graphics");
              }}
              type="button"
            >
              Display
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
              Optional display helpers only.
            </p>
            <p className="app-meta-scene__settings-card-note">
              No gameplay changes.
            </p>
          </div>
          <div className="app-meta-scene__settings-toggle-row">
            <span className="app-meta-scene__settings-toggle-label">Debug circles</span>
            <button
              aria-pressed={entityRingsVisible}
              className="shell-control shell-control--button"
              onClick={() => {
                onSetEntityRingsVisible(!entityRingsVisible);
              }}
              type="button"
            >
              {entityRingsVisible ? "Disable debug circles" : "Enable debug circles"}
            </button>
          </div>
          <div className="app-meta-scene__settings-toggle-row">
            <span className="app-meta-scene__settings-toggle-label">Biome transitions</span>
            <button
              aria-pressed={biomeSeamsVisible}
              className="shell-control shell-control--button"
              onClick={() => {
                onSetBiomeSeamsVisible(!biomeSeamsVisible);
              }}
              type="button"
            >
              {biomeSeamsVisible ? "Disable biome transitions" : "Enable biome transitions"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
