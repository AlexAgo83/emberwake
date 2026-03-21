import type { WorldPoint } from "@engine/geometry/primitives";
import {
  movementSurfaceModifierDefinitions,
  type MovementSurfaceModifierKind
} from "@game/content/world/worldData";

export type PseudoPhysicsCollider = {
  footprint: {
    radius: number;
  };
  id: string;
  worldPosition: WorldPoint;
};

type ResolveMovementOptions = {
  currentPosition: WorldPoint;
  currentVelocity: WorldPoint;
  desiredVelocity: WorldPoint;
  footprintRadius: number;
  isBlockedAtPosition: (position: WorldPoint, footprintRadius: number) => boolean;
  staticColliders?: readonly PseudoPhysicsCollider[];
  stepSeconds: number;
  surfaceModifierKind: MovementSurfaceModifierKind;
};

type ResolveMovementResult = {
  surfaceModifierKind: MovementSurfaceModifierKind;
  velocity: WorldPoint;
  worldPosition: WorldPoint;
};

const lerp = (currentValue: number, targetValue: number, weight: number) =>
  currentValue + (targetValue - currentValue) * weight;

const applySurfaceVelocityProfile = ({
  currentVelocity,
  desiredVelocity,
  surfaceModifierKind
}: {
  currentVelocity: WorldPoint;
  desiredVelocity: WorldPoint;
  surfaceModifierKind: MovementSurfaceModifierKind;
}): WorldPoint => {
  const surfaceProfile = movementSurfaceModifierDefinitions[surfaceModifierKind];

  if (surfaceProfile.controlResponsiveness >= 1 && surfaceProfile.velocityRetainFactor === 0) {
    return desiredVelocity;
  }

  const blendedVelocity = {
    x: lerp(currentVelocity.x, desiredVelocity.x, surfaceProfile.controlResponsiveness),
    y: lerp(currentVelocity.y, desiredVelocity.y, surfaceProfile.controlResponsiveness)
  };

  if (desiredVelocity.x === 0 && desiredVelocity.y === 0) {
    return {
      x: blendedVelocity.x * surfaceProfile.velocityRetainFactor,
      y: blendedVelocity.y * surfaceProfile.velocityRetainFactor
    };
  }

  return blendedVelocity;
};

const resolveAxisBlockedMovement = ({
  currentPosition,
  footprintRadius,
  isBlockedAtPosition,
  velocity,
  stepSeconds
}: {
  currentPosition: WorldPoint;
  footprintRadius: number;
  isBlockedAtPosition: ResolveMovementOptions["isBlockedAtPosition"];
  stepSeconds: number;
  velocity: WorldPoint;
}) => {
  let nextPosition = currentPosition;
  let nextVelocity = velocity;

  const candidateX = {
    x: currentPosition.x + velocity.x * stepSeconds,
    y: currentPosition.y
  };

  if (isBlockedAtPosition(candidateX, footprintRadius)) {
    nextVelocity = {
      ...nextVelocity,
      x: 0
    };
  } else {
    nextPosition = candidateX;
  }

  const candidateY = {
    x: nextPosition.x,
    y: currentPosition.y + velocity.y * stepSeconds
  };

  if (isBlockedAtPosition(candidateY, footprintRadius)) {
    nextVelocity = {
      ...nextVelocity,
      y: 0
    };
  } else {
    nextPosition = candidateY;
  }

  return {
    velocity: nextVelocity,
    worldPosition: nextPosition
  };
};

const resolveStaticEntitySeparation = ({
  colliders,
  footprintRadius,
  worldPosition
}: {
  colliders: readonly PseudoPhysicsCollider[];
  footprintRadius: number;
  worldPosition: WorldPoint;
}): WorldPoint => {
  let nextPosition = worldPosition;

  for (const collider of colliders) {
    const deltaX = nextPosition.x - collider.worldPosition.x;
    const deltaY = nextPosition.y - collider.worldPosition.y;
    const distance = Math.hypot(deltaX, deltaY);
    const requiredDistance = footprintRadius + collider.footprint.radius;

    if (distance >= requiredDistance) {
      continue;
    }

    const safeDistance = distance === 0 ? 1 : distance;
    const normalX = distance === 0 ? 1 : deltaX / safeDistance;
    const normalY = distance === 0 ? 0 : deltaY / safeDistance;
    const penetrationDepth = requiredDistance - distance;

    nextPosition = {
      x: nextPosition.x + normalX * penetrationDepth,
      y: nextPosition.y + normalY * penetrationDepth
    };
  }

  return nextPosition;
};

export const resolvePseudoPhysicalMovement = ({
  currentPosition,
  currentVelocity,
  desiredVelocity,
  footprintRadius,
  isBlockedAtPosition,
  staticColliders = [],
  stepSeconds,
  surfaceModifierKind
}: ResolveMovementOptions): ResolveMovementResult => {
  const surfaceAdjustedVelocity = applySurfaceVelocityProfile({
    currentVelocity,
    desiredVelocity: {
      x: desiredVelocity.x * movementSurfaceModifierDefinitions[surfaceModifierKind].speedMultiplier,
      y: desiredVelocity.y * movementSurfaceModifierDefinitions[surfaceModifierKind].speedMultiplier
    },
    surfaceModifierKind
  });
  const axisResolvedMovement = resolveAxisBlockedMovement({
    currentPosition,
    footprintRadius,
    isBlockedAtPosition,
    stepSeconds,
    velocity: surfaceAdjustedVelocity
  });

  return {
    surfaceModifierKind,
    velocity: axisResolvedMovement.velocity,
    worldPosition: resolveStaticEntitySeparation({
      colliders: staticColliders,
      footprintRadius,
      worldPosition: axisResolvedMovement.worldPosition
    })
  };
};
