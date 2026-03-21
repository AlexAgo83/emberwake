import { assetCatalog } from "@src/assets/assetCatalog";

import {
  entityArchetypeDefinitions,
  entityVisualDefinitions
} from "./entities/entityData";
import {
  officialDebugScenario,
  validateOfficialDebugScenario
} from "./scenarios/officialDebugScenario";
import { terrainDefinitions } from "./world/worldData";

export const emberwakeContentAuthoringContract = {
  authoringModel: "typed-module-owned-content-catalogs",
  idNamespaces: {
    entities: "entity:*",
    scenarios: "scenario.*",
    visuals: "entityVisualDefinitions keys",
    worldTerrain: "terrainDefinitions keys"
  },
  ownership: {
    gameplayContent: "games/emberwake/src/content",
    sharedAssets: "src/assets/assetCatalog"
  },
  validation: {
    execution: "module-load-and-vitest",
    posture: "cross-catalog-reference-checks-and-unique-id-assertions"
  }
} as const;

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const validateEmberwakeContentAuthoring = () => {
  for (const [visualKind, visualDefinition] of Object.entries(entityVisualDefinitions)) {
    assert(
      visualDefinition.assetId in assetCatalog.entities,
      `Unknown entity asset in visual definition: ${visualKind} -> ${visualDefinition.assetId}`
    );
  }

  for (const [archetypeId, archetypeDefinition] of Object.entries(entityArchetypeDefinitions)) {
    assert(
      archetypeDefinition.defaultVisualKind in entityVisualDefinitions,
      `Unknown default visual kind in archetype definition: ${archetypeId} -> ${archetypeDefinition.defaultVisualKind}`
    );
  }

  for (const [terrainKind, terrainDefinition] of Object.entries(terrainDefinitions)) {
    assert(
      terrainDefinition.assetId in assetCatalog.map,
      `Unknown map asset in terrain definition: ${terrainKind} -> ${terrainDefinition.assetId}`
    );
  }

  const scenarioEntityIds = new Set<string>();
  const scenarioEntities = [
    officialDebugScenario.playerEntity,
    ...officialDebugScenario.supportEntities
  ];

  for (const entityBlueprint of scenarioEntities) {
    assert(
      entityBlueprint.archetype in entityArchetypeDefinitions,
      `Unknown archetype in scenario entity: ${entityBlueprint.id} -> ${entityBlueprint.archetype}`
    );
    assert(
      entityBlueprint.visualKind in entityVisualDefinitions,
      `Unknown visual kind in scenario entity: ${entityBlueprint.id} -> ${entityBlueprint.visualKind}`
    );
    assert(
      entityBlueprint.id.startsWith("entity:"),
      `Scenario entity ids must stay in the entity namespace: ${entityBlueprint.id}`
    );
    assert(
      !scenarioEntityIds.has(entityBlueprint.id),
      `Duplicate entity id in content authoring graph: ${entityBlueprint.id}`
    );
    scenarioEntityIds.add(entityBlueprint.id);
  }

  assert(
    officialDebugScenario.id.startsWith("scenario."),
    `Scenario ids must stay in the scenario namespace: ${officialDebugScenario.id}`
  );

  for (const terrainKind of officialDebugScenario.referenceTerrainKinds) {
    assert(
      terrainKind in terrainDefinitions,
      `Unknown terrain reference in scenario: ${terrainKind}`
    );
  }

  validateOfficialDebugScenario();
};

validateEmberwakeContentAuthoring();
