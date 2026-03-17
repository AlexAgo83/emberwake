import { useEffect, useMemo, useState } from "react";

import { chunkCoordinateToId } from "../../world/model/worldContract";
import { createDeterministicDebugEntities } from "../model/entityDebugScenario";
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
  selectedEntity: SimulatedEntity;
  trackedEntities: SimulatedEntity[];
  visibleEntities: SimulatedEntity[];
};

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
    selectedEntity: {
      ...selectedEntity,
      state: selectedEntity.id === selectedEntityId ? "selected" : selectedEntity.state
    },
    trackedEntities,
    visibleEntities: visibleEntities.map((entity) =>
      entity.id === selectedEntityId
        ? {
            ...entity,
            state: "selected"
          }
        : entity
    )
  };
}
