import type { WorldPoint } from "../../world/types";

export const entityContract = {
  defaultArchetype: "generic-mover",
  defaultRenderLayer: 100,
  defaultState: "idle",
  defaultVisualKind: "ember-core"
} as const;

export type EntityState = "idle" | "inactive" | "moving" | "selected";

export type WorldEntity = {
  archetype: typeof entityContract.defaultArchetype;
  footprint: {
    radius: number;
  };
  id: string;
  orientation: number;
  renderLayer: number;
  state: EntityState;
  visual: {
    kind: typeof entityContract.defaultVisualKind;
    tint: string;
  };
  worldPosition: WorldPoint;
};

export const createGenericMoverEntity = (
  overrides: Partial<WorldEntity> = {}
): WorldEntity => ({
  archetype: entityContract.defaultArchetype,
  footprint: {
    radius: 40
  },
  id: "entity:player:primary",
  orientation: 0,
  renderLayer: entityContract.defaultRenderLayer,
  state: entityContract.defaultState,
  visual: {
    kind: entityContract.defaultVisualKind,
    tint: "#ff7b3f"
  },
  worldPosition: {
    x: 0,
    y: 0
  },
  ...overrides
});
