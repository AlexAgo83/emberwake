import {
  createIdleMovementIntent,
  createMovementIntent,
  singleEntityControlContract
} from "./singleEntityControlContract";
import type { MovementIntent } from "./singleEntityControlContract";

export type VirtualStickPoint = {
  x: number;
  y: number;
};

export type VirtualStickResolvedState = {
  knobPosition: VirtualStickPoint;
  movementIntent: MovementIntent;
};

export const resolveVirtualStickState = (
  anchor: VirtualStickPoint,
  current: VirtualStickPoint
): VirtualStickResolvedState => {
  const rawDeltaX = current.x - anchor.x;
  const rawDeltaY = current.y - anchor.y;
  const distance = Math.hypot(rawDeltaX, rawDeltaY);

  if (distance === 0) {
    return {
      knobPosition: anchor,
      movementIntent: createIdleMovementIntent("touch")
    };
  }

  const normalizedX = rawDeltaX / distance;
  const normalizedY = rawDeltaY / distance;
  const clampedDistance = Math.min(distance, singleEntityControlContract.virtualStick.maxRadiusPixels);
  const knobPosition = {
    x: anchor.x + normalizedX * clampedDistance,
    y: anchor.y + normalizedY * clampedDistance
  };

  if (distance <= singleEntityControlContract.virtualStick.deadZonePixels) {
    return {
      knobPosition,
      movementIntent: createIdleMovementIntent("touch")
    };
  }

  const scaledMagnitude =
    (clampedDistance - singleEntityControlContract.virtualStick.deadZonePixels) /
    (singleEntityControlContract.virtualStick.maxRadiusPixels -
      singleEntityControlContract.virtualStick.deadZonePixels);

  return {
    knobPosition,
    movementIntent: createMovementIntent(
      normalizedX * scaledMagnitude,
      normalizedY * scaledMagnitude,
      "touch"
    )
  };
};
