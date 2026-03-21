import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { useMobileVirtualStick } from "./useMobileVirtualStick";

const dispatchPointerEvent = (
  element: HTMLElement,
  type: string,
  init: Partial<PointerEvent> & {
    clientX?: number;
    clientY?: number;
    pointerId?: number;
    pointerType?: string;
  }
) => {
  const event = new Event(type, {
    bubbles: true,
    cancelable: true
  });

  Object.defineProperties(event, {
    clientX: {
      configurable: true,
      value: init.clientX ?? 0
    },
    clientY: {
      configurable: true,
      value: init.clientY ?? 0
    },
    pointerId: {
      configurable: true,
      value: init.pointerId ?? 1
    },
    pointerType: {
      configurable: true,
      value: init.pointerType ?? "touch"
    }
  });

  element.dispatchEvent(event);
};

describe("useMobileVirtualStick", () => {
  it("binds to a runtime surface that becomes available after the initial render", () => {
    const surfaceElement = document.createElement("div");
    const setPointerCapture = vi.fn();
    const releasePointerCapture = vi.fn();

    Object.assign(surfaceElement, {
      releasePointerCapture,
      setPointerCapture
    });

    const { result, rerender } = renderHook(
      ({ runtimeSurfaceElement }) =>
        useMobileVirtualStick({
          surfaceElement: runtimeSurfaceElement
        }),
      {
        initialProps: {
          runtimeSurfaceElement: null as HTMLElement | null
        }
      }
    );

    expect(result.current.isVisible).toBe(false);

    rerender({
      runtimeSurfaceElement: surfaceElement
    });

    act(() => {
      dispatchPointerEvent(surfaceElement, "pointerdown", {
        clientX: 120,
        clientY: 160
      });
      dispatchPointerEvent(surfaceElement, "pointermove", {
        clientX: 180,
        clientY: 160
      });
    });

    expect(setPointerCapture).toHaveBeenCalledWith(1);
    expect(result.current.isVisible).toBe(true);
    expect(result.current.movementIntent.isActive).toBe(true);
    expect(result.current.movementIntent.source).toBe("touch");
    expect(result.current.movementIntent.vector.x).toBeGreaterThan(0.5);

    act(() => {
      dispatchPointerEvent(surfaceElement, "pointerup", {
        clientX: 180,
        clientY: 160
      });
    });

    expect(releasePointerCapture).toHaveBeenCalledWith(1);
    expect(result.current.isVisible).toBe(false);
  });
});
