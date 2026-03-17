import { chunkWorldSize } from "../../world/model/worldContract";
import { createGenericMoverEntity } from "./entityContract";
import type { SimulatedEntity } from "./entitySimulation";

const createScenarioEntity = (
  id: string,
  worldX: number,
  worldY: number,
  tint: string,
  state: SimulatedEntity["state"]
): SimulatedEntity => ({
  ...createGenericMoverEntity({
    id,
    state,
    visual: {
      kind: "ember-core",
      tint
    },
    worldPosition: {
      x: worldX,
      y: worldY
    }
  }),
  velocity: {
    x: 0,
    y: 0
  }
});

export const createDeterministicDebugEntities = (): SimulatedEntity[] => [
  createScenarioEntity("entity:debug:sentinel", -chunkWorldSize * 0.75, -chunkWorldSize * 0.3, "#4ce2ff", "inactive"),
  createScenarioEntity("entity:debug:anchor", chunkWorldSize * 0.55, chunkWorldSize * 0.1, "#ffd36e", "idle"),
  createScenarioEntity("entity:debug:watcher", chunkWorldSize * 1.25, -chunkWorldSize * 0.45, "#d88cff", "moving"),
  createScenarioEntity("entity:debug:drifter", -chunkWorldSize * 1.1, chunkWorldSize * 0.95, "#9fff7a", "idle")
];
