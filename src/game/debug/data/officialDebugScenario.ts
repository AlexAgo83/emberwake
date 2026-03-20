import { createDefaultCameraState } from "@engine/camera/cameraMath";
import type { CameraState } from "@engine/camera/cameraMath";
import { entityContract } from "../../entities/model/entityContract";
import type { EntityArchetypeId, EntityVisualKind } from "../../entities/data/entityData";
import { entityArchetypeDefinitions, entityVisualDefinitions } from "../../entities/data/entityData";
import { chunkWorldSize, worldContract } from "../../world/model/worldContract";
import { terrainDefinitions } from "../../world/data/worldData";
import { assetCatalog } from "../../../assets/assetCatalog";
import { dataAuthoringContract } from "../../../shared/config/dataAuthoringContract";
import type { WorldPoint } from "@engine/geometry/primitives";

type ScenarioEntityBlueprint = {
  archetype: EntityArchetypeId;
  id: string;
  tint: string;
  visualKind: EntityVisualKind;
  worldPosition: WorldPoint;
};

export type DebugScenario = {
  cameraState: CameraState;
  description: string;
  id: string;
  playerEntity: ScenarioEntityBlueprint;
  referenceTerrainKinds: Array<keyof typeof terrainDefinitions>;
  supportEntities: readonly ScenarioEntityBlueprint[];
  worldSeed: string;
};

const createScenarioEntityBlueprint = (
  entityBlueprint: ScenarioEntityBlueprint
): ScenarioEntityBlueprint => {
  if (!(entityBlueprint.archetype in entityArchetypeDefinitions)) {
    throw new Error(`Unknown entity archetype in scenario: ${entityBlueprint.archetype}`);
  }

  if (!(entityBlueprint.visualKind in entityVisualDefinitions)) {
    throw new Error(`Unknown entity visual kind in scenario: ${entityBlueprint.visualKind}`);
  }

  return entityBlueprint;
};

export const officialDebugScenario: DebugScenario = {
  cameraState: createDefaultCameraState(),
  description:
    "Canonical single-entity traversal scenario used by runtime, docs, and automated tests.",
  id: "scenario.debug.single-entity-traversal",
  playerEntity: createScenarioEntityBlueprint({
    archetype: "generic-mover",
    id: entityContract.primaryEntityId,
    tint: "#ff7b3f",
    visualKind: "ember-core",
    worldPosition: {
      x: 0,
      y: 0
    }
  }),
  referenceTerrainKinds: ["ashfield", "emberplain", "glowfen", "obsidian"],
  supportEntities: [
    createScenarioEntityBlueprint({
      archetype: "generic-mover",
      id: "entity:debug:sentinel",
      tint: "#4ce2ff",
      visualKind: "debug-sentinel",
      worldPosition: {
        x: -chunkWorldSize * 0.75,
        y: -chunkWorldSize * 0.3
      }
    }),
    createScenarioEntityBlueprint({
      archetype: "generic-mover",
      id: "entity:debug:anchor",
      tint: "#ffd36e",
      visualKind: "debug-anchor",
      worldPosition: {
        x: chunkWorldSize * 0.55,
        y: chunkWorldSize * 0.1
      }
    }),
    createScenarioEntityBlueprint({
      archetype: "generic-mover",
      id: "entity:debug:watcher",
      tint: "#d88cff",
      visualKind: "debug-watcher",
      worldPosition: {
        x: chunkWorldSize * 1.25,
        y: -chunkWorldSize * 0.45
      }
    }),
    createScenarioEntityBlueprint({
      archetype: "generic-mover",
      id: "entity:debug:drifter",
      tint: "#9fff7a",
      visualKind: "debug-drifter",
      worldPosition: {
        x: -chunkWorldSize * 1.1,
        y: chunkWorldSize * 0.95
      }
    })
  ],
  worldSeed: worldContract.defaultSeed
};

export const debugScenarioAuthoringContract = {
  officialScenarioId: officialDebugScenario.id,
  referenceOwnership: dataAuthoringContract.crossDomainReferences,
  runtimeRole: "shared-by-runtime-tests-and-debug-inspection",
  validationMode: "module-load-assertions-and-tests"
} as const;

export const validateOfficialDebugScenario = () => {
  const referencedAssetIds = [
    entityVisualDefinitions[officialDebugScenario.playerEntity.visualKind].assetId,
    ...officialDebugScenario.supportEntities.map(
      (entityBlueprint) => entityVisualDefinitions[entityBlueprint.visualKind].assetId
    )
  ];

  for (const terrainKind of officialDebugScenario.referenceTerrainKinds) {
    const terrainDefinition = terrainDefinitions[terrainKind];

    if (!(terrainDefinition.assetId in assetCatalog.map)) {
      throw new Error(`Unknown map asset in debug scenario: ${terrainDefinition.assetId}`);
    }
  }

  for (const assetId of referencedAssetIds) {
    if (!(assetId in assetCatalog.entities)) {
      throw new Error(`Unknown entity asset in debug scenario: ${assetId}`);
    }
  }
};

validateOfficialDebugScenario();
