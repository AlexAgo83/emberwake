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
  createInitialGameplaySystemsState,
  normalizeGameplaySystemsState
} from "@game/systems/gameplaySystems";
import type { BuildMetaProgression } from "@game/runtime/buildSystem";
import type { EmberwakeGameplaySystemsState } from "@game/systems/gameplaySystems";
import {
  resolveRuntimeProfilingConfig,
  type RuntimeProfilingConfig
} from "@game/runtime/runtimeProfiling";

export type EmberwakeGameState = {
  profiling: RuntimeProfilingConfig;
  simulation: EntitySimulationState;
  systems: EmberwakeGameplaySystemsState;
  worldSeed: string;
};

export type EmberwakeGameAction = {
  buildChoiceIndex?: number | null;
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

const resolveBuildChoiceIndexFromInput = (input: EngineInputFrame) => {
  for (const [buttonId, isPressed] of Object.entries(input.buttons)) {
    if (!isPressed || !buttonId.startsWith("build.choice.")) {
      continue;
    }

    const choiceIndex = Number.parseInt(buttonId.replace("build.choice.", ""), 10);

    if (!Number.isNaN(choiceIndex)) {
      return choiceIndex;
    }
  }

  return null;
};

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
      simulation: normalizeEntitySimulationState(initialState.simulation),
      systems: normalizeGameplaySystemsState(initialState.systems)
    };
  },
  mapInput: ({ input }) => ({
    buildChoiceIndex: resolveBuildChoiceIndexFromInput(input),
    controlState: createControlStateFromInput(input)
  }),
  present: ({ state }): EnginePresentationModel => {
    const simulationState = state.simulation;
    const systemsState = state.systems;
    const profiling = resolveRuntimeProfilingConfig(state.profiling);
    let hostileCount = 0;
    const presentedEntities = new Array(simulationState.entities.length);

    for (let index = 0; index < simulationState.entities.length; index += 1) {
      const entity = simulationState.entities[index]!;

      if (entity.role === "hostile") {
        hostileCount += 1;
      }

      presentedEntities[index] = {
        id: entity.id,
        kind: entity.visual.kind,
        orientation: entity.orientation,
        tint: parseTint(entity.visual.tint),
        worldPosition: entity.worldPosition
      };
    }

    return ({
    cameraTarget: {
      mode: "follow",
      worldPosition: simulationState.entity.worldPosition
    },
    diagnostics: {
      entityState: simulationState.entity.state,
      hostileCount,
      movementSurfaceModifier: simulationState.entity.movementSurfaceModifier,
      playerHealth: simulationState.entity.combat.currentHealth,
      profilingInvincible: profiling.playerInvincible,
      profilingSpawnMode: profiling.spawnMode,
      tick: simulationState.tick,
      ...createGameplaySystemDiagnostics(systemsState)
    },
    entities: presentedEntities,
    overlays: {
      buildState: simulationState.buildState,
      runtimeOutcome: systemsState.outcome
    },
    world: {
      visibleChunks: []
    }
  })},
  update: ({ action, state, timing }) => {
    const normalizedSimulation = normalizeEntitySimulationState(state.simulation);
    const normalizedSystems = normalizeGameplaySystemsState(state.systems);
    const nextSimulation = advanceSimulationState(normalizedSimulation, {
      buildChoiceIndex: action.buildChoiceIndex,
      controlState: action.controlState,
      profiling: state.profiling,
      worldSeed: state.worldSeed
    });

    return {
      profiling: state.profiling,
      simulation: nextSimulation,
      systems: advanceGameplaySystemsState({
        previousState: normalizedSystems,
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
  profiling = resolveRuntimeProfilingConfig(),
  metaProgression?: BuildMetaProgression
) =>
  emberwakeGameModule.initialize({
    context: undefined,
    init: {
      profiling,
      simulation: {
        ...createInitialSimulationState({
          metaProgression
        }),
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
