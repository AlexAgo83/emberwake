import { Suspense, lazy } from "react";
import type { RefObject } from "react";

import type { CameraState } from "@engine/camera/cameraMath";
import type { PresentedEntity } from "../../game/entities/model/entityContract";
import type { SimulatedEntity } from "../../game/entities/model/entitySimulation";
import type { ChunkCoordinate } from "../../game/world/types";
import type { AppSceneId } from "../model/appScene";

const LazyRuntimeSurface = lazy(async () => {
  const runtimeModule = await import("../../game/render/RuntimeSurface");

  return {
    default: runtimeModule.RuntimeSurface
  };
});

type RuntimeSceneBoundaryProps = {
  camera: CameraState;
  onRendererError?: (message: string) => void;
  onRendererReady?: () => void;
  rendererMessage: string;
  scene: AppSceneId;
  surfaceRef?: RefObject<HTMLDivElement | null>;
  visibleEntities: Array<PresentedEntity<SimulatedEntity>>;
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
  detail,
  title
}: {
  detail: string;
  title: string;
}) {
  return (
    <div className="runtime-scene-status" role="status" aria-live="polite">
      <p className="runtime-scene-status__eyebrow">Runtime</p>
      <h2 className="runtime-scene-status__title">{title}</h2>
      <p className="runtime-scene-status__detail">{detail}</p>
    </div>
  );
}

export function RuntimeSceneBoundary({
  camera,
  onRendererError,
  onRendererReady,
  rendererMessage,
  scene,
  surfaceRef,
  visibleEntities,
  visibleChunks,
  viewport,
  worldSeed
}: RuntimeSceneBoundaryProps) {
  if (scene === "failure") {
    return (
      <RuntimeStatusCard
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
          camera={camera}
          onRendererError={onRendererError}
          onRendererReady={onRendererReady}
          surfaceRef={surfaceRef}
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
