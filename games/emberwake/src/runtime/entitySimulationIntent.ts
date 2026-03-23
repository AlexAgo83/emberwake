import type { WorldPoint } from "@engine/geometry/primitives";
import {
  sampleDeterministicSignature,
  tileCoordinateToWorldOrigin,
  worldContract,
  worldPointToTileCoordinate
} from "@engine/world/worldContract";

import type { SingleEntityControlState } from "@game/input/singleEntityControlContract";
import { singleEntityControlContract } from "@game/input/singleEntityControlContract";
import { obstacleDefinitions, sampleWorldTileLayers } from "@game/content/world/worldGeneration";
import { systemTuning } from "@game/config/systemTuning";
import { hostileCombatContract } from "./hostileCombatContract";
import type { HostilePathfindingState, ScriptedPhase, SimulatedEntity } from "./entitySimulation";

type TilePoint = {
  x: number;
  y: number;
};

type ResolvedEntityIntent = {
  focusTargetEntityId?: string | null;
  pathfindingState?: HostilePathfindingState;
  state: SimulatedEntity["state"];
  velocity: WorldPoint;
};

type SimulationCommand = {
  controlState?: SingleEntityControlState;
};

const isAlive = (entity: SimulatedEntity) => entity.combat.currentHealth > 0;

const distanceBetweenWorldPoints = (left: WorldPoint, right: WorldPoint) =>
  Math.hypot(right.x - left.x, right.y - left.y);

const createVelocityTowardTarget = (
  source: WorldPoint,
  target: WorldPoint,
  speedWorldUnitsPerSecond: number
): WorldPoint => {
  const deltaX = target.x - source.x;
  const deltaY = target.y - source.y;
  const magnitude = Math.hypot(deltaX, deltaY);

  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: (deltaX / magnitude) * speedWorldUnitsPerSecond,
    y: (deltaY / magnitude) * speedWorldUnitsPerSecond
  };
};

const createTileCenterWorldPoint = (tilePoint: TilePoint): WorldPoint => {
  const tileOrigin = tileCoordinateToWorldOrigin(tilePoint);

  return {
    x: tileOrigin.x + worldContract.tileSizeInWorldUnits / 2,
    y: tileOrigin.y + worldContract.tileSizeInWorldUnits / 2
  };
};

const tilePointKey = (tilePoint: TilePoint) => `${tilePoint.x}:${tilePoint.y}`;

const isTileTraversable = (tilePoint: TilePoint, worldSeed: string) =>
  !obstacleDefinitions[sampleWorldTileLayers(tilePoint.x, tilePoint.y, worldSeed).obstacleKind]
    .blocksMovement;

const isDirectPursuitBlocked = ({
  footprintRadius,
  source,
  target,
  worldSeed
}: {
  footprintRadius: number;
  source: WorldPoint;
  target: WorldPoint;
  worldSeed: string;
}) => {
  const distance = distanceBetweenWorldPoints(source, target);
  const stepDistance = Math.max(worldContract.tileSizeInWorldUnits / 2, footprintRadius);
  const sampleCount = Math.max(1, Math.ceil(distance / stepDistance));

  for (let sampleIndex = 1; sampleIndex <= sampleCount; sampleIndex += 1) {
    const progress = sampleIndex / sampleCount;
    const sampledPoint = {
      x: source.x + (target.x - source.x) * progress,
      y: source.y + (target.y - source.y) * progress
    };
    const sampledTile = worldPointToTileCoordinate(sampledPoint);

    if (!isTileTraversable(sampledTile, worldSeed)) {
      return true;
    }
  }

  return false;
};

const createEmptyHostilePathfindingState = (): HostilePathfindingState => ({
  lastComputedTick: null,
  routeTiles: [],
  targetTile: null
});

const pathfindingContract = systemTuning.hostilePathfinding;

const findBoundedPathTiles = ({
  startTile,
  targetTile,
  worldSeed
}: {
  startTile: TilePoint;
  targetTile: TilePoint;
  worldSeed: string;
}) => {
  if (startTile.x === targetTile.x && startTile.y === targetTile.y) {
    return [];
  }

  const openQueue: TilePoint[] = [startTile];
  const visitedKeys = new Set([tilePointKey(startTile)]);
  const parentByTileKey = new Map<string, TilePoint | null>([[tilePointKey(startTile), null]]);
  let exploredTiles = 0;

  while (openQueue.length > 0 && exploredTiles < pathfindingContract.maxExploredTilesPerSolve) {
    const currentTile = openQueue.shift()!;
    exploredTiles += 1;

    if (currentTile.x === targetTile.x && currentTile.y === targetTile.y) {
      const routeTiles: TilePoint[] = [];
      let cursorTile: TilePoint | null = currentTile;

      while (cursorTile) {
        routeTiles.unshift(cursorTile);
        cursorTile = parentByTileKey.get(tilePointKey(cursorTile)) ?? null;
      }

      return routeTiles.slice(1);
    }

    const neighborOffsets = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];

    for (const neighborOffset of neighborOffsets) {
      const neighborTile = {
        x: currentTile.x + neighborOffset.x,
        y: currentTile.y + neighborOffset.y
      };
      const neighborKey = tilePointKey(neighborTile);

      if (visitedKeys.has(neighborKey)) {
        continue;
      }

      if (
        Math.abs(neighborTile.x - startTile.x) > pathfindingContract.searchRadiusInTiles ||
        Math.abs(neighborTile.y - startTile.y) > pathfindingContract.searchRadiusInTiles
      ) {
        continue;
      }

      if (!isTileTraversable(neighborTile, worldSeed)) {
        continue;
      }

      visitedKeys.add(neighborKey);
      parentByTileKey.set(neighborKey, currentTile);
      openQueue.push(neighborTile);
    }

    openQueue.sort((leftTile, rightTile) => {
      const leftDistance =
        Math.abs(leftTile.x - targetTile.x) + Math.abs(leftTile.y - targetTile.y);
      const rightDistance =
        Math.abs(rightTile.x - targetTile.x) + Math.abs(rightTile.y - targetTile.y);
      const leftTieBreaker =
        sampleDeterministicSignature(`${worldSeed}:path:${leftTile.x}:${leftTile.y}`) % 17;
      const rightTieBreaker =
        sampleDeterministicSignature(`${worldSeed}:path:${rightTile.x}:${rightTile.y}`) % 17;

      return leftDistance - rightDistance || leftTieBreaker - rightTieBreaker;
    });
  }

  return [];
};

export const resolveEntityIntent = ({
  command,
  entity,
  getScriptedEntityPhase,
  playerEntity,
  tick,
  worldSeed
}: {
  command: SimulationCommand;
  entity: SimulatedEntity;
  getScriptedEntityPhase: (tick: number) => ScriptedPhase;
  playerEntity: SimulatedEntity;
  tick: number;
  worldSeed: string;
}): ResolvedEntityIntent => {
  if (entity.role === "player") {
    const controlledEntity =
      command.controlState?.controlledEntityId === entity.id ? command.controlState : null;

    if (controlledEntity) {
      return {
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
      };
    }

    return getScriptedEntityPhase(tick);
  }

  if (entity.role !== "hostile" || !entity.focusState || !isAlive(playerEntity)) {
    return {
      focusTargetEntityId: null,
      pathfindingState: entity.role === "hostile" ? createEmptyHostilePathfindingState() : undefined,
      state: "idle",
      velocity: { x: 0, y: 0 }
    };
  }

  const hostileMoveSpeed =
    entity.movementSpeedWorldUnitsPerSecond ??
    hostileCombatContract.hostile.moveSpeedWorldUnitsPerSecond;

  const distanceToPlayer = distanceBetweenWorldPoints(
    entity.worldPosition,
    playerEntity.worldPosition
  );

  if (distanceToPlayer > entity.focusState.acquisitionRadiusWorldUnits) {
    return {
      focusTargetEntityId: null,
      pathfindingState: createEmptyHostilePathfindingState(),
      state: "idle",
      velocity: { x: 0, y: 0 }
    };
  }

  const currentTile = worldPointToTileCoordinate(entity.worldPosition);
  const targetTile = worldPointToTileCoordinate(playerEntity.worldPosition);
  const directPathBlocked = isDirectPursuitBlocked({
    footprintRadius: entity.footprint.radius,
    source: entity.worldPosition,
    target: playerEntity.worldPosition,
    worldSeed
  });
  const previousPathfindingState =
    entity.pathfindingState ?? createEmptyHostilePathfindingState();

  if (!directPathBlocked) {
    return {
      focusTargetEntityId: playerEntity.id,
      pathfindingState: {
        ...previousPathfindingState,
        routeTiles: [],
        targetTile
      },
      state: "moving",
      velocity: createVelocityTowardTarget(
        entity.worldPosition,
        playerEntity.worldPosition,
        hostileMoveSpeed
      )
    };
  }

  const targetTileChanged =
    previousPathfindingState.targetTile?.x !== targetTile.x ||
    previousPathfindingState.targetTile?.y !== targetTile.y;
  const shouldRefreshPath =
    previousPathfindingState.lastComputedTick === null ||
    previousPathfindingState.routeTiles.length === 0 ||
    targetTileChanged ||
    tick - previousPathfindingState.lastComputedTick >= pathfindingContract.recomputeCadenceTicks;
  const refreshedRouteTiles = shouldRefreshPath
    ? findBoundedPathTiles({
        startTile: currentTile,
        targetTile,
        worldSeed
      })
    : previousPathfindingState.routeTiles;
  const nextPathfindingState: HostilePathfindingState = {
    lastComputedTick: shouldRefreshPath
      ? tick
      : previousPathfindingState.lastComputedTick,
    routeTiles: refreshedRouteTiles.filter(
      (routeTile) => routeTile.x !== currentTile.x || routeTile.y !== currentTile.y
    ),
    targetTile
  };
  const nextWaypointTile = nextPathfindingState.routeTiles[0];

  if (!nextWaypointTile) {
    return {
      focusTargetEntityId: playerEntity.id,
      pathfindingState: nextPathfindingState,
      state: "moving",
      velocity: createVelocityTowardTarget(
        entity.worldPosition,
        playerEntity.worldPosition,
        hostileMoveSpeed
      )
    };
  }

  const nextWaypointWorldPosition = createTileCenterWorldPoint(nextWaypointTile);
  const reachedWaypoint =
    distanceBetweenWorldPoints(entity.worldPosition, nextWaypointWorldPosition) <=
    pathfindingContract.waypointAdvanceDistanceWorldUnits;
  const routeTilesAfterAdvance = reachedWaypoint
    ? nextPathfindingState.routeTiles.slice(1)
    : nextPathfindingState.routeTiles;
  const activeWaypointTile = routeTilesAfterAdvance[0] ?? nextWaypointTile;

  return {
    focusTargetEntityId: playerEntity.id,
    pathfindingState: {
      ...nextPathfindingState,
      routeTiles: routeTilesAfterAdvance
    },
    state: "moving",
    velocity: createVelocityTowardTarget(
      entity.worldPosition,
      createTileCenterWorldPoint(activeWaypointTile),
      hostileMoveSpeed
    )
  };
};
