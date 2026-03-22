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
  entitySimulationContract,
  normalizeEntitySimulationState
} from "@game/runtime/entitySimulation";
import type { EntitySimulationState } from "@game/runtime/entitySimulation";
import { emberwakeRuntimeBootstrap } from "@game/runtime/emberwakeRuntimeBootstrap";
import {
  advanceGameplaySystemsState,
  createGameplaySystemDiagnostics,
  createInitialGameplaySystemsState
} from "@game/systems/gameplaySystems";
import { createIdleGameplayOutcome } from "@game/systems/gameplayOutcome";
import type { EmberwakeGameplaySystemsState } from "@game/systems/gameplaySystems";
import {
  resolveRuntimeProfilingConfig,
  type RuntimeProfilingConfig
} from "@game/runtime/runtimeProfiling";

type EmberwakeGameState = {
  profiling: RuntimeProfilingConfig;
  simulation: EntitySimulationState;
  systems: EmberwakeGameplaySystemsState;
  worldSeed: string;
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
  initialize: ({ init }) => {
    const initialState =
      init ?? {
        simulation: createInitialSimulationState(),
        systems: createInitialGameplaySystemsState(),
        profiling: resolveRuntimeProfilingConfig(),
        worldSeed: emberwakeRuntimeBootstrap.worldSeed
      };

    return {
      ...initialState,
      profiling: resolveRuntimeProfilingConfig(initialState.profiling),
      simulation: normalizeEntitySimulationState(initialState.simulation)
    };
  },
  mapInput: ({ input }) => ({
    controlState: createControlStateFromInput(input)
  }),
  present: ({ state }): EnginePresentationModel => {
    const normalizedSimulation = normalizeEntitySimulationState(state.simulation);
    const profiling = resolveRuntimeProfilingConfig(state.profiling);

    return ({
    cameraTarget: {
      mode: "follow",
      worldPosition: normalizedSimulation.entity.worldPosition
    },
    diagnostics: {
      entityState: normalizedSimulation.entity.state,
      hostileCount: normalizedSimulation.entities.filter((entity) => entity.role === "hostile").length,
      movementSurfaceModifier: normalizedSimulation.entity.movementSurfaceModifier,
      playerHealth: normalizedSimulation.entity.combat.currentHealth,
      profilingInvincible: profiling.playerInvincible,
      profilingSpawnMode: profiling.spawnMode,
      tick: normalizedSimulation.tick,
      ...createGameplaySystemDiagnostics(state.systems)
    },
    entities: normalizedSimulation.entities.map((entity) => ({
      id: entity.id,
      kind: entity.visual.kind,
      orientation: entity.orientation,
      tint: parseTint(entity.visual.tint),
      worldPosition: entity.worldPosition
    })),
    overlays: {
      runtimeOutcome: state.systems.outcome ?? createIdleGameplayOutcome()
    },
    world: {
      visibleChunks: []
    }
  })},
  update: ({ action, state, timing }) => {
    const normalizedSimulation = normalizeEntitySimulationState(state.simulation);
    const nextSimulation = advanceSimulationState(normalizedSimulation, {
      controlState: action.controlState,
      profiling: state.profiling,
      worldSeed: state.worldSeed
    });

    return {
      profiling: state.profiling,
      simulation: nextSimulation,
      systems: advanceGameplaySystemsState({
        previousState: state.systems,
        simulationAfterUpdate: nextSimulation,
        simulationBeforeUpdate: normalizedSimulation,
        timing
      }),
      worldSeed: state.worldSeed
    };
  }
};

export const createInitialEmberwakeGameState = (
  worldSeed = emberwakeRuntimeBootstrap.worldSeed,
  profiling = resolveRuntimeProfilingConfig()
) =>
  emberwakeGameModule.initialize({
    context: undefined,
    init: {
      profiling,
      simulation: {
        ...createInitialSimulationState(),
        worldSeed
      },
      systems: createInitialGameplaySystemsState(),
      worldSeed
    }
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
            profiling: resolveRuntimeProfilingConfig(),
            simulation: simulationState,
            systems: createInitialGameplaySystemsState(),
            worldSeed: simulationState.worldSeed
          }
        }).controlState
    },
    context: undefined,
    state: {
      profiling: resolveRuntimeProfilingConfig(),
      simulation: simulationState,
      systems: createInitialGameplaySystemsState(),
      worldSeed: simulationState.worldSeed
    },
    timing: createTimingSnapshot(simulationState.tick)
  }).simulation;

export { entitySimulationContract };
export type { EmberwakeGameAction, EmberwakeGameState };
