import { describe, expect, it } from "vitest";

import { createDefaultCameraState } from "@engine/camera/cameraMath";
import {
  advanceGameplaySystemsState,
  createGameplaySystemDiagnostics,
  createInitialGameplaySystemsState,
  gameplaySystemsContract
} from "./gameplaySystems";

describe("gameplaySystems", () => {
  it("tracks progression and system seams separately from the raw simulation slice", () => {
    const previousState = createInitialGameplaySystemsState();
    const nextState = advanceGameplaySystemsState({
      previousState,
      simulationAfterUpdate: {
        entity: {
          archetype: "generic-mover",
          footprint: { radius: 40 },
          id: "entity:player:primary",
          movementSurfaceModifier: "normal",
          orientation: 0,
          renderLayer: 100,
          state: "moving",
          velocity: { x: 10, y: 0 },
          visual: {
            kind: "ember-core",
            tint: "#ff7b3f"
          },
          worldPosition: {
            x: 10,
            y: 0
          }
        },
        tick: 1,
        worldSeed: "emberwake-default-seed"
      },
      simulationBeforeUpdate: {
        entity: {
          archetype: "generic-mover",
          footprint: { radius: 40 },
          id: "entity:player:primary",
          movementSurfaceModifier: "normal",
          orientation: 0,
          renderLayer: 100,
          state: "idle",
          velocity: { x: 0, y: 0 },
          visual: {
            kind: "ember-core",
            tint: "#ff7b3f"
          },
          worldPosition: {
            x: 0,
            y: 0
          }
        },
        tick: 0,
        worldSeed: "emberwake-default-seed"
      },
      timing: {
        deltaMs: 1000 / 60,
        fixedStepMs: 1000 / 60,
        nowMs: 1000 / 60,
        tick: 0
      }
    });

    expect(nextState.progression.runtimeTicksSurvived).toBe(1);
    expect(nextState.progression.traversalDistanceWorldUnits).toBe(10);
    expect(nextState.autonomy.lastAutonomyTick).toBe(1);
    expect(nextState.lifecycle.lastCompletedPhase).toBe("outcomes");
    expect(nextState.lifecycle.recentSignals).toContain("progression.traversal-recorded");
    expect(nextState.outcome.kind).toBe("none");
    expect(createGameplaySystemDiagnostics(nextState)).toMatchObject({
      activeStatusEffects: 0,
      combatState: "dormant",
      gameplayOutcome: "none",
      progressionTicksSurvived: 1
    });
  });

  it("documents gameplay-system ownership without leaking render-adapter concerns", () => {
    expect(gameplaySystemsContract.seams.presentation).toContain("render-adapters");
    expect(gameplaySystemsContract.phaseOrder).toEqual([
      "autonomy",
      "combat",
      "status-effects",
      "progression",
      "outcomes"
    ]);
    expect(gameplaySystemsContract.signalPosture).toContain("narrow-phase-signals");
    expect(createDefaultCameraState().zoom).toBe(1.25);
  });
});
