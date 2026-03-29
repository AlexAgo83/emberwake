import { Suspense, lazy } from "react";

import type { CameraState } from "@engine";
import type {
  CombatSkillFeedbackEvent,
  FloatingDamageNumber,
  SimulatedEntity
} from "../../game/entities/model/entitySimulation";
import type { ChunkCoordinate } from "../../game/world/types";
import type { AppSceneId } from "../model/appScene";

const LazyRuntimeSurface = lazy(async () => {
  const runtimeModule = await import("../../game/render/RuntimeSurface");

  return {
    default: runtimeModule.RuntimeSurface
  };
});

type RuntimeSceneBoundaryProps = {
  biomeSeamsVisible: boolean;
  camera: CameraState;
  currentTick: number;
  entityRingsVisible: boolean;
  onOpenSettings?: () => void;
  onRendererError?: (message: string) => void;
  onRendererReady?: () => void;
  onRetryRuntime?: () => void;
  renderSurfaceMode: "diagnostics" | "player";
  onSurfaceElementChange?: (element: HTMLDivElement | null) => void;
  onVisualFrame?: (timestampMs: number) => void;
  rendererMessage: string;
  scene: AppSceneId;
  combatSkillFeedbackEvents: CombatSkillFeedbackEvent[];
  floatingDamageNumbers: FloatingDamageNumber[];
  selectedEntityId: string | null;
  visibleEntities: SimulatedEntity[];
  visibleChunks: ChunkCoordinate[];
  viewport: {
    fitScale: number;
    screenSize: {
      height: number;
      width: number;
    };
  };
  worldSeed: string;
};

function RuntimeStatusCard({
  actions,
  detail,
  title
}: {
  actions?: Array<{
    label: string;
    onPress: () => void;
  }>;
  detail: string;
  title: string;
}) {
  return (
    <div className="runtime-scene-status" role="status" aria-live="polite">
      <p className="runtime-scene-status__eyebrow">Runtime</p>
      <h2 className="runtime-scene-status__title">{title}</h2>
      <p className="runtime-scene-status__detail">{detail}</p>
      {actions?.length ? (
        <div className="runtime-scene-status__actions">
          {actions.map((action) => (
            <button
              className="shell-control shell-control--button"
              key={action.label}
              onClick={action.onPress}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function RuntimeSceneBoundary({
  biomeSeamsVisible,
  camera,
  currentTick,
  entityRingsVisible,
  onOpenSettings,
  onRendererError,
  onRendererReady,
  onRetryRuntime,
  renderSurfaceMode,
  onSurfaceElementChange,
  onVisualFrame,
  rendererMessage,
  scene,
  combatSkillFeedbackEvents,
  floatingDamageNumbers,
  selectedEntityId,
  visibleEntities,
  visibleChunks,
  viewport,
  worldSeed
}: RuntimeSceneBoundaryProps) {
  if (scene === "failure") {
    return (
      <RuntimeStatusCard
        actions={[
          ...(onRetryRuntime
            ? [
                {
                  label: "Retry runtime",
                  onPress: onRetryRuntime
                }
              ]
            : []),
          ...(onOpenSettings
            ? [
                {
                  label: "Open settings",
                  onPress: onOpenSettings
                }
              ]
            : [])
        ]}
        detail={rendererMessage}
        title="Runtime unavailable"
      />
    );
  }

  return (
    <div className="runtime-scene-boundary" data-app-scene={scene}>
      <Suspense
        fallback={
          <RuntimeStatusCard
            detail="Loading the Pixi runtime chunk before the scene becomes interactive."
            title="Loading runtime"
          />
        }
      >
        <LazyRuntimeSurface
          biomeSeamsVisible={biomeSeamsVisible}
          camera={camera}
          currentTick={currentTick}
          entityRingsVisible={entityRingsVisible}
          onRendererError={onRendererError}
          onRendererReady={onRendererReady}
          renderSurfaceMode={renderSurfaceMode}
          onSurfaceElementChange={onSurfaceElementChange}
          onVisualFrame={onVisualFrame}
          combatSkillFeedbackEvents={combatSkillFeedbackEvents}
          floatingDamageNumbers={floatingDamageNumbers}
          selectedEntityId={selectedEntityId}
          visibleEntities={visibleEntities}
          visibleChunks={visibleChunks}
          viewport={viewport}
          worldSeed={worldSeed}
        />
      </Suspense>

      {scene === "boot" ? (
        <RuntimeStatusCard
          detail={rendererMessage}
          title="Booting runtime"
        />
      ) : null}
    </div>
  );
}
