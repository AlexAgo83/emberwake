import type {
  EngineInputFrame,
  EngineInputSource,
  EnginePresentationModel,
  EngineTiming,
  GameModule
} from "@engine/contracts/gameModule";
import { entityContract } from "@game/content/entities/entityContract";
import type { SingleEntityControlState } from "@game/input/singleEntityControlContract";
import {
  advanceSimulationState,
  createInitialSimulationState,
  entitySimulationContract
} from "@game/runtime/entitySimulation";
import type { EntitySimulationState } from "@game/runtime/entitySimulation";
import {
  advanceGameplaySystemsState,
  createGameplaySystemDiagnostics,
  createInitialGameplaySystemsState
} from "@game/systems/gameplaySystems";
import { createIdleGameplayOutcome } from "@game/systems/gameplayOutcome";
import type { EmberwakeGameplaySystemsState } from "@game/systems/gameplaySystems";

type EmberwakeGameState = {
  simulation: EntitySimulationState;
  systems: EmberwakeGameplaySystemsState;
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

export const emberwakeGameModule: GameModule<
  EmberwakeGameState,
  EmberwakeGameAction,
  EmberwakeGameState | undefined
> = {
  initialize: ({ init }) =>
    init ?? {
      simulation: createInitialSimulationState(),
      systems: createInitialGameplaySystemsState()
    },
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
      tick: state.simulation.tick,
      ...createGameplaySystemDiagnostics(state.systems)
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
    overlays: {
      runtimeOutcome: state.systems.outcome ?? createIdleGameplayOutcome()
    },
    world: {
      visibleChunks: []
    }
  }),
  update: ({ action, state, timing }) => {
    const nextSimulation = advanceSimulationState(state.simulation, {
      controlState: action.controlState
    });

    return {
      simulation: nextSimulation,
      systems: advanceGameplaySystemsState({
        previousState: state.systems,
        simulationAfterUpdate: nextSimulation,
        simulationBeforeUpdate: state.simulation,
        timing
      })
    };
  }
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
            simulation: simulationState,
            systems: createInitialGameplaySystemsState()
          }
        }).controlState
    },
    context: undefined,
    state: {
      simulation: simulationState,
      systems: createInitialGameplaySystemsState()
    },
    timing: createTimingSnapshot(simulationState.tick)
  }).simulation;

export { entitySimulationContract };
export type { EmberwakeGameAction, EmberwakeGameState };
