import type { WorldPoint } from "@engine/geometry/primitives";
import {
  tileCoordinateToWorldOrigin,
  worldContract,
  worldPointToTileCoordinate
} from "@engine/world/worldContract";
import { createGenericMoverEntity } from "@game/content/entities/entityContract";
import { obstacleDefinitions, sampleWorldPointLayers, sampleWorldTileLayers } from "@game/content/world/worldGeneration";
import type { SingleEntityControlState } from "@game/input/singleEntityControlContract";
import { singleEntityControlContract } from "@game/input/singleEntityControlContract";
import type { EntityState, WorldEntity } from "@game/content/entities/entityContract";
import {
  deterministicRuntimeSupportEntities,
  emberwakeRuntimeBootstrap
} from "@game/runtime/emberwakeRuntimeBootstrap";
import { resolvePseudoPhysicalMovement } from "@game/runtime/pseudoPhysics";
import type { MovementSurfaceModifierKind } from "@game/content/world/worldData";

export const entitySimulationContract = {
  fixedStepMs: 1000 / 60,
  maxCatchUpStepsPerFrame: 6,
  speedOptions: [0.5, 1, 2] as const
} as const;

export type SimulatedEntity = WorldEntity & {
  movementSurfaceModifier: MovementSurfaceModifierKind;
  velocity: WorldPoint;
};

export type EntitySimulationState = {
  entity: SimulatedEntity;
  tick: number;
  worldSeed: string;
};

export type SimulationSpeedOption = (typeof entitySimulationContract.speedOptions)[number];

type SimulationCommand = {
  controlState?: SingleEntityControlState;
  worldSeed?: string;
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
    ...createGenericMoverEntity({
      archetype: emberwakeRuntimeBootstrap.playerEntity.archetype,
      id: emberwakeRuntimeBootstrap.playerEntity.id,
      visual: {
        kind: emberwakeRuntimeBootstrap.playerEntity.visualKind,
        tint: emberwakeRuntimeBootstrap.playerEntity.tint
      },
      worldPosition: emberwakeRuntimeBootstrap.playerEntity.worldPosition
    }),
    movementSurfaceModifier: "normal",
    velocity: {
      x: 0,
      y: 0
    }
  },
  tick: 0,
  worldSeed: emberwakeRuntimeBootstrap.worldSeed
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
  const worldSeed = command.worldSeed ?? simulationState.worldSeed;
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
  const stepSeconds = entitySimulationContract.fixedStepMs / 1000;
  const surfaceSample = sampleWorldPointLayers(simulationState.entity.worldPosition, worldSeed);
  const resolvedMovement = resolvePseudoPhysicalMovement({
    currentPosition: simulationState.entity.worldPosition,
    currentVelocity: simulationState.entity.velocity,
    desiredVelocity: phase.velocity,
    footprintRadius: simulationState.entity.footprint.radius,
    isBlockedAtPosition: (worldPosition, footprintRadius) =>
      isWorldPositionBlockedByObstacle(worldPosition, footprintRadius, worldSeed),
    staticColliders: deterministicRuntimeSupportEntities,
    stepSeconds,
    surfaceModifierKind: surfaceSample.modifierKind
  });
  const nextTick = simulationState.tick + 1;
  const orientation =
    resolvedMovement.velocity.x === 0 && resolvedMovement.velocity.y === 0
      ? simulationState.entity.orientation
      : Math.atan2(resolvedMovement.velocity.y, resolvedMovement.velocity.x);

  return {
    entity: {
      ...simulationState.entity,
      movementSurfaceModifier: resolvedMovement.surfaceModifierKind,
      orientation,
      state:
        resolvedMovement.velocity.x === 0 && resolvedMovement.velocity.y === 0
          ? "idle"
          : phase.state,
      velocity: resolvedMovement.velocity,
      worldPosition: resolvedMovement.worldPosition
    },
    tick: nextTick,
    worldSeed
  };
};

const circleIntersectsTileRect = (
  worldPosition: WorldPoint,
  footprintRadius: number,
  tileOrigin: WorldPoint
) => {
  const nearestPointX = Math.max(
    tileOrigin.x,
    Math.min(worldPosition.x, tileOrigin.x + worldContract.tileSizeInWorldUnits)
  );
  const nearestPointY = Math.max(
    tileOrigin.y,
    Math.min(worldPosition.y, tileOrigin.y + worldContract.tileSizeInWorldUnits)
  );
  const deltaX = worldPosition.x - nearestPointX;
  const deltaY = worldPosition.y - nearestPointY;

  return deltaX * deltaX + deltaY * deltaY < footprintRadius * footprintRadius;
};

const isWorldPositionBlockedByObstacle = (
  worldPosition: WorldPoint,
  footprintRadius: number,
  worldSeed: string
) => {
  const minTile = worldPointToTileCoordinate({
    x: worldPosition.x - footprintRadius,
    y: worldPosition.y - footprintRadius
  });
  const maxTile = worldPointToTileCoordinate({
    x: worldPosition.x + footprintRadius,
    y: worldPosition.y + footprintRadius
  });

  for (let tileX = minTile.x; tileX <= maxTile.x; tileX += 1) {
    for (let tileY = minTile.y; tileY <= maxTile.y; tileY += 1) {
      const tileSample = sampleWorldTileLayers(tileX, tileY, worldSeed);

      if (!obstacleDefinitions[tileSample.obstacleKind].blocksMovement) {
        continue;
      }

      if (
        circleIntersectsTileRect(
          worldPosition,
          footprintRadius,
          tileCoordinateToWorldOrigin({ x: tileX, y: tileY })
        )
      ) {
        return true;
      }
    }
  }

  return false;
};
