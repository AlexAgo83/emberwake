import {
  advanceSimulationState,
  createInitialSimulationState,
  entitySimulationContract,
  getScriptedEntityPhase
} from "./entitySimulation";
import { entityContract } from "./entityContract";
import { singleEntityControlContract } from "../../input/model/singleEntityControlContract";

describe("entitySimulation", () => {
  it("starts from a deterministic idle state", () => {
    const simulationState = createInitialSimulationState();

    expect(simulationState.tick).toBe(0);
    expect(simulationState.entity.state).toBe("idle");
    expect(simulationState.entity.velocity).toEqual({ x: 0, y: 0 });
  });

  it("exposes deterministic scripted phases", () => {
    expect(getScriptedEntityPhase(0).state).toBe("idle");
    expect(getScriptedEntityPhase(80).velocity).toEqual({ x: 120, y: 0 });
    expect(getScriptedEntityPhase(260).velocity).toEqual({ x: 0, y: 120 });
  });

  it("advances entities in continuous world space with a fixed step", () => {
    let simulationState = createInitialSimulationState();

    for (let step = 0; step < 80; step += 1) {
      simulationState = advanceSimulationState(simulationState);
    }

    expect(simulationState.tick).toBe(80);
    expect(simulationState.entity.state).toBe("moving");
    expect(simulationState.entity.worldPosition.x).toBeCloseTo(
      20 * 120 * (entitySimulationContract.fixedStepMs / 1000)
    );
    expect(simulationState.entity.worldPosition.y).toBeCloseTo(0);
  });

  it("updates orientation from velocity while preserving it during idle phases", () => {
    let simulationState = createInitialSimulationState();

    for (let step = 0; step < 200; step += 1) {
      simulationState = advanceSimulationState(simulationState);
    }

    expect(simulationState.entity.orientation).toBeCloseTo(0);

    for (let step = 0; step < 120; step += 1) {
      simulationState = advanceSimulationState(simulationState);
    }

    expect(simulationState.entity.orientation).toBeCloseTo(Math.PI / 2);
  });

  it("lets the controlled entity override scripted motion with direct movement intent", () => {
    const simulationState = advanceSimulationState(createInitialSimulationState(), {
      controlState: {
        controlledEntityId: entityContract.primaryEntityId,
        debugCameraModifierActive: false,
        inputOwner: singleEntityControlContract.ownership.controlledEntity,
        movementIntent: {
          isActive: true,
          magnitude: 1,
          source: "keyboard",
          vector: {
            x: 0,
            y: -1
          }
        }
      }
    });

    expect(simulationState.entity.state).toBe("moving");
    expect(simulationState.entity.velocity).toEqual({
      x: 0,
      y: -singleEntityControlContract.desktopMoveSpeedWorldUnitsPerSecond
    });
    expect(simulationState.entity.worldPosition.y).toBeCloseTo(
      -singleEntityControlContract.desktopMoveSpeedWorldUnitsPerSecond *
        (entitySimulationContract.fixedStepMs / 1000)
    );
    expect(simulationState.entity.orientation).toBeCloseTo(-Math.PI / 2);
  });
});
