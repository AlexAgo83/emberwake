import { renderHook, act } from "@testing-library/react";

import { createDefaultCameraState } from "../model/cameraMath";
import { useCameraController } from "./useCameraController";
import { createDefaultDesktopControlBindings } from "../../input/model/singleEntityControlContract";

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
  it("locks world position to the followed entity in follow mode", () => {
    const surfaceElement = document.createElement("div");
    const surfaceRef = {
      current: surfaceElement
    };
    const { result, rerender } = renderHook(
      ({ followedWorldPosition }) =>
        useCameraController({
          cameraMode: "follow-entity",
          debugCameraEnabled: false,
          followedWorldPosition,
          initialCameraState: createDefaultCameraState(),
          surfaceElement: surfaceRef.current,
          viewport: {
            fitScale: 1
          }
        }),
      {
        initialProps: {
          followedWorldPosition: { x: 128, y: -96 }
        }
      }
    );

    expect(result.current.cameraState.worldPosition).toEqual({ x: 128, y: -96 });

    rerender({
      followedWorldPosition: { x: 256, y: 64 }
    });

    expect(result.current.cameraState.worldPosition).toEqual({ x: 256, y: 64 });
  });

  it("ignores touch camera gestures outside debug mode", () => {
    const surfaceElement = document.createElement("div");
    const surfaceRef = {
      current: surfaceElement
    };
    const initialCameraState = createDefaultCameraState();
    const { result } = renderHook(() =>
      useCameraController({
        cameraMode: "free",
        debugCameraEnabled: false,
        followedWorldPosition: { x: 0, y: 0 },
        initialCameraState,
        surfaceElement: surfaceRef.current,
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
        cameraMode: "free",
        debugCameraEnabled: true,
        followedWorldPosition: { x: 0, y: 0 },
        initialCameraState,
        surfaceElement: surfaceRef.current,
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

  it("attaches touch gesture handlers when the surface appears after the initial render", () => {
    const surfaceElement = document.createElement("div");
    const initialCameraState = createDefaultCameraState();
    const { result, rerender } = renderHook(
      ({ runtimeSurfaceElement }) =>
        useCameraController({
          cameraMode: "free",
          debugCameraEnabled: true,
          followedWorldPosition: { x: 0, y: 0 },
          initialCameraState,
          surfaceElement: runtimeSurfaceElement,
          viewport: {
            fitScale: 1
          }
        }),
      {
        initialProps: {
          runtimeSurfaceElement: null as HTMLElement | null
        }
      }
    );

    rerender({
      runtimeSurfaceElement: surfaceElement
    });

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

  it("does not rotate from removed keyboard rotation controls even in debug mode", () => {
    const surfaceElement = document.createElement("div");
    const { result } = renderHook(() =>
      useCameraController({
        cameraMode: "free",
        debugCameraEnabled: true,
        desktopControlBindings: createDefaultDesktopControlBindings(),
        followedWorldPosition: { x: 0, y: 0 },
        initialCameraState: createDefaultCameraState(),
        surfaceElement,
        viewport: {
          fitScale: 1
        }
      })
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "q" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "e" }));
    });

    expect(result.current.cameraState.rotation).toBe(0);
  });
});
