import { useEffect, useMemo, useState } from "react";

import { chunkCoordinateToId } from "../../world/model/worldContract";
import { createDeterministicDebugEntities } from "../model/entityDebugScenario";
import type { PresentedEntity } from "../model/entityContract";
import { detectEntityOverlaps } from "../model/entityOccupancy";
import {
  filterVisibleEntities,
  indexEntitiesByChunk,
  pickEntityAtWorldPoint,
  sortEntitiesForRendering
} from "../model/entitySpatialIndex";
import type { ChunkCoordinate, WorldPoint } from "../../world/types";
import type { SimulatedEntity } from "../model/entitySimulation";

type UseEntityWorldOptions = {
  primaryEntity: SimulatedEntity;
  selectedWorldPoint: WorldPoint | null;
  visibleChunks: ChunkCoordinate[];
};

type EntityWorldState = {
  entitiesByChunk: Map<string, SimulatedEntity[]>;
  overlappingPairs: ReturnType<typeof detectEntityOverlaps>;
  selectedEntity: PresentedEntity<SimulatedEntity>;
  trackedEntities: SimulatedEntity[];
  visibleEntities: Array<PresentedEntity<SimulatedEntity>>;
};

const presentEntitySelection = (
  entity: SimulatedEntity,
  selectedEntityId: string | null
): PresentedEntity<SimulatedEntity> => ({
  ...entity,
  isSelected: entity.id === selectedEntityId
});

export function useEntityWorld({
  primaryEntity,
  selectedWorldPoint,
  visibleChunks
}: UseEntityWorldOptions): EntityWorldState {
  const trackedEntities = useMemo(() => {
    const scenarioEntities = createDeterministicDebugEntities();

    return [primaryEntity, ...scenarioEntities];
  }, [primaryEntity]);
  const visibleChunkIds = useMemo(
    () => new Set(visibleChunks.map((chunkCoordinate) => chunkCoordinateToId(chunkCoordinate))),
    [visibleChunks]
  );
  const visibleEntities = useMemo(
    () => sortEntitiesForRendering(filterVisibleEntities(trackedEntities, visibleChunkIds)),
    [trackedEntities, visibleChunkIds]
  );
  const entitiesByChunk = useMemo(() => indexEntitiesByChunk(trackedEntities), [trackedEntities]);
  const overlappingPairs = useMemo(() => detectEntityOverlaps(trackedEntities), [trackedEntities]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(primaryEntity.id);

  useEffect(() => {
    if (!selectedWorldPoint) {
      return;
    }

    const pickedEntity = pickEntityAtWorldPoint(trackedEntities, selectedWorldPoint);

    if (pickedEntity) {
      setSelectedEntityId(pickedEntity.id);
    }
  }, [selectedWorldPoint, trackedEntities]);

  const selectedEntity =
    trackedEntities.find((entity) => entity.id === selectedEntityId) ?? primaryEntity;

  return {
    entitiesByChunk,
    overlappingPairs,
    selectedEntity: presentEntitySelection(selectedEntity, selectedEntityId),
    trackedEntities,
    visibleEntities: visibleEntities.map((entity) => presentEntitySelection(entity, selectedEntityId))
  };
}
