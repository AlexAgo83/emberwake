import type { WorldPoint } from "../../world/types";
import type { SingleEntityControlState } from "../../input/model/singleEntityControlContract";
import { singleEntityControlContract } from "../../input/model/singleEntityControlContract";
import { createGenericMoverEntity } from "./entityContract";
import type { EntityState, WorldEntity } from "./entityContract";

export const entitySimulationContract = {
  fixedStepMs: 1000 / 60
} as const;

export type SimulatedEntity = WorldEntity & {
  velocity: WorldPoint;
};

export type EntitySimulationState = {
  entity: SimulatedEntity;
  tick: number;
};

type SimulationCommand = {
  controlState?: SingleEntityControlState;
};

type ScriptedPhase = {
  state: EntityState;
  velocity: WorldPoint;
};

const scriptedPhases: Array<{
  durationTicks: number;
  phase: ScriptedPhase;
}> = [
  {
    durationTicks: 60,
    phase: {
      state: "idle",
      velocity: { x: 0, y: 0 }
    }
  },
  {
    durationTicks: 120,
    phase: {
      state: "moving",
      velocity: { x: 120, y: 0 }
    }
  },
  {
    durationTicks: 60,
    phase: {
      state: "idle",
      velocity: { x: 0, y: 0 }
    }
  },
  {
    durationTicks: 120,
    phase: {
      state: "moving",
      velocity: { x: 0, y: 120 }
    }
  }
];

const totalCycleTicks = scriptedPhases.reduce(
  (currentTotal, phase) => currentTotal + phase.durationTicks,
  0
);

export const createInitialSimulationState = (): EntitySimulationState => ({
  entity: {
    ...createGenericMoverEntity(),
    velocity: {
      x: 0,
      y: 0
    }
  },
  tick: 0
});

export const getScriptedEntityPhase = (tick: number): ScriptedPhase => {
  const normalizedTick = tick % totalCycleTicks;
  let remainingTick = normalizedTick;

  for (const scriptedPhase of scriptedPhases) {
    if (remainingTick < scriptedPhase.durationTicks) {
      return scriptedPhase.phase;
    }

    remainingTick -= scriptedPhase.durationTicks;
  }

  return scriptedPhases[0].phase;
};

export const advanceSimulationState = (
  simulationState: EntitySimulationState,
  command: SimulationCommand = {}
): EntitySimulationState => {
  const controlledEntity =
    command.controlState?.controlledEntityId === simulationState.entity.id
      ? command.controlState
      : null;
  const phase: ScriptedPhase = controlledEntity
    ? {
        state: controlledEntity.movementIntent.isActive ? "moving" : "idle",
        velocity: {
          x:
            controlledEntity.movementIntent.vector.x *
            controlledEntity.movementIntent.magnitude *
            singleEntityControlContract.desktopMoveSpeedWorldUnitsPerSecond,
          y:
            controlledEntity.movementIntent.vector.y *
            controlledEntity.movementIntent.magnitude *
            singleEntityControlContract.desktopMoveSpeedWorldUnitsPerSecond
        }
      }
    : getScriptedEntityPhase(simulationState.tick);
  const nextTick = simulationState.tick + 1;
  const stepSeconds = entitySimulationContract.fixedStepMs / 1000;
  const orientation =
    phase.velocity.x === 0 && phase.velocity.y === 0
      ? simulationState.entity.orientation
      : Math.atan2(phase.velocity.y, phase.velocity.x);

  return {
    entity: {
      ...simulationState.entity,
      orientation,
      state: phase.state,
      velocity: phase.velocity,
      worldPosition: {
        x: simulationState.entity.worldPosition.x + phase.velocity.x * stepSeconds,
        y: simulationState.entity.worldPosition.y + phase.velocity.y * stepSeconds
      }
    },
    tick: nextTick
  };
};
