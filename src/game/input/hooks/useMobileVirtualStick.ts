import { useEffect, useState } from "react";

import { createIdleMovementIntent } from "../model/singleEntityControlContract";
import { resolveVirtualStickState } from "../model/virtualStickMath";
import type { MovementIntent } from "../model/singleEntityControlContract";
import type { VirtualStickPoint } from "../model/virtualStickMath";

export type MobileVirtualStickState = {
  anchor: VirtualStickPoint;
  baseOpacity: number;
  isVisible: boolean;
  knob: VirtualStickPoint;
  knobVisible: boolean;
  movementIntent: MovementIntent;
};

type UseMobileVirtualStickOptions = {
  surfaceElement: HTMLElement | null;
};

const hiddenStickState: MobileVirtualStickState = {
  anchor: {
    x: 0,
    y: 0
  },
  baseOpacity: 0,
  isVisible: false,
  knob: {
    x: 0,
    y: 0
  },
  knobVisible: false,
  movementIntent: createIdleMovementIntent("touch")
};

const activeBaseOpacity = 0.5;
const fadedBaseOpacity = 0.06;
const fadeDurationMs = 2400;
const fadeStepMs = 60;

export function useMobileVirtualStick({
  surfaceElement
}: UseMobileVirtualStickOptions): MobileVirtualStickState {
  const [stickState, setStickState] = useState<MobileVirtualStickState>(hiddenStickState);

  useEffect(() => {
    if (!surfaceElement) {
      return;
    }

    let activePointerId: number | null = null;
    let anchor: VirtualStickPoint | null = null;
    let fadeTimeoutId: number | null = null;

    const clearFadeTimeout = () => {
      if (fadeTimeoutId === null) {
        return;
      }

      window.clearTimeout(fadeTimeoutId);
      fadeTimeoutId = null;
    };

    const resetStick = () => {
      clearFadeTimeout();
      activePointerId = null;
      anchor = null;
      setStickState(hiddenStickState);
    };

    const beginFadeOut = (fadeAnchor: VirtualStickPoint) => {
      clearFadeTimeout();
      const fadeStartedAt = Date.now();

      const fadeStep = () => {
        const elapsedMs = Date.now() - fadeStartedAt;
        const progress = Math.min(1, elapsedMs / fadeDurationMs);

        if (progress >= 1) {
          setStickState(hiddenStickState);
          fadeTimeoutId = null;
          return;
        }

        setStickState({
          anchor: fadeAnchor,
          baseOpacity:
            activeBaseOpacity - (activeBaseOpacity - fadedBaseOpacity) * progress,
          isVisible: true,
          knob: fadeAnchor,
          knobVisible: false,
          movementIntent: createIdleMovementIntent("touch")
        });
        fadeTimeoutId = window.setTimeout(fadeStep, fadeStepMs);
      };

      fadeStep();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || activePointerId !== null) {
        return;
      }

      clearFadeTimeout();
      activePointerId = event.pointerId;
      anchor = {
        x: event.clientX,
        y: event.clientY
      };
      surfaceElement.setPointerCapture?.(event.pointerId);
      setStickState({
        anchor,
        baseOpacity: activeBaseOpacity,
        isVisible: true,
        knob: anchor,
        knobVisible: true,
        movementIntent: createIdleMovementIntent("touch")
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId || !anchor) {
        return;
      }

      const resolvedState = resolveVirtualStickState(anchor, {
        x: event.clientX,
        y: event.clientY
      });

      setStickState({
        anchor,
        baseOpacity: activeBaseOpacity,
        isVisible: true,
        knob: resolvedState.knobPosition,
        knobVisible: true,
        movementIntent: resolvedState.movementIntent
      });
    };

    const handlePointerRelease = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) {
        return;
      }

      surfaceElement.releasePointerCapture?.(event.pointerId);
      activePointerId = null;
      const fadeAnchor = anchor;
      anchor = null;

      if (!fadeAnchor) {
        resetStick();
        return;
      }

      beginFadeOut(fadeAnchor);
    };

    surfaceElement.addEventListener("pointerdown", handlePointerDown);
    surfaceElement.addEventListener("pointermove", handlePointerMove);
    surfaceElement.addEventListener("pointerup", handlePointerRelease);
    surfaceElement.addEventListener("pointercancel", handlePointerRelease);

    return () => {
      surfaceElement.removeEventListener("pointerdown", handlePointerDown);
      surfaceElement.removeEventListener("pointermove", handlePointerMove);
      surfaceElement.removeEventListener("pointerup", handlePointerRelease);
      surfaceElement.removeEventListener("pointercancel", handlePointerRelease);
      clearFadeTimeout();
    };
  }, [surfaceElement]);

  return stickState;
}
