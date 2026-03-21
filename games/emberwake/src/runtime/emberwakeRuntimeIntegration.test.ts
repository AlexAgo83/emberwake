import { describe, expect, it } from "vitest";

import {
  createEmberwakeRuntimeRunner,
  createEngineInputFrameFromControlState
} from "./emberwakeRuntimeRunner";
import { emberwakeGameModule, entitySimulationContract } from "./emberwakeGameModule";
import { createInitialEmberwakeGameState } from "./emberwakeGameModule";
import { entityContract } from "../content/entities/entityContract";

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
    expect(presentation.entities[0]).toMatchObject({
      id: nextState.simulation.entity.id,
      worldPosition: nextState.simulation.entity.worldPosition
    });
    expect(presentation.diagnostics).toMatchObject({
      combatState: "dormant",
      gameplayOutcome: "none",
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
    expect(snapshot.presentation.entities[0].worldPosition).toEqual(
      snapshot.state.simulation.entity.worldPosition
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
});
