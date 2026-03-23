import { describe, expect, it } from "vitest";

import { createDefaultCameraState } from "@engine/camera/cameraMath";
import { createInitialEmberwakeGameState } from "@game/runtime/emberwakeGameModule";
import { createInitialBuildState } from "@game/runtime/buildSystem";
import {
  advanceGameplaySystemsState,
  createGameplaySystemDiagnostics,
  createInitialGameplaySystemsState,
  gameplaySystemsContract,
  normalizeGameplaySystemsState
} from "./gameplaySystems";

describe("gameplaySystems", () => {
  it("tracks progression and system seams separately from the raw simulation slice", () => {
    const previousState = createInitialGameplaySystemsState();
    const initialRunStats = createInitialEmberwakeGameState().simulation.runStats;
    const beforeEntity = {
      archetype: "generic-mover" as const,
      combat: {
        currentHealth: 100,
        maxHealth: 100
      },
      footprint: { radius: 40 },
      id: "entity:player:primary",
      movementSurfaceModifier: "normal" as const,
      orientation: 0,
      renderLayer: 100,
      role: "player" as const,
      spawnedAtTick: 0,
      state: "idle" as const,
      velocity: { x: 0, y: 0 },
      visual: {
        kind: "ember-core" as const,
        tint: "#ff7b3f"
      },
      worldPosition: {
        x: 0,
        y: 0
      }
    };
    const afterEntity = {
      ...beforeEntity,
      state: "moving" as const,
      velocity: { x: 10, y: 0 },
      worldPosition: {
        x: 10,
        y: 0
      }
    };
    const nextState = advanceGameplaySystemsState({
      previousState,
      simulationAfterUpdate: {
        buildState: createInitialBuildState(),
        combatSkillFeedbackEvents: [],
        entities: [afterEntity],
        entity: afterEntity,
        floatingDamageNumbers: [],
        nextPickupSequence: 0,
        nextHostileSequence: 0,
        runStats: {
          ...initialRunStats,
          crystalsCollected: 2,
          currentLevel: 1,
          currentXp: 50,
          goldCollected: 0,
          healingKitsCollected: 0,
          hostileDefeats: 0
        },
        tick: 1,
        worldSeed: "emberwake-default-seed"
      },
      simulationBeforeUpdate: {
        buildState: createInitialBuildState(),
        combatSkillFeedbackEvents: [],
        entities: [beforeEntity],
        entity: beforeEntity,
        floatingDamageNumbers: [],
        nextPickupSequence: 0,
        nextHostileSequence: 0,
        runStats: {
          ...initialRunStats,
          crystalsCollected: 0,
          currentLevel: 1,
          currentXp: 0,
          goldCollected: 0,
          healingKitsCollected: 0,
          hostileDefeats: 0
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
    expect(nextState.progression.crystalsCollected).toBe(2);
    expect(nextState.progression.currentXp).toBe(50);
    expect(nextState.autonomy.lastAutonomyTick).toBe(1);
    expect(nextState.lifecycle.lastCompletedPhase).toBe("outcomes");
    expect(nextState.lifecycle.recentSignals).toContain("progression.traversal-recorded");
    expect(nextState.outcome.kind).toBe("none");
    expect(createGameplaySystemDiagnostics(nextState)).toMatchObject({
      activeStatusEffects: 0,
      combatState: "dormant",
      currentXp: 50,
      gameplayOutcome: "none",
      nextLevelXpRequired: 160,
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

  it("normalizes partially persisted system state so new fields do not crash diagnostics", () => {
    const normalizedState = normalizeGameplaySystemsState({
      progression: {
        currentLevel: 4,
        currentXp: 275
      },
      outcome: {
        kind: "defeat"
      }
    } as Partial<ReturnType<typeof createInitialGameplaySystemsState>>);

    expect(normalizedState.progression.currentLevel).toBe(4);
    expect(normalizedState.progression.currentXp).toBe(275);
    expect(normalizedState.progression.discoveredCreatureIds).toEqual([]);
    expect(normalizedState.outcome.kind).toBe("defeat");
    expect(normalizedState.outcome.skillPerformanceSummaries).toEqual([]);
    expect(createGameplaySystemDiagnostics(normalizedState).discoveredCreatureCount).toBe(0);
  });
});
