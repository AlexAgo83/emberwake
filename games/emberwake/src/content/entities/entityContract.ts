import type { WorldPoint } from "@engine/geometry/primitives";
import type { EntityArchetypeId, EntityVisualKind } from "@game/content/entities/entityData";
import { entityArchetypeDefinitions } from "@game/content/entities/entityData";

export const entityContract = {
  defaultArchetype: "generic-mover",
  primaryEntityId: "entity:player:primary",
  defaultRenderLayer: entityArchetypeDefinitions["generic-mover"].defaultRenderLayer,
  defaultState: entityArchetypeDefinitions["generic-mover"].defaultState,
  defaultVisualKind: entityArchetypeDefinitions["generic-mover"].defaultVisualKind
} as const;

export type EntityState = "idle" | "inactive" | "moving";

export type WorldEntity = {
  archetype: EntityArchetypeId;
  footprint: {
    radius: number;
  };
  id: string;
  orientation: number;
  renderLayer: number;
  state: EntityState;
  visual: {
    kind: EntityVisualKind;
    tint: string;
  };
  worldPosition: WorldPoint;
};

export type PresentedEntity<T extends WorldEntity = WorldEntity> = T & {
  isSelected: boolean;
};

export const createGenericMoverEntity = (
  overrides: Partial<WorldEntity> = {}
): WorldEntity => ({
  archetype: entityContract.defaultArchetype,
  footprint: {
    radius: entityArchetypeDefinitions["generic-mover"].footprintRadius
  },
  id: entityContract.primaryEntityId,
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
