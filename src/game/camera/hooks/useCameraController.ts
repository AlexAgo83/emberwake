import { useEffect, useState } from "react";
import type { RefObject } from "react";

import { cameraContract } from "../constants/cameraContract";
import {
  createDefaultCameraState,
  panCamera,
  rotateCamera,
  zoomCamera
} from "../model/cameraMath";
import type { CameraState } from "../model/cameraMath";

type ViewportForCamera = {
  fitScale: number;
};

type UseCameraControllerOptions = {
  surfaceRef: RefObject<HTMLElement | null>;
  viewport: ViewportForCamera;
};

type GestureState =
  | {
      previousX: number;
      previousY: number;
      type: "pan";
    }
  | {
      previousAngle: number;
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

const getTouchAngle = (touches: TouchList) =>
  Math.atan2(touches[1].clientY - touches[0].clientY, touches[1].clientX - touches[0].clientX);

export function useCameraController({
  surfaceRef,
  viewport
}: UseCameraControllerOptions) {
  const [cameraState, setCameraState] = useState<CameraState>(createDefaultCameraState);

  useEffect(() => {
    const surfaceElement = surfaceRef.current;
    if (!surfaceElement) {
      return;
    }

    let isMousePanning = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let touchGesture: GestureState | null = null;

    const currentScale = () => viewport.fitScale * cameraState.zoom;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) {
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
      event.preventDefault();
      setCameraState((currentState) => zoomCamera(currentState, event.deltaY));
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "q" || event.key === "Q") {
        setCameraState((currentState) =>
          rotateCamera(currentState, -cameraContract.rotationStepRadians)
        );
      }

      if (event.key === "e" || event.key === "E") {
        setCameraState((currentState) =>
          rotateCamera(currentState, cameraContract.rotationStepRadians)
        );
      }

      if (event.key === "r" || event.key === "R") {
        setCameraState(createDefaultCameraState());
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        touchGesture = {
          previousX: event.touches[0].clientX,
          previousY: event.touches[0].clientY,
          type: "pan"
        };
      }

      if (event.touches.length === 2) {
        const center = getTouchCenter(event.touches);
        touchGesture = {
          previousAngle: getTouchAngle(event.touches),
          previousCenterX: center.x,
          previousCenterY: center.y,
          previousDistance: getTouchDistance(event.touches),
          type: "gesture"
        };
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchGesture) {
        return;
      }

      if (touchGesture.type === "pan" && event.touches.length === 1) {
        const deltaX = event.touches[0].clientX - touchGesture.previousX;
        const deltaY = event.touches[0].clientY - touchGesture.previousY;

        touchGesture = {
          previousX: event.touches[0].clientX,
          previousY: event.touches[0].clientY,
          type: "pan"
        };

        setCameraState((currentState) => panCamera(currentState, deltaX, deltaY, currentScale()));
      }

      if (touchGesture.type === "gesture" && event.touches.length === 2) {
        const center = getTouchCenter(event.touches);
        const distance = getTouchDistance(event.touches);
        const angle = getTouchAngle(event.touches);
        const deltaX = center.x - touchGesture.previousCenterX;
        const deltaY = center.y - touchGesture.previousCenterY;
        const distanceRatio = distance / Math.max(touchGesture.previousDistance, 1);
        const angleDelta = angle - touchGesture.previousAngle;

        touchGesture = {
          previousAngle: angle,
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

          return rotateCamera(zoomedState, angleDelta);
        });
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (event.touches.length === 0) {
        touchGesture = null;
      }

      if (event.touches.length === 1) {
        touchGesture = {
          previousX: event.touches[0].clientX,
          previousY: event.touches[0].clientY,
          type: "pan"
        };
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
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cameraState.zoom, surfaceRef, viewport.fitScale]);

  return {
    cameraState,
    resetCamera: () => {
      setCameraState(createDefaultCameraState());
    }
  };
}
