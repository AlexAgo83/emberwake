import { chunkCoordinateToId, worldPointToChunkCoordinate } from "../../world/model/worldContract";
import type { WorldPoint } from "../../world/types";
import type { SimulatedEntity } from "./entitySimulation";

export const indexEntitiesByChunk = (entities: SimulatedEntity[]) => {
  const entitiesByChunk = new Map<string, SimulatedEntity[]>();

  for (const entity of entities) {
    const chunkCoordinate = worldPointToChunkCoordinate(entity.worldPosition);
    const chunkId = chunkCoordinateToId(chunkCoordinate);
    const chunkEntities = entitiesByChunk.get(chunkId) ?? [];

    chunkEntities.push(entity);
    entitiesByChunk.set(chunkId, chunkEntities);
  }

  return entitiesByChunk;
};

export const filterVisibleEntities = (
  entities: SimulatedEntity[],
  visibleChunkIds: Set<string>
) =>
  entities.filter((entity) =>
    visibleChunkIds.has(chunkCoordinateToId(worldPointToChunkCoordinate(entity.worldPosition)))
  );

export const pickEntityAtWorldPoint = (
  entities: SimulatedEntity[],
  worldPoint: WorldPoint
): SimulatedEntity | null => {
  const matchingEntities = entities
    .filter((entity) => {
      const deltaX = worldPoint.x - entity.worldPosition.x;
      const deltaY = worldPoint.y - entity.worldPosition.y;

      return Math.hypot(deltaX, deltaY) <= entity.footprint.radius;
    })
    .sort((leftEntity, rightEntity) =>
      rightEntity.renderLayer === leftEntity.renderLayer
        ? rightEntity.footprint.radius - leftEntity.footprint.radius
        : rightEntity.renderLayer - leftEntity.renderLayer
    );

  return matchingEntities[0] ?? null;
};

export const sortEntitiesForRendering = (entities: SimulatedEntity[]) =>
  [...entities].sort((leftEntity, rightEntity) =>
    leftEntity.renderLayer === rightEntity.renderLayer
      ? leftEntity.worldPosition.y - rightEntity.worldPosition.y
      : leftEntity.renderLayer - rightEntity.renderLayer
  );
