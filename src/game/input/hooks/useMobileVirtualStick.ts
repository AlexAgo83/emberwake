import { useEffect, useState } from "react";

import { createIdleMovementIntent } from "../model/singleEntityControlContract";
import { resolveVirtualStickState } from "../model/virtualStickMath";
import type { MovementIntent } from "../model/singleEntityControlContract";
import type { VirtualStickPoint } from "../model/virtualStickMath";

export type MobileVirtualStickState = {
  anchor: VirtualStickPoint;
  isVisible: boolean;
  knob: VirtualStickPoint;
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
  isVisible: false,
  knob: {
    x: 0,
    y: 0
  },
  movementIntent: createIdleMovementIntent("touch")
};

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
        isVisible: true,
        knob: anchor,
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
        isVisible: true,
        knob: resolvedState.knobPosition,
        movementIntent: resolvedState.movementIntent
      });
    };

    const handlePointerRelease = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) {
        return;
      }

      surfaceElement.releasePointerCapture?.(event.pointerId);
      resetStick();
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
