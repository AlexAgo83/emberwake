import type { WorldEntity } from "./entityContract";

type OccupancyEntity = Pick<WorldEntity, "footprint" | "id" | "worldPosition">;

export type EntityOverlap = {
  distance: number;
  entityIds: [string, string];
  penetrationDepth: number;
};

export const entityOccupancyContract = {
  continuity: {
    chunkTransitions: "seamless-for-player-facing-motion",
    positionUpdates: "continuous-world-space",
    primaryEntityVisibility: "kept-readable-through-camera-follow"
  },
  earlyTraversal: {
    entityBlocking: false,
    overlapPolicy: "tolerated-and-diagnosed",
    terrainBlocking: false,
    worldBounds: "none"
  },
  footprintModel: "circle-radius",
  futureNavigation: {
    occupancyGrid: "derived-from-world-space-when-needed",
    pathfinding: "future-system",
    terrainInteraction: "future-contract"
  },
  worldModel: {
    chunkRole: "indexing-and-streaming-only",
    coordinates: "continuous-2d",
    tileRole: "helper-not-authoritative-movement-grid"
  }
} as const;

export const detectEntityOverlaps = (entities: readonly OccupancyEntity[]): EntityOverlap[] => {
  const overlaps: EntityOverlap[] = [];

  for (let leftIndex = 0; leftIndex < entities.length; leftIndex += 1) {
    const leftEntity = entities[leftIndex];

    for (let rightIndex = leftIndex + 1; rightIndex < entities.length; rightIndex += 1) {
      const rightEntity = entities[rightIndex];
      const deltaX = rightEntity.worldPosition.x - leftEntity.worldPosition.x;
      const deltaY = rightEntity.worldPosition.y - leftEntity.worldPosition.y;
      const distance = Math.hypot(deltaX, deltaY);
      const combinedRadius = leftEntity.footprint.radius + rightEntity.footprint.radius;

      if (distance >= combinedRadius) {
        continue;
      }

      overlaps.push({
        distance,
        entityIds: [leftEntity.id, rightEntity.id],
        penetrationDepth: combinedRadius - distance
      });
    }
  }

  return overlaps;
};
