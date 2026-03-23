import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cameraContract } from "@engine/camera/cameraContract";
import {
  createDefaultCameraState,
  panCamera,
  zoomCamera
} from "@engine/camera/cameraMath";
import type { CameraState } from "@engine/camera/cameraMath";
import type { WorldPoint } from "@engine/geometry/primitives";
import type { CameraMode } from "../model/cameraMode";
import type { DesktopControlBindings } from "../../input/model/singleEntityControlContract";
import { normalizeKeyboardBindingKey } from "../../input/model/singleEntityControlContract";

type ViewportForCamera = {
  fitScale: number;
  layoutMode?: string;
};

const mobileRuntimeZoomOffset = 0.25;

type UseCameraControllerOptions = {
  cameraMode: CameraMode;
  desktopControlBindings?: DesktopControlBindings;
  debugCameraEnabled: boolean;
  followedWorldPosition: WorldPoint;
  initialCameraState?: CameraState;
  onCameraStateChange?: (cameraState: CameraState) => void;
  surfaceElement: HTMLElement | null;
  viewport: ViewportForCamera;
};

type GestureState = {
  previousCenterX: number;
  previousCenterY: number;
  previousDistance: number;
  type: "gesture";
};

const getTouchCenter = (touches: TouchList) => ({
  x: (touches[0].clientX + touches[1].clientX) / 2,
  y: (touches[0].clientY + touches[1].clientY) / 2
});

const getTouchDistance = (touches: TouchList) =>
  Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY);

export function useCameraController({
  cameraMode,
  desktopControlBindings,
  debugCameraEnabled,
  followedWorldPosition,
  initialCameraState,
  onCameraStateChange,
  surfaceElement,
  viewport
}: UseCameraControllerOptions) {
  const [cameraState, setCameraState] = useState<CameraState>(() =>
    initialCameraState ?? createDefaultCameraState()
  );
  const previousCameraModeRef = useRef<CameraMode>(cameraMode);
  const resolvedCameraState = useMemo(
    () => {
      const baseCameraState =
        cameraMode === "follow-entity"
          ? {
              ...cameraState,
              worldPosition: {
                x: followedWorldPosition.x,
                y: followedWorldPosition.y
              }
            }
          : cameraState;

      return viewport.layoutMode === "mobile"
        ? {
            ...baseCameraState,
            zoom: Math.max(0.0001, baseCameraState.zoom - mobileRuntimeZoomOffset)
          }
        : baseCameraState;
    },
    [cameraMode, cameraState, followedWorldPosition.x, followedWorldPosition.y, viewport.layoutMode]
  );

  useEffect(() => {
    onCameraStateChange?.(cameraState);
  }, [cameraState, onCameraStateChange]);

  useEffect(() => {
    if (previousCameraModeRef.current === "follow-entity" && cameraMode === "free") {
      setCameraState((currentState) => ({
        ...currentState,
        worldPosition: {
          x: followedWorldPosition.x,
          y: followedWorldPosition.y
        }
      }));
    }

    previousCameraModeRef.current = cameraMode;
  }, [cameraMode, followedWorldPosition.x, followedWorldPosition.y]);

  useEffect(() => {
    if (!surfaceElement) {
      return;
    }

    let isMousePanning = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let touchGesture: GestureState | null = null;

    const currentScale = () => viewport.fitScale * cameraState.zoom;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        cameraMode !== "free" ||
        event.pointerType !== "mouse" ||
        event.button !== 0 ||
        !event.shiftKey
      ) {
        return;
      }

      isMousePanning = true;
      previousMouseX = event.clientX;
      previousMouseY = event.clientY;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isMousePanning) {
        return;
      }

      const deltaX = event.clientX - previousMouseX;
      const deltaY = event.clientY - previousMouseY;

      previousMouseX = event.clientX;
      previousMouseY = event.clientY;

      setCameraState((currentState) => panCamera(currentState, deltaX, deltaY, currentScale()));
    };

    const stopMousePan = () => {
      isMousePanning = false;
    };

    const handleWheel = (event: WheelEvent) => {
      if (!event.shiftKey) {
        return;
      }

      event.preventDefault();
      setCameraState((currentState) => zoomCamera(currentState, event.deltaY));
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const normalizedKey = normalizeKeyboardBindingKey(event.key);
      const isCameraDebugKey = normalizedKey === "r";

      if (isCameraDebugKey && !debugCameraEnabled) {
        return;
      }

      if (normalizedKey === "r") {
        setCameraState(createDefaultCameraState());
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (!debugCameraEnabled) {
        touchGesture = null;
        return;
      }

      if (cameraMode !== "free") {
        touchGesture = null;
        return;
      }

      if (event.touches.length === 2) {
        const center = getTouchCenter(event.touches);
        touchGesture = {
          previousCenterX: center.x,
          previousCenterY: center.y,
          previousDistance: getTouchDistance(event.touches),
          type: "gesture"
        };
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!debugCameraEnabled) {
        touchGesture = null;
        return;
      }

      if (cameraMode !== "free") {
        touchGesture = null;
        return;
      }

      if (!touchGesture) {
        return;
      }

      if (touchGesture.type === "gesture" && event.touches.length === 2) {
        const center = getTouchCenter(event.touches);
        const distance = getTouchDistance(event.touches);
        const deltaX = center.x - touchGesture.previousCenterX;
        const deltaY = center.y - touchGesture.previousCenterY;
        const distanceRatio = distance / Math.max(touchGesture.previousDistance, 1);

        touchGesture = {
          previousCenterX: center.x,
          previousCenterY: center.y,
          previousDistance: distance,
          type: "gesture"
        };

        setCameraState((currentState) => {
          const pannedState = panCamera(currentState, deltaX, deltaY, currentScale());
          const zoomedState = {
            ...pannedState,
            zoom: Math.min(
              cameraContract.maxZoom,
              Math.max(cameraContract.minZoom, pannedState.zoom * distanceRatio)
            )
          };
          return zoomedState;
        });
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!debugCameraEnabled || event.touches.length === 0) {
        touchGesture = null;
      }
    };

    surfaceElement.addEventListener("pointerdown", handlePointerDown);
    surfaceElement.addEventListener("pointermove", handlePointerMove);
    surfaceElement.addEventListener("pointerup", stopMousePan);
    surfaceElement.addEventListener("pointerleave", stopMousePan);
    surfaceElement.addEventListener("wheel", handleWheel, { passive: false });
    surfaceElement.addEventListener("touchstart", handleTouchStart, { passive: true });
    surfaceElement.addEventListener("touchmove", handleTouchMove, { passive: true });
    surfaceElement.addEventListener("touchend", handleTouchEnd, { passive: true });
    surfaceElement.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      surfaceElement.removeEventListener("pointerdown", handlePointerDown);
      surfaceElement.removeEventListener("pointermove", handlePointerMove);
      surfaceElement.removeEventListener("pointerup", stopMousePan);
      surfaceElement.removeEventListener("pointerleave", stopMousePan);
      surfaceElement.removeEventListener("wheel", handleWheel);
      surfaceElement.removeEventListener("touchstart", handleTouchStart);
      surfaceElement.removeEventListener("touchmove", handleTouchMove);
      surfaceElement.removeEventListener("touchend", handleTouchEnd);
      surfaceElement.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    cameraMode,
    cameraState.zoom,
    debugCameraEnabled,
    desktopControlBindings,
    surfaceElement,
    viewport.fitScale
  ]);

  const resetCamera = useCallback(() => {
    setCameraState(createDefaultCameraState());
  }, []);

  return {
    cameraState: resolvedCameraState,
    resetCamera
  };
}
