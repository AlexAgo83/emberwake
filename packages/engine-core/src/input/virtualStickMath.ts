export type VirtualStickPoint = {
  x: number;
  y: number;
};

export type ResolvedVirtualStickVector = {
  isActive: boolean;
  magnitude: number;
  vector: {
    x: number;
    y: number;
  };
};

export type VirtualStickGeometryState = {
  knobPosition: VirtualStickPoint;
  movement: ResolvedVirtualStickVector;
};

export const resolveVirtualStickGeometry = (
  anchor: VirtualStickPoint,
  current: VirtualStickPoint,
  options: {
    deadZonePixels: number;
    maxRadiusPixels: number;
  }
): VirtualStickGeometryState => {
  const rawDeltaX = current.x - anchor.x;
  const rawDeltaY = current.y - anchor.y;
  const distance = Math.hypot(rawDeltaX, rawDeltaY);

  if (distance === 0) {
    return {
      knobPosition: anchor,
      movement: {
        isActive: false,
        magnitude: 0,
        vector: {
          x: 0,
          y: 0
        }
      }
    };
  }

  const normalizedX = rawDeltaX / distance;
  const normalizedY = rawDeltaY / distance;
  const clampedDistance = Math.min(distance, options.maxRadiusPixels);
  const knobPosition = {
    x: anchor.x + normalizedX * clampedDistance,
    y: anchor.y + normalizedY * clampedDistance
  };

  if (distance <= options.deadZonePixels) {
    return {
      knobPosition,
      movement: {
        isActive: false,
        magnitude: 0,
        vector: {
          x: 0,
          y: 0
        }
      }
    };
  }

  const scaledMagnitude =
    (clampedDistance - options.deadZonePixels) /
    (options.maxRadiusPixels - options.deadZonePixels);

  return {
    knobPosition,
    movement: {
      isActive: true,
      magnitude: scaledMagnitude,
      vector: {
        x: normalizedX,
        y: normalizedY
      }
    }
  };
};
