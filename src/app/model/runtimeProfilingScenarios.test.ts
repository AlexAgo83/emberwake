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
    expect(scenarios.find((scenario) => scenario.id === "figure-eight")).toMatchObject({
      autoSelectBuildChoices: true,
      defaultLoop: true,
      speedMultiplier: 1,
      stepCount: 10
    });
    expect(scenarios.find((scenario) => scenario.id === "left-right-pendulum")).toMatchObject({
      autoSelectBuildChoices: true,
      defaultLoop: true,
      speedMultiplier: 2,
      stepCount: 2,
      totalDurationTicks: 600
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

  it("resolves crossover movement for the figure-eight loop", () => {
    const scenario = resolveRuntimeProfilingScenario("figure-eight");

    expect(scenario).not.toBeNull();
    expect(
      resolveRuntimeProfilingScenarioMovement({
        currentTick: 5 * 90 + 10,
        loop: true,
        scenario: scenario!,
        startTick: 0
      })
    ).toMatchObject({
      activeStepIndex: 5,
      stepLabel: "left-loop west",
      vector: { x: -1, y: 0 }
    });
  });

  it("alternates right and left drifts for the pendulum scenario", () => {
    const scenario = resolveRuntimeProfilingScenario("left-right-pendulum");

    expect(scenario).not.toBeNull();
    expect(
      resolveRuntimeProfilingScenarioMovement({
        currentTick: 120,
        loop: true,
        scenario: scenario!,
        startTick: 0
      })
    ).toMatchObject({
      activeStepIndex: 0,
      stepLabel: "right drift",
      vector: { x: 1, y: 0 }
    });
    expect(
      resolveRuntimeProfilingScenarioMovement({
        currentTick: 420,
        loop: true,
        scenario: scenario!,
        startTick: 0
      })
    ).toMatchObject({
      activeStepIndex: 1,
      stepLabel: "left drift",
      vector: { x: -1, y: 0 }
    });
  });
});
