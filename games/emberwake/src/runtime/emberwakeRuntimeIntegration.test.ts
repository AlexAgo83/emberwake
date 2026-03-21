import { describe, expect, it } from "vitest";

import {
  createEmberwakeRuntimeRunner,
  createEngineInputFrameFromControlState
} from "./emberwakeRuntimeRunner";
import { emberwakeGameModule, entitySimulationContract } from "./emberwakeGameModule";
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
});
