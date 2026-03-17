import { describe, expect, it } from "vitest";

import {
  debugScenarioAuthoringContract,
  officialDebugScenario,
  validateOfficialDebugScenario
} from "./officialDebugScenario";
import { entityVisualDefinitions } from "../../entities/data/entityData";

describe("officialDebugScenario", () => {
  it("stays deterministic and canonical for the first runtime loop", () => {
    expect(officialDebugScenario.id).toBe(debugScenarioAuthoringContract.officialScenarioId);
    expect(officialDebugScenario.playerEntity.id).toBe("entity:player:primary");
    expect(officialDebugScenario.supportEntities).toHaveLength(4);
  });

  it("resolves entity visuals and assets through typed references", () => {
    const assetIds = officialDebugScenario.supportEntities.map(
      (entityBlueprint) => entityVisualDefinitions[entityBlueprint.visualKind].assetId
    );

    expect(assetIds).toContain("entity.debug.anchor.placeholder");
    expect(() => validateOfficialDebugScenario()).not.toThrow();
  });
});
