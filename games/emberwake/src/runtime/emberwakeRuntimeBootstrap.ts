import { createDefaultCameraState } from "@engine/camera/cameraMath";
import type { CameraState } from "@engine/camera/cameraMath";
import type { WorldPoint } from "@engine/geometry/primitives";
import { chunkWorldSize, worldContract } from "@engine/world/worldContract";
import {
  createGenericMoverEntity,
  entityContract
} from "@game/content/entities/entityContract";
import type {
  EntityArchetypeId,
  EntityVisualKind
} from "@game/content/entities/entityData";
import type { EntityState } from "@game/content/entities/entityContract";
import type { SimulatedEntity } from "@game/runtime/entitySimulation";

type RuntimeEntityBlueprint = {
  archetype: EntityArchetypeId;
  id: string;
  tint: string;
  visualKind: EntityVisualKind;
  worldPosition: WorldPoint;
};

type EmberwakeRuntimeBootstrap = {
  cameraState: CameraState;
  playerEntity: RuntimeEntityBlueprint;
  supportEntities: readonly RuntimeEntityBlueprint[];
  worldSeed: string;
};

const createScenarioEntity = (
  entityBlueprint: RuntimeEntityBlueprint,
  state: EntityState
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

export const emberwakeRuntimeBootstrap: EmberwakeRuntimeBootstrap = {
  cameraState: createDefaultCameraState(),
  playerEntity: {
    archetype: "generic-mover",
    id: entityContract.primaryEntityId,
    tint: "#ff7b3f",
    visualKind: "ember-core",
    worldPosition: {
      x: 0,
      y: 0
    }
  },
  supportEntities: [
    {
      archetype: "generic-mover",
      id: "entity:runtime:sentinel",
      tint: "#4ce2ff",
      visualKind: "debug-sentinel",
      worldPosition: {
        x: -chunkWorldSize * 0.75,
        y: -chunkWorldSize * 0.3
      }
    },
    {
      archetype: "generic-mover",
      id: "entity:runtime:anchor",
      tint: "#ffd36e",
      visualKind: "debug-anchor",
      worldPosition: {
        x: chunkWorldSize * 0.55,
        y: chunkWorldSize * 0.1
      }
    },
    {
      archetype: "generic-mover",
      id: "entity:runtime:watcher",
      tint: "#d88cff",
      visualKind: "debug-watcher",
      worldPosition: {
        x: chunkWorldSize * 1.25,
        y: -chunkWorldSize * 0.45
      }
    },
    {
      archetype: "generic-mover",
      id: "entity:runtime:drifter",
      tint: "#9fff7a",
      visualKind: "debug-drifter",
      worldPosition: {
        x: -chunkWorldSize * 1.1,
        y: chunkWorldSize * 0.95
      }
    }
  ],
  worldSeed: worldContract.defaultSeed
};

export const deterministicRuntimeSupportEntities: readonly SimulatedEntity[] =
  emberwakeRuntimeBootstrap.supportEntities.map((entityBlueprint, index) =>
    createScenarioEntity(
      entityBlueprint,
      index === 0 ? "inactive" : index === 2 ? "moving" : "idle"
    )
  );

export const createDeterministicRuntimeSupportEntities = () =>
  deterministicRuntimeSupportEntities;
