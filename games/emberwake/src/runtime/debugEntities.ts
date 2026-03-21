import { createGenericMoverEntity } from "@game/content/entities/entityContract";
import { officialDebugScenario } from "@game/content/scenarios/officialDebugScenario";
import type { SimulatedEntity } from "@game/runtime/entitySimulation";

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
  combat: {
    currentHealth: 1,
    maxHealth: 1
  },
  movementSurfaceModifier: "normal",
  role: "support",
  spawnedAtTick: 0,
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
