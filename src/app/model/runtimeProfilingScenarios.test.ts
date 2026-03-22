import { describe, expect, it } from "vitest";

import {
  listRuntimeProfilingScenarios,
  resolveRuntimeProfilingScenario,
  resolveRuntimeProfilingScenarioMovement
} from "./runtimeProfilingScenarios";

describe("runtimeProfilingScenarios", () => {
  it("lists profiling scenarios with stable metadata", () => {
    const scenarios = listRuntimeProfilingScenarios();

    expect(scenarios.find((scenario) => scenario.id === "traversal-baseline")).toMatchObject({
      defaultLoop: true,
      recommendedConfig: {
        playerInvincible: true,
        spawnMode: "normal"
      }
    });
  });

  it("resolves movement for a declarative scenario timeline", () => {
    const scenario = resolveRuntimeProfilingScenario("square-loop");

    expect(scenario).not.toBeNull();
    expect(
      resolveRuntimeProfilingScenarioMovement({
        currentTick: 190,
        loop: true,
        scenario: scenario!,
        startTick: 0
      })
    ).toMatchObject({
      activeStepIndex: 1,
      stepLabel: "south"
    });
  });
});
