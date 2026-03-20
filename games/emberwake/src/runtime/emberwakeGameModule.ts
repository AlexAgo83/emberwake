import type {
  EngineInputFrame,
  EngineInputSource,
  EnginePresentationModel,
  EngineTiming,
  GameModule
} from "@engine/contracts/gameModule";
import { entityContract } from "@src/game/entities/model/entityContract";
import {
  advanceSimulationState,
  createInitialSimulationState,
  entitySimulationContract
} from "@src/game/entities/model/entitySimulation";
import type { EntitySimulationState } from "@src/game/entities/model/entitySimulation";
import type { SingleEntityControlState } from "@src/game/input/model/singleEntityControlContract";

type EmberwakeGameState = {
  simulation: EntitySimulationState;
};

type EmberwakeGameAction = {
  controlState: SingleEntityControlState;
};

const resolveInputOwner = (input: EngineInputFrame): SingleEntityControlState["inputOwner"] => {
  if (input.movement.active) {
    return "player-entity";
  }

  if (input.debug.modifierActive) {
    return "debug-camera";
  }

  return "none";
};

const normalizeInputSource = (
  source: EngineInputSource
): SingleEntityControlState["movementIntent"]["source"] =>
  source === "keyboard" || source === "touch" ? source : "none";

const createControlStateFromInput = (input: EngineInputFrame): SingleEntityControlState => ({
  controlledEntityId: entityContract.primaryEntityId,
  debugCameraModifierActive: input.debug.modifierActive,
  inputOwner: resolveInputOwner(input),
  movementIntent: {
    isActive: input.movement.active,
    magnitude: input.movement.magnitude,
    source: normalizeInputSource(input.movement.source),
    vector: {
      x: input.movement.vector.x,
      y: input.movement.vector.y
    }
  }
});

const createTimingSnapshot = (tick: number): EngineTiming => ({
  deltaMs: entitySimulationContract.fixedStepMs,
  fixedStepMs: entitySimulationContract.fixedStepMs,
  nowMs: tick * entitySimulationContract.fixedStepMs,
  tick
});

const parseTint = (tint: string): number | undefined => {
  const normalizedTint = tint.replace("#", "");

  if (normalizedTint.length === 0) {
    return undefined;
  }

  const parsedTint = Number.parseInt(normalizedTint, 16);
  return Number.isNaN(parsedTint) ? undefined : parsedTint;
};

export const emberwakeGameModule: GameModule<EmberwakeGameState, EmberwakeGameAction> = {
  initialize: () => ({
    simulation: createInitialSimulationState()
  }),
  mapInput: ({ input }) => ({
    controlState: createControlStateFromInput(input)
  }),
  present: ({ state }): EnginePresentationModel => ({
    cameraTarget: {
      mode: "follow",
      worldPosition: state.simulation.entity.worldPosition
    },
    diagnostics: {
      entityState: state.simulation.entity.state,
      tick: state.simulation.tick
    },
    entities: [
      {
        id: state.simulation.entity.id,
        kind: state.simulation.entity.visual.kind,
        orientation: state.simulation.entity.orientation,
        tint: parseTint(state.simulation.entity.visual.tint),
        worldPosition: state.simulation.entity.worldPosition
      }
    ],
    world: {
      visibleChunks: []
    }
  }),
  update: ({ action, state }) => ({
    simulation: advanceSimulationState(state.simulation, {
      controlState: action.controlState
    })
  })
};

export const createInitialEmberwakeGameState = () =>
  emberwakeGameModule.initialize({
    context: undefined,
    init: undefined
  });

export const createInitialEmberwakeSimulationState = () =>
  createInitialEmberwakeGameState().simulation;

export const advanceEmberwakeSimulationState = (
  simulationState: EntitySimulationState,
  controlState?: SingleEntityControlState
) =>
  emberwakeGameModule.update({
    action: {
      controlState:
        controlState ??
        emberwakeGameModule.mapInput({
          context: undefined,
          input: {
            buttons: {},
            debug: {
              modifierActive: false
            },
            movement: {
              active: false,
              magnitude: 0,
              source: "none",
              vector: {
                x: 0,
                y: 0
              }
            },
            pointer: {
              pressed: false,
              primaryScreenPoint: null,
              primaryWorldPoint: null
            }
          },
          state: {
            simulation: simulationState
          }
        }).controlState
    },
    context: undefined,
    state: {
      simulation: simulationState
    },
    timing: createTimingSnapshot(simulationState.tick)
  }).simulation;

export { entitySimulationContract };
export type { EmberwakeGameAction, EmberwakeGameState };
