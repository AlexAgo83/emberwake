import { describe, expect, it } from "vitest";

import {
  createEmberwakeRuntimeRunner,
  createEngineInputFrameFromControlState
} from "./emberwakeRuntimeRunner";
import { emberwakeGameModule, entitySimulationContract } from "./emberwakeGameModule";
import { createInitialEmberwakeGameState } from "./emberwakeGameModule";
import { createGenericMoverEntity } from "../content/entities/entityContract";
import { entityContract } from "../content/entities/entityContract";
import { hostileCombatContract } from "./hostileCombatContract";

const activeRightControlState = {
  controlledEntityId: entityContract.primaryEntityId,
  debugCameraModifierActive: false,
  inputOwner: "player-entity" as const,
  movementIntent: {
    isActive: true,
    magnitude: 1,
    source: "keyboard" as const,
    vector: {
      x: 1,
      y: 0
    }
  }
};

describe("Emberwake runtime integration", () => {
  it("preserves the input to action to update to present chain through the game module", () => {
    const initialState = emberwakeGameModule.initialize({
      context: undefined,
      init: undefined
    });
    const input = createEngineInputFrameFromControlState(activeRightControlState);
    const action = emberwakeGameModule.mapInput({
      context: undefined,
      input,
      state: initialState
    });
    const nextState = emberwakeGameModule.update({
      action,
      context: undefined,
      state: initialState,
      timing: {
        deltaMs: entitySimulationContract.fixedStepMs,
        fixedStepMs: entitySimulationContract.fixedStepMs,
        nowMs: 0,
        tick: 0
      }
    });
    const presentation = emberwakeGameModule.present({
      context: undefined,
      state: nextState
    });

    expect(action.controlState.inputOwner).toBe("player-entity");
    expect(nextState.simulation.entity.state).toBe("moving");
    expect(nextState.systems.progression.runtimeTicksSurvived).toBe(1);
    expect(nextState.simulation.entity.worldPosition.x).toBeGreaterThan(
      initialState.simulation.entity.worldPosition.x
    );
    expect(presentation.cameraTarget?.worldPosition).toEqual(
      nextState.simulation.entity.worldPosition
    );
    expect(presentation.entities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: nextState.simulation.entity.id,
          worldPosition: nextState.simulation.entity.worldPosition
        })
      ])
    );
    expect(presentation.entities[0]).toMatchObject({
      id: nextState.simulation.entity.id,
      worldPosition: nextState.simulation.entity.worldPosition
    });
    expect(presentation.diagnostics).toMatchObject({
      combatState: "dormant",
      hostileCount: 0,
      gameplayOutcome: "none",
      playerHealth: 100,
      progressionTicksSurvived: 1
    });
    expect(presentation.overlays?.runtimeOutcome).toMatchObject({
      kind: "none",
      shellScene: "none"
    });
  });

  it("advances the live runtime through the engine-owned runner", () => {
    const runner = createEmberwakeRuntimeRunner();

    runner.setInputFrame(createEngineInputFrameFromControlState(activeRightControlState));
    runner.advanceFrame(0, "pixi-ticker-master");
    runner.advanceFrame(entitySimulationContract.fixedStepMs + 1, "pixi-ticker-master");

    const snapshot = runner.getSnapshot();

    expect(snapshot.timing.tick).toBe(1);
    expect(snapshot.runtime.schedulerMode).toBe("pixi-ticker-master");
    expect(snapshot.runtime.simulationStepsLastFrame).toBe(1);
    expect(snapshot.runtime.simulationStepsTotal).toBe(1);
    expect(snapshot.runtime.visualFrameCount).toBe(2);
    expect(snapshot.state.systems.progression.runtimeTicksSurvived).toBe(1);
    expect(snapshot.state.simulation.entity.worldPosition.x).toBeGreaterThan(0);
    expect(snapshot.presentation.entities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: snapshot.state.simulation.entity.id,
          worldPosition: snapshot.state.simulation.entity.worldPosition
        })
      ])
    );
  });

  it("records dropped frame time when frame time exceeds the fixed-step clamp", () => {
    const runner = createEmberwakeRuntimeRunner();

    runner.setInputFrame(createEngineInputFrameFromControlState(activeRightControlState));
    runner.advanceFrame(0, "pixi-ticker-master");
    runner.advanceFrame(entitySimulationContract.fixedStepMs * 20, "pixi-ticker-master");

    const snapshot = runner.getSnapshot();

    expect(snapshot.runtime.framesWithDroppedFrameTime).toBe(1);
    expect(snapshot.runtime.droppedFrameTimeMsTotal).toBeGreaterThan(0);
    expect(snapshot.runtime.maxDroppedFrameTimeMs).toBeGreaterThan(0);
    expect(snapshot.runtime.framesWithDroppedSimulationDebt).toBe(0);
    expect(snapshot.runtime.simulationStepsLastFrame).toBeGreaterThanOrEqual(3);
  });

  it("records dropped simulation debt when catch-up saturates under an elevated speed multiplier", () => {
    const runner = createEmberwakeRuntimeRunner();

    runner.setSpeedMultiplier(2);
    runner.setInputFrame(createEngineInputFrameFromControlState(activeRightControlState));
    runner.advanceFrame(0, "pixi-ticker-master");
    runner.advanceFrame(entitySimulationContract.fixedStepMs * 4, "pixi-ticker-master");

    const snapshot = runner.getSnapshot();

    expect(snapshot.runtime.framesWithDroppedSimulationDebt).toBe(1);
    expect(snapshot.runtime.droppedSimulationDebtMsTotal).toBeGreaterThan(0);
    expect(snapshot.runtime.maxDroppedSimulationDebtMs).toBeGreaterThan(0);
    expect(snapshot.runtime.simulationStepsLastFrame).toBeGreaterThanOrEqual(
      entitySimulationContract.maxCatchUpStepsPerFrame - 1
    );
    expect(snapshot.runtime.simulationStepsLastFrame).toBeLessThanOrEqual(
      entitySimulationContract.maxCatchUpStepsPerFrame
    );
  });

  it("restores the runtime from a provided initial game state", () => {
    const restoredState = createInitialEmberwakeGameState();
    restoredState.simulation.tick = 12;
    restoredState.simulation.entity.worldPosition = { x: 320, y: -96 };
    restoredState.systems.progression.runtimeTicksSurvived = 12;

    const runner = createEmberwakeRuntimeRunner(restoredState);
    const snapshot = runner.getSnapshot();

    expect(snapshot.state.simulation.tick).toBe(12);
    expect(snapshot.state.simulation.entity.worldPosition).toEqual({ x: 320, y: -96 });
    expect(snapshot.state.systems.progression.runtimeTicksSurvived).toBe(12);
  });

  it("normalizes a legacy restored runtime state that only persisted the primary entity", () => {
    const legacyState = createInitialEmberwakeGameState();

    // Simulate a pre-combat save shape persisted before multi-entity runtime state existed.
    (legacyState.simulation as unknown as { entities?: unknown; nextHostileSequence?: unknown }).entities =
      undefined;
    (legacyState.simulation as unknown as { nextHostileSequence?: unknown }).nextHostileSequence =
      undefined;
    (legacyState.simulation.entity as unknown as { combat?: unknown; role?: unknown }).combat =
      undefined;
    (legacyState.simulation.entity as unknown as { combat?: unknown; role?: unknown }).role =
      undefined;

    const runner = createEmberwakeRuntimeRunner(legacyState);
    const snapshot = runner.getSnapshot();

    expect(snapshot.state.simulation.entities).toHaveLength(1);
    expect(snapshot.state.simulation.entity.role).toBe("player");
    expect(snapshot.state.simulation.entity.combat.currentHealth).toBe(100);
    expect(snapshot.presentation.entities).toHaveLength(1);
    expect(snapshot.presentation.diagnostics).toMatchObject({
      hostileCount: 0,
      playerHealth: 100
    });
  });

  it("emits a defeat outcome when hostile contact reduces the player to zero health", () => {
    const state = createInitialEmberwakeGameState();

    state.simulation.entity = {
      ...state.simulation.entity,
      automaticAttack: {
        ...state.simulation.entity.automaticAttack!,
        lastAttackTick: 0
      },
      combat: {
        ...state.simulation.entity.combat,
        currentHealth: hostileCombatContract.hostile.contactDamage
      }
    };
    state.simulation.entities = [
      state.simulation.entity,
      {
        ...createGenericMoverEntity({
          id: "entity:hostile:overlap",
          visual: {
            kind: "debug-sentinel",
            tint: "#ff6d78"
          },
          worldPosition: {
            x: -20,
            y: 0
          }
        }),
        combat: {
          currentHealth: hostileCombatContract.hostile.maxHealth,
          maxHealth: hostileCombatContract.hostile.maxHealth
        },
        contactDamageProfile: {
          cooldownTicks: hostileCombatContract.hostile.contactDamageCooldownTicks,
          damage: hostileCombatContract.hostile.contactDamage,
          lastDamageTick: null
        },
        focusState: {
          acquisitionRadiusWorldUnits: hostileCombatContract.hostile.acquisitionRadiusWorldUnits,
          targetEntityId: null
        },
        movementSurfaceModifier: "normal",
        role: "hostile" as const,
        spawnedAtTick: 0,
        state: "idle" as const,
        velocity: {
          x: 0,
          y: 0
        }
      }
    ];
    state.simulation.nextHostileSequence = 1;
    state.simulation.tick = 1;

    const nextState = emberwakeGameModule.update({
      action: {
        controlState: {
          controlledEntityId: entityContract.primaryEntityId,
          debugCameraModifierActive: false,
          inputOwner: "none",
          movementIntent: {
            isActive: false,
            magnitude: 0,
            source: "none",
            vector: {
              x: 0,
              y: 0
            }
          }
        }
      },
      context: undefined,
      state,
      timing: {
        deltaMs: entitySimulationContract.fixedStepMs,
        fixedStepMs: entitySimulationContract.fixedStepMs,
        nowMs: entitySimulationContract.fixedStepMs,
        tick: 1
      }
    });

    expect(nextState.simulation.entity.combat.currentHealth).toBe(0);
    expect(nextState.systems.outcome.kind).toBe("defeat");
    expect(nextState.systems.outcome.shellScene).toBe("defeat");
  });
});
