import { useEffect, useMemo, useState } from "react";

import { createDeterministicRuntimeSupportEntities } from "@game/runtime/emberwakeRuntimeBootstrap";
import { chunkCoordinateToId } from "../../world/model/worldContract";
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
  includeSupportEntities?: boolean;
  primaryEntityId: string;
  simulatedEntities: SimulatedEntity[];
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
  includeSupportEntities = false,
  primaryEntityId,
  simulatedEntities,
  selectedWorldPoint,
  visibleChunks
}: UseEntityWorldOptions): EntityWorldState {
  const trackedEntities = useMemo(() => {
    if (!includeSupportEntities) {
      return simulatedEntities;
    }

    const scenarioEntities = createDeterministicRuntimeSupportEntities();

    return [...simulatedEntities, ...scenarioEntities];
  }, [includeSupportEntities, simulatedEntities]);
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
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(primaryEntityId);

  useEffect(() => {
    if (!selectedWorldPoint) {
      return;
    }

    const pickedEntity = pickEntityAtWorldPoint(trackedEntities, selectedWorldPoint);

    if (pickedEntity) {
      setSelectedEntityId(pickedEntity.id);
    }
  }, [selectedWorldPoint, trackedEntities]);

  const primaryEntity =
    simulatedEntities.find((entity) => entity.id === primaryEntityId) ?? simulatedEntities[0];
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
