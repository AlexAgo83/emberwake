import { officialDebugScenario } from "@game/content/scenarios/officialDebugScenario";
import { createDefaultRuntimeSessionState } from "../../shared/lib/runtimeSessionStorage";

export const runtimeFixtureCatalog = {
  browserSmoke: {
    desktopViewport: {
      height: 800,
      width: 1280
    },
    expectedPlayerEntityId: officialDebugScenario.playerEntity.id,
    movementDurationMs: 400,
    movementKey: "ArrowRight" as const
  },
  deterministicRuntime: {
    scenarioId: officialDebugScenario.id,
    supportEntityCount: officialDebugScenario.supportEntities.length,
    worldSeed: createDefaultRuntimeSessionState().worldSeed
  }
} as const;

export const createDeterministicRuntimeSessionFixture = () => createDefaultRuntimeSessionState();
