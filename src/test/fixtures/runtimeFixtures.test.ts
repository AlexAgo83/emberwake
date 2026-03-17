import { describe, expect, it } from "vitest";

import {
  createDeterministicRuntimeSessionFixture,
  runtimeFixtureCatalog
} from "./runtimeFixtures";

describe("runtimeFixtureCatalog", () => {
  it("keeps deterministic runtime expectations aligned with the official scenario", () => {
    expect(runtimeFixtureCatalog.deterministicRuntime.scenarioId).toBe(
      "scenario.debug.single-entity-traversal"
    );
    expect(runtimeFixtureCatalog.deterministicRuntime.supportEntityCount).toBe(4);
  });

  it("provides browser-smoke defaults tied to the deterministic runtime", () => {
    expect(createDeterministicRuntimeSessionFixture().worldSeed).toBe(
      runtimeFixtureCatalog.deterministicRuntime.worldSeed
    );
    expect(runtimeFixtureCatalog.browserSmoke.expectedPlayerEntityId).toBe(
      "entity:player:primary"
    );
  });
});
