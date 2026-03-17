import { officialDebugScenario } from "../../debug/data/officialDebugScenario";
import { createGenericMoverEntity } from "./entityContract";
import type { SimulatedEntity } from "./entitySimulation";

const createScenarioEntity = (
  entityBlueprint: (typeof officialDebugScenario.supportEntities)[number],
  state: SimulatedEntity["state"]
): SimulatedEntity => ({
  ...createGenericMoverEntity({
    archetype: entityBlueprint.archetype,
    id: entityBlueprint.id,
    state,
    visual: {
      kind: entityBlueprint.visualKind,
      tint: entityBlueprint.tint
    },
    worldPosition: entityBlueprint.worldPosition
  }),
  velocity: {
    x: 0,
    y: 0
  }
});

export const createDeterministicDebugEntities = (): SimulatedEntity[] =>
  officialDebugScenario.supportEntities.map((entityBlueprint, index) =>
    createScenarioEntity(
      entityBlueprint,
      index === 0 ? "inactive" : index === 2 ? "moving" : "idle"
    )
  );
