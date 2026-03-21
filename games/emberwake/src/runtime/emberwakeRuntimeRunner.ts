import type { EngineInputFrame } from "@engine/contracts/gameModule";
import {
  createIdleEngineInputFrame,
  createRuntimeRunner
} from "@engine/runtime/runtimeRunner";
import type { RuntimeRunner } from "@engine/runtime/runtimeRunner";
import type { SingleEntityControlState } from "@game/input/singleEntityControlContract";
import { emberwakeGameModule, entitySimulationContract } from "@game/runtime/emberwakeGameModule";
import type { EmberwakeGameAction, EmberwakeGameState } from "@game/runtime/emberwakeGameModule";

export const createEngineInputFrameFromControlState = (
  controlState?: SingleEntityControlState
): EngineInputFrame => {
  if (!controlState) {
    return createIdleEngineInputFrame();
  }

  return {
    buttons: {},
    debug: {
      modifierActive: controlState.debugCameraModifierActive
    },
    movement: {
      active: controlState.movementIntent.isActive,
      magnitude: controlState.movementIntent.magnitude,
      source: controlState.movementIntent.source,
      vector: {
        x: controlState.movementIntent.vector.x,
        y: controlState.movementIntent.vector.y
      }
    },
    pointer: {
      pressed: false,
      primaryScreenPoint: null,
      primaryWorldPoint: null
    }
  };
};

export const createEmberwakeRuntimeRunner = (
  initialState?: EmberwakeGameState
): RuntimeRunner<
  EmberwakeGameState,
  EmberwakeGameAction,
  EmberwakeGameState | undefined,
  undefined
> =>
  createRuntimeRunner({
    context: undefined,
    fixedStepMs: entitySimulationContract.fixedStepMs,
    init: initialState,
    maxCatchUpStepsPerFrame: entitySimulationContract.maxCatchUpStepsPerFrame,
    module: emberwakeGameModule
  });
