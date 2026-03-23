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

    const resetStick = () => {
      activePointerId = null;
      anchor = null;
      setStickState(hiddenStickState);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || activePointerId !== null) {
        return;
      }

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
      anchor = null;
      setStickState(hiddenStickState);
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
    };
  }, [surfaceElement]);

  return stickState;
}
