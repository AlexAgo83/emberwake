import { chunkWorldSize } from "../../world/model/worldContract";
import { createGenericMoverEntity } from "./entityContract";
import {
  filterVisibleEntities,
  indexEntitiesByChunk,
  pickEntityAtWorldPoint,
  sortEntitiesForRendering
} from "./entitySpatialIndex";
import type { SimulatedEntity } from "./entitySimulation";

const createSimulatedEntity = (
  id: string,
  x: number,
  y: number,
  renderLayer = 100
): SimulatedEntity => ({
  ...createGenericMoverEntity({
    id,
    renderLayer,
    worldPosition: {
      x,
      y
    }
  }),
  combat: {
    currentHealth: 100,
    maxHealth: 100
  },
  movementSurfaceModifier: "normal",
  role: "player",
  spawnedAtTick: 0,
  velocity: {
    x: 0,
    y: 0
  }
});

describe("entitySpatialIndex", () => {
  it("indexes entities by chunk without ownership transfer in the entity model", () => {
    const entities = [
      createSimulatedEntity("entity:a", 0, 0),
      createSimulatedEntity("entity:b", chunkWorldSize + 10, 10)
    ];

    const entitiesByChunk = indexEntitiesByChunk(entities);

    expect(entitiesByChunk.get("emberwake-default-seed:0:0")).toHaveLength(1);
    expect(entitiesByChunk.get("emberwake-default-seed:1:0")).toHaveLength(1);
  });

  it("filters visible entities using visible chunk ids", () => {
    const entities = [
      createSimulatedEntity("entity:a", 0, 0),
      createSimulatedEntity("entity:b", chunkWorldSize + 10, 10)
    ];

    const visibleEntities = filterVisibleEntities(entities, new Set(["emberwake-default-seed:1:0"]));

    expect(visibleEntities.map((entity) => entity.id)).toEqual(["entity:b"]);
  });

  it("picks an entity from a world point within its footprint", () => {
    const entity = createSimulatedEntity("entity:a", 100, 100);

    expect(
      pickEntityAtWorldPoint([entity], {
        x: 110,
        y: 110
      })?.id
    ).toBe("entity:a");
  });

  it("sorts entities by render layer then vertical position", () => {
    const entities = [
      createSimulatedEntity("entity:back", 0, 200, 50),
      createSimulatedEntity("entity:front-low", 0, 100, 100),
      createSimulatedEntity("entity:front-high", 0, 300, 100)
    ];

    expect(sortEntitiesForRendering(entities).map((entity) => entity.id)).toEqual([
      "entity:back",
      "entity:front-low",
      "entity:front-high"
    ]);
  });
});
