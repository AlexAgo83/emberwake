import { renderHook, act } from "@testing-library/react";

import { createDefaultCameraState } from "../model/cameraMath";
import { useCameraController } from "./useCameraController";

type TouchPoint = {
  clientX: number;
  clientY: number;
};

const createTouchList = (points: TouchPoint[]) =>
  Object.assign([...points], {
    item: (index: number) => points[index] ?? null
  }) as unknown as TouchList;

const dispatchTouchEvent = (element: HTMLElement, type: string, points: TouchPoint[]) => {
  const event = new Event(type, {
    bubbles: true,
    cancelable: true
  });

  Object.defineProperty(event, "touches", {
    configurable: true,
    value: createTouchList(points)
  });

  element.dispatchEvent(event);
};

describe("useCameraController", () => {
  it("ignores touch camera gestures outside debug mode", () => {
    const surfaceElement = document.createElement("div");
    const surfaceRef = {
      current: surfaceElement
    };
    const initialCameraState = createDefaultCameraState();
    const { result } = renderHook(() =>
      useCameraController({
        debugCameraEnabled: false,
        initialCameraState,
        surfaceRef,
        viewport: {
          fitScale: 1
        }
      })
    );

    act(() => {
      dispatchTouchEvent(surfaceElement, "touchstart", [
        { clientX: 100, clientY: 100 },
        { clientX: 180, clientY: 100 }
      ]);
      dispatchTouchEvent(surfaceElement, "touchmove", [
        { clientX: 140, clientY: 120 },
        { clientX: 220, clientY: 120 }
      ]);
      dispatchTouchEvent(surfaceElement, "touchend", []);
    });

    expect(result.current.cameraState).toEqual(initialCameraState);
  });

  it("allows touch camera gestures when debug mode is active", () => {
    const surfaceElement = document.createElement("div");
    const surfaceRef = {
      current: surfaceElement
    };
    const initialCameraState = createDefaultCameraState();
    const { result } = renderHook(() =>
      useCameraController({
        debugCameraEnabled: true,
        initialCameraState,
        surfaceRef,
        viewport: {
          fitScale: 1
        }
      })
    );

    act(() => {
      dispatchTouchEvent(surfaceElement, "touchstart", [
        { clientX: 100, clientY: 100 },
        { clientX: 180, clientY: 100 }
      ]);
      dispatchTouchEvent(surfaceElement, "touchmove", [
        { clientX: 150, clientY: 120 },
        { clientX: 250, clientY: 140 }
      ]);
      dispatchTouchEvent(surfaceElement, "touchend", []);
    });

    expect(result.current.cameraState).not.toEqual(initialCameraState);
  });
});
