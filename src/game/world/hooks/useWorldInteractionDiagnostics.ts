import { useEffect, useState } from "react";

import { createWorldPickingSample } from "@engine/world/worldViewMath";
import type { CameraState } from "../../camera/model/cameraMath";
import type { ChunkCoordinate, WorldPoint } from "../types";

type ViewportForWorldDiagnostics = {
  fitScale: number;
  screenSize: {
    height: number;
    width: number;
  };
};

type WorldInteractionDiagnostics = {
  hoveredChunkCoordinate: ChunkCoordinate | null;
  hoveredWorldPoint: WorldPoint | null;
  selectedChunkCoordinate: ChunkCoordinate | null;
  selectedWorldPoint: WorldPoint | null;
};

type UseWorldInteractionDiagnosticsOptions = {
  camera: CameraState;
  surfaceElement: HTMLElement | null;
  viewport: ViewportForWorldDiagnostics;
};

const emptyState: WorldInteractionDiagnostics = {
  hoveredChunkCoordinate: null,
  hoveredWorldPoint: null,
  selectedChunkCoordinate: null,
  selectedWorldPoint: null
};

export function useWorldInteractionDiagnostics({
  camera,
  surfaceElement,
  viewport
}: UseWorldInteractionDiagnosticsOptions): WorldInteractionDiagnostics {
  const [diagnostics, setDiagnostics] = useState<WorldInteractionDiagnostics>(emptyState);

  useEffect(() => {
    if (!surfaceElement) {
      return;
    }

    const getRelativeScreenPoint = (clientX: number, clientY: number) => {
      const rect = surfaceElement.getBoundingClientRect();

      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        return;
      }

      const sample = createWorldPickingSample(
        getRelativeScreenPoint(event.clientX, event.clientY),
        camera,
        viewport
      );

      setDiagnostics((currentState) => ({
        ...currentState,
        hoveredChunkCoordinate: sample.chunkCoordinate,
        hoveredWorldPoint: sample.worldPoint
      }));
    };

    const handlePointerLeave = () => {
      setDiagnostics((currentState) => ({
        ...currentState,
        hoveredChunkCoordinate: null,
        hoveredWorldPoint: null
      }));
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) {
        return;
      }

      const sample = createWorldPickingSample(
        getRelativeScreenPoint(event.clientX, event.clientY),
        camera,
        viewport
      );

      setDiagnostics((currentState) => ({
        ...currentState,
        selectedChunkCoordinate: sample.chunkCoordinate,
        selectedWorldPoint: sample.worldPoint
      }));
    };

    surfaceElement.addEventListener("pointermove", handlePointerMove);
    surfaceElement.addEventListener("pointerleave", handlePointerLeave);
    surfaceElement.addEventListener("pointerdown", handlePointerDown);

    return () => {
      surfaceElement.removeEventListener("pointermove", handlePointerMove);
      surfaceElement.removeEventListener("pointerleave", handlePointerLeave);
      surfaceElement.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [camera, surfaceElement, viewport]);

  return diagnostics;
}
