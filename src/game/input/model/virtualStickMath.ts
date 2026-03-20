import {
  resolveVirtualStickGeometry
} from "@engine/input/virtualStickMath";
import type { VirtualStickPoint } from "@engine/input/virtualStickMath";
import {
  createIdleMovementIntent,
  createMovementIntent,
  singleEntityControlContract
} from "./singleEntityControlContract";
import type { MovementIntent } from "./singleEntityControlContract";

export type { VirtualStickPoint } from "@engine/input/virtualStickMath";

export type VirtualStickResolvedState = {
  knobPosition: VirtualStickPoint;
  movementIntent: MovementIntent;
};

export const resolveVirtualStickState = (
  anchor: VirtualStickPoint,
  current: VirtualStickPoint
): VirtualStickResolvedState => {
  const resolvedGeometry = resolveVirtualStickGeometry(anchor, current, {
    deadZonePixels: singleEntityControlContract.virtualStick.deadZonePixels,
    maxRadiusPixels: singleEntityControlContract.virtualStick.maxRadiusPixels
  });

  return {
    knobPosition: resolvedGeometry.knobPosition,
    movementIntent: resolvedGeometry.movement.isActive
      ? createMovementIntent(
          resolvedGeometry.movement.vector.x * resolvedGeometry.movement.magnitude,
          resolvedGeometry.movement.vector.y * resolvedGeometry.movement.magnitude,
          "touch"
        )
      : createIdleMovementIntent("touch")
  };
};
