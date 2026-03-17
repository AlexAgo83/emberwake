import { useRef } from "react";

import { FullscreenToggleButton } from "./components/FullscreenToggleButton";
import { useDocumentViewportLock } from "./hooks/useDocumentViewportLock";
import { useFullscreenController } from "./hooks/useFullscreenController";
import { useLogicalViewportModel } from "./hooks/useLogicalViewportModel";
import { useRendererHealth } from "./hooks/useRendererHealth";
import { useShellPreferences } from "./hooks/useShellPreferences";
import { useRuntimeInteractionGuards } from "./hooks/useRuntimeInteractionGuards";
import { ShellDiagnosticsPanel } from "../game/debug/ShellDiagnosticsPanel";
import { useDebugPanelHotkey } from "../game/debug/hooks/useDebugPanelHotkey";
import { RuntimeSurface } from "../game/render/RuntimeSurface";
import {
  chunkWorldSize,
  sampleChunkDebugSignature,
  worldContract
} from "../game/world/model/worldContract";
import { appConfig } from "../shared/config/appConfig";
import { runtimeContract } from "../shared/constants/runtimeContract";

export function AppShell() {
  const shellRef = useRef<HTMLElement>(null);
  const runtimeSurfaceRef = useRef<HTMLDivElement>(null);
  useDocumentViewportLock();
  useRuntimeInteractionGuards(runtimeSurfaceRef);
  const { enterFullscreen, isFullscreen, isSupported, lastError } =
    useFullscreenController(shellRef);
  const viewport = useLogicalViewportModel(shellRef);
  const { markFailed, markReady, rendererState } = useRendererHealth();
  const { preferences, setDebugPanelVisible, setPrefersFullscreen } = useShellPreferences({
    defaultDebugPanelVisible: appConfig.debugOverlayEnabled && appConfig.diagnosticsEnabled
  });
  useDebugPanelHotkey({
    enabled: appConfig.diagnosticsEnabled,
    onToggle: () => {
      setDebugPanelVisible(!preferences.debugPanelVisible);
    }
  });
  const diagnosticsVisible = appConfig.diagnosticsEnabled && preferences.debugPanelVisible;
  const handleEnterFullscreen = async () => {
    setPrefersFullscreen(true);
    await enterFullscreen();
  };

  return (
    <main
      className="app-shell"
      data-app-ready="true"
      data-layout-mode={viewport.layoutMode}
      ref={shellRef}
    >
      <section className="app-shell__runtime" aria-label="Interactive runtime shell">
        <RuntimeSurface
          onRendererError={markFailed}
          onRendererReady={markReady}
          surfaceRef={runtimeSurfaceRef}
        />
      </section>

      <section className="app-shell__overlay" aria-label="Shell status overlay">
        <header className="shell-topbar">
          <span className="shell-topbar__mode">Fullscreen-first shell</span>
          {appConfig.diagnosticsEnabled ? (
            <button
              className="shell-control shell-control--button"
              onClick={() => {
                setDebugPanelVisible(!preferences.debugPanelVisible);
              }}
              type="button"
            >
              {preferences.debugPanelVisible ? "Hide diagnostics" : "Show diagnostics"}
            </button>
          ) : null}
          <FullscreenToggleButton
            isFullscreen={isFullscreen}
            isSupported={isSupported}
            onEnterFullscreen={handleEnterFullscreen}
          />
        </header>

        <div className="shell-identity">
          <p className="shell-identity__eyebrow">Static runtime foundation</p>
          <h1>{appConfig.name}</h1>
          <p className="shell-identity__body">
            React owns the shell, Pixi owns the world surface, and the first playable loop
            will land on top of this fullscreen-ready scaffold.
          </p>
        </div>

        <dl className="shell-status">
          <div>
            <dt>Renderer</dt>
            <dd>PixiJS via @pixi/react</dd>
          </div>
          <div>
            <dt>Runtime</dt>
            <dd>Static PWA shell</dd>
          </div>
          <div>
            <dt>Target</dt>
            <dd>{appConfig.logicalWidth}px logical width baseline</dd>
          </div>
          <div>
            <dt>Layout mode</dt>
            <dd>{viewport.layoutMode}</dd>
          </div>
          <div>
            <dt>Fit scale</dt>
            <dd>{viewport.fitScale.toFixed(3)}x</dd>
          </div>
          <div>
            <dt>Visible world</dt>
            <dd>
              {Math.round(viewport.visibleWorldSize.width)} ×{" "}
              {Math.round(viewport.visibleWorldSize.height)}
            </dd>
          </div>
          <div>
            <dt>Spaces</dt>
            <dd>{viewport.spaces.join(" / ")}</dd>
          </div>
          <div>
            <dt>World posture</dt>
            <dd>{runtimeContract.worldAssumption}</dd>
          </div>
          <div>
            <dt>World seed</dt>
            <dd>{worldContract.defaultSeed}</dd>
          </div>
          <div>
            <dt>Chunk baseline</dt>
            <dd>
              {worldContract.chunkSizeInTiles}x{worldContract.chunkSizeInTiles} / {chunkWorldSize}wu
            </dd>
          </div>
          <div>
            <dt>Chunk signature</dt>
            <dd>{sampleChunkDebugSignature({ x: 0, y: 0 })}</dd>
          </div>
          <div>
            <dt>Shell perf floor</dt>
            <dd>{viewport.performanceBudget.frameRateFloor}+ FPS target</dd>
          </div>
          <div>
            <dt>Input ownership</dt>
            <dd>Scroll, selection, and drag guarded by shell</dd>
          </div>
          <div>
            <dt>Renderer health</dt>
            <dd>{rendererState.status}</dd>
          </div>
        </dl>

        <ShellDiagnosticsPanel
          fullscreen={{
            isFullscreen,
            isSupported,
            lastError
          }}
          preferences={preferences}
          renderer={rendererState}
          viewport={viewport}
          visible={diagnosticsVisible}
        />
      </section>
    </main>
  );
}
