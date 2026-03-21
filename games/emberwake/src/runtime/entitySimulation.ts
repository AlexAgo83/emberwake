import type { WorldPoint } from "@engine/geometry/primitives";
import {
  sampleDeterministicSignature,
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
import { hostileCombatContract } from "@game/runtime/hostileCombatContract";
import { pickupContract } from "@game/runtime/pickupContract";
import { resolvePseudoPhysicalMovement } from "@game/runtime/pseudoPhysics";
import type { MovementSurfaceModifierKind } from "@game/content/world/worldData";

export const entitySimulationContract = {
  fixedStepMs: 1000 / 60,
  maxCatchUpStepsPerFrame: 6,
  speedOptions: [0.5, 1, 2] as const
} as const;

export type SimulatedPickupKind = "gold" | "healing-kit";

export type SimulatedEntityRole = "hostile" | "pickup" | "player" | "support";

export type EntityCombatState = {
  currentHealth: number;
  maxHealth: number;
};

export type AutomaticAttackProfile = {
  arcRadians: number;
  cooldownTicks: number;
  damage: number;
  lastAttackTick: number | null;
  rangeWorldUnits: number;
  visibleTicks: number;
};

export type ContactDamageProfile = {
  cooldownTicks: number;
  damage: number;
  lastDamageTick: number | null;
};

export type FocusState = {
  acquisitionRadiusWorldUnits: number;
  targetEntityId: string | null;
};

export type PickupProfile = {
  kind: SimulatedPickupKind;
};

export type RunStats = {
  goldCollected: number;
  healingKitsCollected: number;
  hostileDefeats: number;
};

export type DamageReactionState = {
  lastDamageAmount: number | null;
  lastDamageTick: number | null;
};

export type FloatingDamageNumber = {
  amount: number;
  driftX: number;
  id: string;
  sourceEntityId: string;
  spawnedAtTick: number;
  worldPosition: WorldPoint;
};

type TilePoint = {
  x: number;
  y: number;
};

export type MovementHeadingMemory = {
  headingRadians: number;
  lastMeaningfulTick: number;
};

export type HostilePathfindingState = {
  lastComputedTick: number | null;
  routeTiles: TilePoint[];
  targetTile: TilePoint | null;
};

export type SimulatedEntity = WorldEntity & {
  automaticAttack?: AutomaticAttackProfile;
  combat: EntityCombatState;
  contactDamageProfile?: ContactDamageProfile;
  damageReactionState?: DamageReactionState;
  focusState?: FocusState;
  movementSurfaceModifier: MovementSurfaceModifierKind;
  movementHeadingMemory?: MovementHeadingMemory;
  pathfindingState?: HostilePathfindingState;
  pickupProfile?: PickupProfile;
  role: SimulatedEntityRole;
  spawnedAtTick: number;
  velocity: WorldPoint;
};

export type EntitySimulationState = {
  entities: SimulatedEntity[];
  entity: SimulatedEntity;
  floatingDamageNumbers: FloatingDamageNumber[];
  nextPickupSequence: number;
  nextHostileSequence: number;
  runStats: RunStats;
  tick: number;
  worldSeed: string;
};

type LegacySimulationState = Partial<EntitySimulationState> & {
  entity?: Partial<SimulatedEntity> & Pick<WorldEntity, "id" | "worldPosition">;
  entities?: Array<Partial<SimulatedEntity> & Pick<WorldEntity, "id" | "worldPosition">>;
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

type ResolvedEntityIntent = {
  focusTargetEntityId?: string | null;
  pathfindingState?: HostilePathfindingState;
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

export const entityCombatPresentationContract = {
  floatingDamageNumberLifetimeTicks: 24,
  hitReactionVisibleTicks: 10,
  spawnHeadingMemoryTicks: 18
} as const;

const createCombatState = (maxHealth: number): EntityCombatState => ({
  currentHealth: maxHealth,
  maxHealth
});

const createDamageReactionState = (): DamageReactionState => ({
  lastDamageAmount: null,
  lastDamageTick: null
});

const createInitialRunStats = (): RunStats => ({
  goldCollected: 0,
  healingKitsCollected: 0,
  hostileDefeats: 0
});

const createPlayerAutomaticAttackProfile = (): AutomaticAttackProfile => ({
  ...hostileCombatContract.player.automaticConeAttack,
  lastAttackTick: null
});

const createPlayerEntity = (): SimulatedEntity => ({
  ...createGenericMoverEntity({
    archetype: emberwakeRuntimeBootstrap.playerEntity.archetype,
    id: emberwakeRuntimeBootstrap.playerEntity.id,
    visual: {
      kind: emberwakeRuntimeBootstrap.playerEntity.visualKind,
      tint: emberwakeRuntimeBootstrap.playerEntity.tint
    },
    worldPosition: emberwakeRuntimeBootstrap.playerEntity.worldPosition
  }),
  automaticAttack: {
    ...createPlayerAutomaticAttackProfile()
  },
  combat: createCombatState(hostileCombatContract.player.maxHealth),
  damageReactionState: createDamageReactionState(),
  movementSurfaceModifier: "normal",
  role: "player",
  spawnedAtTick: 0,
  velocity: {
    x: 0,
    y: 0
  }
});

const createHostileEntity = (
  hostileSequence: number,
  worldPosition: WorldPoint,
  spawnedAtTick: number
): SimulatedEntity => ({
  ...createGenericMoverEntity({
    archetype: "generic-mover",
    id: `entity:hostile:${hostileSequence}`,
    visual: {
      kind: "debug-sentinel",
      tint: "#ff6d78"
    },
    worldPosition
  }),
  combat: createCombatState(hostileCombatContract.hostile.maxHealth),
  contactDamageProfile: {
    cooldownTicks: hostileCombatContract.hostile.contactDamageCooldownTicks,
    damage: hostileCombatContract.hostile.contactDamage,
    lastDamageTick: null
  },
  focusState: {
    acquisitionRadiusWorldUnits: hostileCombatContract.hostile.acquisitionRadiusWorldUnits,
    targetEntityId: null
  },
  damageReactionState: createDamageReactionState(),
  movementSurfaceModifier: "normal",
  pathfindingState: {
    lastComputedTick: null,
    routeTiles: [],
    targetTile: null
  },
  role: "hostile",
  spawnedAtTick,
  velocity: {
    x: 0,
    y: 0
  }
});

const createPickupEntity = (
  pickupSequence: number,
  pickupKind: SimulatedPickupKind,
  worldPosition: WorldPoint,
  spawnedAtTick: number
): SimulatedEntity => ({
  ...createGenericMoverEntity({
    id: `entity:pickup:${pickupKind}:${pickupSequence}`,
    renderLayer: 90,
    visual: {
      kind: pickupKind === "healing-kit" ? "pickup-healing-kit" : "pickup-gold",
      tint: pickupKind === "healing-kit" ? "#7dff9b" : "#ffd76c"
    },
    worldPosition
  }),
  combat: createCombatState(1),
  damageReactionState: createDamageReactionState(),
  footprint: {
    radius: pickupContract.pickup.pickupRadiusWorldUnits
  },
  movementSurfaceModifier: "normal",
  pickupProfile: {
    kind: pickupKind
  },
  role: "pickup",
  spawnedAtTick,
  velocity: {
    x: 0,
    y: 0
  }
});

const isAlive = (entity: SimulatedEntity) => entity.combat.currentHealth > 0;

const isDynamicCollider = (entity: SimulatedEntity) => entity.role !== "pickup" && isAlive(entity);

const getPlayerEntity = (entities: readonly SimulatedEntity[]) =>
  entities.find((entity) => entity.role === "player") ?? entities[0];

const distanceBetweenWorldPoints = (left: WorldPoint, right: WorldPoint) =>
  Math.hypot(left.x - right.x, left.y - right.y);

const createVelocityTowardTarget = (
  source: WorldPoint,
  target: WorldPoint,
  moveSpeedWorldUnitsPerSecond: number
) => {
  const deltaX = target.x - source.x;
  const deltaY = target.y - source.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance === 0) {
    return {
      x: 0,
      y: 0
    };
  }

  return {
    x: (deltaX / distance) * moveSpeedWorldUnitsPerSecond,
    y: (deltaY / distance) * moveSpeedWorldUnitsPerSecond
  };
};

const movementVectorMagnitude = (vector: WorldPoint) => Math.hypot(vector.x, vector.y);

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

  if (distance === 0) {
    return false;
  }

  const sampleCount = Math.max(
    1,
    Math.ceil(distance / (worldContract.tileSizeInWorldUnits * 0.5))
  );

  for (let index = 1; index <= sampleCount; index += 1) {
    const progress = index / sampleCount;
    const sampledPoint = {
      x: source.x + (target.x - source.x) * progress,
      y: source.y + (target.y - source.y) * progress
    };

    if (isWorldPositionBlockedByObstacle(sampledPoint, footprintRadius, worldSeed)) {
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

const pathfindingContract = {
  recomputeCadenceTicks: 18,
  searchNodeBudget: 96,
  searchRadiusTiles: 6,
  waypointAdvanceDistanceWorldUnits: worldContract.tileSizeInWorldUnits * 0.35
} as const;

const findBoundedPathTiles = ({
  startTile,
  targetTile,
  worldSeed
}: {
  startTile: TilePoint;
  targetTile: TilePoint;
  worldSeed: string;
}) => {
  const minTileX = startTile.x - pathfindingContract.searchRadiusTiles;
  const maxTileX = startTile.x + pathfindingContract.searchRadiusTiles;
  const minTileY = startTile.y - pathfindingContract.searchRadiusTiles;
  const maxTileY = startTile.y + pathfindingContract.searchRadiusTiles;
  const isInsideBounds = (tilePoint: TilePoint) =>
    tilePoint.x >= minTileX &&
    tilePoint.x <= maxTileX &&
    tilePoint.y >= minTileY &&
    tilePoint.y <= maxTileY;
  const openSet: TilePoint[] = [startTile];
  const cameFrom = new Map<string, TilePoint>();
  const gScore = new Map<string, number>([[tilePointKey(startTile), 0]]);
  const fScore = new Map<string, number>([
    [
      tilePointKey(startTile),
      Math.abs(targetTile.x - startTile.x) + Math.abs(targetTile.y - startTile.y)
    ]
  ]);
  let exploredNodes = 0;

  while (
    openSet.length > 0 &&
    exploredNodes < pathfindingContract.searchNodeBudget
  ) {
    openSet.sort(
      (left, right) =>
        (fScore.get(tilePointKey(left)) ?? Number.POSITIVE_INFINITY) -
        (fScore.get(tilePointKey(right)) ?? Number.POSITIVE_INFINITY)
    );
    const currentTile = openSet.shift()!;

    if (currentTile.x === targetTile.x && currentTile.y === targetTile.y) {
      const routeTiles: TilePoint[] = [];
      let routeCursor: TilePoint | undefined = currentTile;

      while (routeCursor && tilePointKey(routeCursor) !== tilePointKey(startTile)) {
        routeTiles.unshift(routeCursor);
        routeCursor = cameFrom.get(tilePointKey(routeCursor));
      }

      return routeTiles;
    }

    exploredNodes += 1;

    const neighbors: TilePoint[] = [
      { x: currentTile.x + 1, y: currentTile.y },
      { x: currentTile.x - 1, y: currentTile.y },
      { x: currentTile.x, y: currentTile.y + 1 },
      { x: currentTile.x, y: currentTile.y - 1 }
    ];

    for (const neighborTile of neighbors) {
      if (!isInsideBounds(neighborTile) || !isTileTraversable(neighborTile, worldSeed)) {
        continue;
      }

      const neighborKey = tilePointKey(neighborTile);
      const tentativeScore = (gScore.get(tilePointKey(currentTile)) ?? Number.POSITIVE_INFINITY) + 1;

      if (tentativeScore >= (gScore.get(neighborKey) ?? Number.POSITIVE_INFINITY)) {
        continue;
      }

      cameFrom.set(neighborKey, currentTile);
      gScore.set(neighborKey, tentativeScore);
      fScore.set(
        neighborKey,
        tentativeScore +
          Math.abs(targetTile.x - neighborTile.x) +
          Math.abs(targetTile.y - neighborTile.y)
      );

      if (!openSet.some((tilePoint) => tilePointKey(tilePoint) === neighborKey)) {
        openSet.push(neighborTile);
      }
    }
  }

  return [];
};

export const createInitialSimulationState = (): EntitySimulationState => {
  const playerEntity = createPlayerEntity();

  return {
    entities: [playerEntity],
    entity: playerEntity,
    floatingDamageNumbers: [],
    nextPickupSequence: 0,
    nextHostileSequence: 0,
    runStats: createInitialRunStats(),
    tick: 0,
    worldSeed: emberwakeRuntimeBootstrap.worldSeed
  };
};

const normalizeCombatState = (
  combat: Partial<EntityCombatState> | undefined,
  maxHealth: number
): EntityCombatState => ({
  currentHealth: Math.max(
    0,
    Math.min(combat?.currentHealth ?? maxHealth, combat?.maxHealth ?? maxHealth)
  ),
  maxHealth: combat?.maxHealth ?? maxHealth
});

const normalizeDamageReactionState = (
  damageReactionState: Partial<DamageReactionState> | undefined
): DamageReactionState => ({
  lastDamageAmount: damageReactionState?.lastDamageAmount ?? null,
  lastDamageTick: damageReactionState?.lastDamageTick ?? null
});

const normalizeEntityRole = (
  entity: Partial<SimulatedEntity> & Pick<WorldEntity, "id" | "worldPosition">
): SimulatedEntityRole =>
  entity.role ??
  (entity.id === emberwakeRuntimeBootstrap.playerEntity.id
    ? "player"
    : entity.id.startsWith("entity:hostile:")
      ? "hostile"
      : entity.id.startsWith("entity:pickup:")
        ? "pickup"
      : "support");

const normalizeSimulatedEntity = (
  entity: Partial<SimulatedEntity> & Pick<WorldEntity, "id" | "worldPosition">
): SimulatedEntity => {
  const role = normalizeEntityRole(entity);
  const baseEntity = createGenericMoverEntity({
    archetype: entity.archetype ?? "generic-mover",
    id: entity.id,
    orientation: entity.orientation ?? 0,
    renderLayer: entity.renderLayer ?? 100,
    state: entity.state ?? "idle",
    visual: {
      kind:
        entity.visual?.kind ??
        (role === "hostile"
          ? "debug-sentinel"
          : role === "support"
            ? "debug-anchor"
            : emberwakeRuntimeBootstrap.playerEntity.visualKind),
      tint:
        entity.visual?.tint ??
        (role === "hostile"
          ? "#ff6d78"
          : role === "support"
            ? "#4ce2ff"
            : emberwakeRuntimeBootstrap.playerEntity.tint)
    },
    worldPosition: entity.worldPosition
  });

  if (role === "player") {
    return {
      ...baseEntity,
      automaticAttack: {
        ...createPlayerAutomaticAttackProfile(),
        ...entity.automaticAttack
      },
      combat: normalizeCombatState(entity.combat, hostileCombatContract.player.maxHealth),
      damageReactionState: normalizeDamageReactionState(entity.damageReactionState),
      movementSurfaceModifier: entity.movementSurfaceModifier ?? "normal",
      movementHeadingMemory: entity.movementHeadingMemory,
      role,
      spawnedAtTick: entity.spawnedAtTick ?? 0,
      velocity: entity.velocity ?? { x: 0, y: 0 }
    };
  }

  if (role === "hostile") {
    return {
      ...baseEntity,
      combat: normalizeCombatState(entity.combat, hostileCombatContract.hostile.maxHealth),
      contactDamageProfile: {
        cooldownTicks:
          entity.contactDamageProfile?.cooldownTicks ??
          hostileCombatContract.hostile.contactDamageCooldownTicks,
        damage:
          entity.contactDamageProfile?.damage ?? hostileCombatContract.hostile.contactDamage,
        lastDamageTick: entity.contactDamageProfile?.lastDamageTick ?? null
      },
      focusState: {
        acquisitionRadiusWorldUnits:
          entity.focusState?.acquisitionRadiusWorldUnits ??
          hostileCombatContract.hostile.acquisitionRadiusWorldUnits,
        targetEntityId: entity.focusState?.targetEntityId ?? null
      },
      damageReactionState: normalizeDamageReactionState(entity.damageReactionState),
      movementSurfaceModifier: entity.movementSurfaceModifier ?? "normal",
      pathfindingState: {
        lastComputedTick: entity.pathfindingState?.lastComputedTick ?? null,
        routeTiles: entity.pathfindingState?.routeTiles ?? [],
        targetTile: entity.pathfindingState?.targetTile ?? null
      },
      role,
      spawnedAtTick: entity.spawnedAtTick ?? 0,
      velocity: entity.velocity ?? { x: 0, y: 0 }
    };
  }

  if (role === "pickup") {
    const inferredPickupKind =
      entity.pickupProfile?.kind ??
      (entity.id.includes(":healing-kit:") ? "healing-kit" : "gold");

    return {
      ...baseEntity,
      combat: normalizeCombatState(entity.combat, 1),
      damageReactionState: normalizeDamageReactionState(entity.damageReactionState),
      footprint: {
        radius: entity.footprint?.radius ?? pickupContract.pickup.pickupRadiusWorldUnits
      },
      movementSurfaceModifier: entity.movementSurfaceModifier ?? "normal",
      pickupProfile: {
        kind: inferredPickupKind
      },
      role,
      spawnedAtTick: entity.spawnedAtTick ?? 0,
      velocity: entity.velocity ?? { x: 0, y: 0 }
    };
  }

  return {
    ...baseEntity,
    combat: normalizeCombatState(entity.combat, 1),
    damageReactionState: normalizeDamageReactionState(entity.damageReactionState),
    movementSurfaceModifier: entity.movementSurfaceModifier ?? "normal",
    role,
    spawnedAtTick: entity.spawnedAtTick ?? 0,
    velocity: entity.velocity ?? { x: 0, y: 0 }
  };
};

export const normalizeEntitySimulationState = (
  simulationState: LegacySimulationState | EntitySimulationState
): EntitySimulationState => {
  const initialState = createInitialSimulationState();
  const sourceEntities =
    simulationState.entities && simulationState.entities.length > 0
      ? simulationState.entities
      : simulationState.entity
        ? [simulationState.entity]
        : initialState.entities;
  const normalizedEntities = sourceEntities.map((entity) => normalizeSimulatedEntity(entity));
  const playerEntity =
    normalizedEntities.find(
      (entity) => entity.role === "player" || entity.id === emberwakeRuntimeBootstrap.playerEntity.id
    ) ?? initialState.entity;
  const nextHostileSequence = normalizedEntities.reduce((highestSequence, entity) => {
    if (entity.role !== "hostile") {
      return highestSequence;
    }

    const hostileSuffix = Number.parseInt(entity.id.split(":").at(-1) ?? "", 10);

    return Number.isNaN(hostileSuffix)
      ? highestSequence
      : Math.max(highestSequence, hostileSuffix + 1);
  }, simulationState.nextHostileSequence ?? 0);
  const nextPickupSequence = normalizedEntities.reduce((highestSequence, entity) => {
    if (entity.role !== "pickup") {
      return highestSequence;
    }

    const pickupSuffix = Number.parseInt(entity.id.split(":").at(-1) ?? "", 10);

    return Number.isNaN(pickupSuffix)
      ? highestSequence
      : Math.max(highestSequence, pickupSuffix + 1);
  }, simulationState.nextPickupSequence ?? 0);

  return {
    entities: normalizedEntities,
    entity: playerEntity,
    floatingDamageNumbers: simulationState.floatingDamageNumbers ?? [],
    nextPickupSequence,
    nextHostileSequence,
    runStats: {
      ...createInitialRunStats(),
      ...simulationState.runStats
    },
    tick: simulationState.tick ?? 0,
    worldSeed: simulationState.worldSeed ?? emberwakeRuntimeBootstrap.worldSeed
  };
};

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

const resolveEntityIntent = ({
  command,
  entity,
  playerEntity,
  tick,
  worldSeed
}: {
  command: SimulationCommand;
  entity: SimulatedEntity;
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
        hostileCombatContract.hostile.moveSpeedWorldUnitsPerSecond
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
        hostileCombatContract.hostile.moveSpeedWorldUnitsPerSecond
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
      hostileCombatContract.hostile.moveSpeedWorldUnitsPerSecond
    )
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

const resolveEntityMovement = ({
  dynamicColliders,
  entity,
  intent,
  tick,
  worldSeed
}: {
  dynamicColliders: readonly SimulatedEntity[];
  entity: SimulatedEntity;
  intent: ResolvedEntityIntent;
  tick: number;
  worldSeed: string;
}) => {
  const stepSeconds = entitySimulationContract.fixedStepMs / 1000;
  const surfaceSample = sampleWorldPointLayers(entity.worldPosition, worldSeed);
  const resolvedMovement = resolvePseudoPhysicalMovement({
    currentPosition: entity.worldPosition,
    currentVelocity: entity.velocity,
    desiredVelocity: intent.velocity,
    footprintRadius: entity.footprint.radius,
    isBlockedAtPosition: (worldPosition, footprintRadius) =>
      isWorldPositionBlockedByObstacle(worldPosition, footprintRadius, worldSeed),
    staticColliders: [...deterministicRuntimeSupportEntities, ...dynamicColliders],
    stepSeconds,
    surfaceModifierKind: surfaceSample.modifierKind
  });
  const orientation =
    resolvedMovement.velocity.x === 0 && resolvedMovement.velocity.y === 0
      ? entity.orientation
      : Math.atan2(resolvedMovement.velocity.y, resolvedMovement.velocity.x);
  const movementSpeed = movementVectorMagnitude(resolvedMovement.velocity);

  return {
    ...entity,
    focusState: entity.focusState
      ? {
          ...entity.focusState,
          targetEntityId: intent.focusTargetEntityId ?? null
        }
      : undefined,
    movementHeadingMemory:
      entity.role === "player" && movementSpeed > 0
        ? {
            headingRadians: orientation,
            lastMeaningfulTick: tick
          }
        : entity.movementHeadingMemory,
    movementSurfaceModifier: resolvedMovement.surfaceModifierKind,
    pathfindingState:
      entity.role === "hostile" ? intent.pathfindingState ?? entity.pathfindingState : undefined,
    orientation,
    state:
      resolvedMovement.velocity.x === 0 && resolvedMovement.velocity.y === 0
        ? "idle"
        : intent.state,
    velocity: resolvedMovement.velocity,
    worldPosition: resolvedMovement.worldPosition
  } satisfies SimulatedEntity;
};

const normalizeAngleDelta = (angleRadians: number) => {
  let normalizedAngle = angleRadians;

  while (normalizedAngle <= -Math.PI) {
    normalizedAngle += Math.PI * 2;
  }

  while (normalizedAngle > Math.PI) {
    normalizedAngle -= Math.PI * 2;
  }

  return normalizedAngle;
};

const applyDamage = (
  entity: SimulatedEntity,
  damage: number,
  tick: number
): SimulatedEntity => ({
  ...entity,
  combat: {
    ...entity.combat,
    currentHealth: Math.max(0, entity.combat.currentHealth - damage)
  },
  damageReactionState: {
    lastDamageAmount: damage,
    lastDamageTick: tick
  }
});

const applyHealing = (entity: SimulatedEntity, healing: number): SimulatedEntity => ({
  ...entity,
  combat: {
    ...entity.combat,
    currentHealth: Math.min(entity.combat.maxHealth, entity.combat.currentHealth + healing)
  }
});

const createFloatingDamageNumber = (
  entity: SimulatedEntity,
  damage: number,
  tick: number
): FloatingDamageNumber => {
  const driftSeed = sampleDeterministicSignature(`${entity.id}:damage:${tick}:${damage}`);

  return {
    amount: Math.max(0, Math.round(damage)),
    driftX: ((driftSeed % 13) - 6) * 1.75,
    id: `floating-damage:${entity.id}:${tick}:${damage}:${driftSeed % 17}`,
    sourceEntityId: entity.id,
    spawnedAtTick: tick,
    worldPosition: {
      x: entity.worldPosition.x,
      y: entity.worldPosition.y - entity.footprint.radius - 18
    }
  };
};

const pruneFloatingDamageNumbers = (
  floatingDamageNumbers: readonly FloatingDamageNumber[],
  tick: number
) =>
  floatingDamageNumbers.filter(
    (floatingDamageNumber) =>
      tick - floatingDamageNumber.spawnedAtTick <
      entityCombatPresentationContract.floatingDamageNumberLifetimeTicks
  );

const resolveAutomaticPlayerAttack = (
  entities: readonly SimulatedEntity[],
  tick: number
): {
  entities: SimulatedEntity[];
  floatingDamageNumbers: FloatingDamageNumber[];
} => {
  const playerEntity = getPlayerEntity(entities);

  if (!playerEntity || !playerEntity.automaticAttack || !isAlive(playerEntity)) {
    return {
      entities: [...entities],
      floatingDamageNumbers: []
    };
  }

  const { automaticAttack } = playerEntity;

  if (
    automaticAttack.lastAttackTick !== null &&
    tick - automaticAttack.lastAttackTick < automaticAttack.cooldownTicks
  ) {
    return {
      entities: [...entities],
      floatingDamageNumbers: []
    };
  }

  const hitTargetIds = new Set(
    entities
      .filter((entity) => entity.role === "hostile" && isAlive(entity))
      .filter((hostileEntity) => {
        const distanceToHostile = distanceBetweenWorldPoints(
          playerEntity.worldPosition,
          hostileEntity.worldPosition
        );

        if (
          distanceToHostile >
          automaticAttack.rangeWorldUnits + hostileEntity.footprint.radius
        ) {
          return false;
        }

        const deltaX = hostileEntity.worldPosition.x - playerEntity.worldPosition.x;
        const deltaY = hostileEntity.worldPosition.y - playerEntity.worldPosition.y;
        const angleToHostile = Math.atan2(deltaY, deltaX);

        return (
          Math.abs(normalizeAngleDelta(angleToHostile - playerEntity.orientation)) <=
          automaticAttack.arcRadians / 2
        );
      })
      .map((entity) => entity.id)
  );

  if (hitTargetIds.size === 0) {
    return {
      entities: [...entities],
      floatingDamageNumbers: []
    };
  }

  const floatingDamageNumbers: FloatingDamageNumber[] = [];
  const nextEntities = entities.map((entity) => {
    if (entity.id === playerEntity.id) {
      return {
        ...entity,
        automaticAttack: {
          ...automaticAttack,
          lastAttackTick: tick
        }
      };
    }

    if (!hitTargetIds.has(entity.id)) {
      return entity;
    }

    const damagedEntity = applyDamage(entity, automaticAttack.damage, tick);

    floatingDamageNumbers.push(
      createFloatingDamageNumber(damagedEntity, automaticAttack.damage, tick)
    );

    return damagedEntity;
  });

  return {
    entities: nextEntities,
    floatingDamageNumbers
  };
};

const isEntityPairOverlapping = (leftEntity: SimulatedEntity, rightEntity: SimulatedEntity) =>
  distanceBetweenWorldPoints(leftEntity.worldPosition, rightEntity.worldPosition) <=
  leftEntity.footprint.radius + rightEntity.footprint.radius + 0.5;

const resolveHostileContactDamage = (
  entities: readonly SimulatedEntity[],
  previousEntities: readonly SimulatedEntity[],
  tick: number
): {
  entities: SimulatedEntity[];
  floatingDamageNumbers: FloatingDamageNumber[];
} => {
  const playerEntity = getPlayerEntity(entities);
  const previousPlayerEntity = getPlayerEntity(previousEntities);

  if (!playerEntity || !isAlive(playerEntity)) {
    return {
      entities: [...entities],
      floatingDamageNumbers: []
    };
  }

  let nextPlayerEntity = playerEntity;
  const nextEntities = entities.map((entity) => ({ ...entity }));
  const floatingDamageNumbers: FloatingDamageNumber[] = [];

  for (let index = 0; index < nextEntities.length; index += 1) {
    const hostileEntity = nextEntities[index];

    if (
      hostileEntity.role !== "hostile" ||
      !hostileEntity.contactDamageProfile ||
      !isAlive(hostileEntity) ||
      !isAlive(nextPlayerEntity)
    ) {
      continue;
    }

    const previousHostileEntity = previousEntities.find(
      (entity) => entity.id === hostileEntity.id
    );
    const hadContactBeforeSeparation =
      previousPlayerEntity && previousHostileEntity
        ? isEntityPairOverlapping(previousHostileEntity, previousPlayerEntity)
        : false;

    if (!hadContactBeforeSeparation && !isEntityPairOverlapping(hostileEntity, nextPlayerEntity)) {
      continue;
    }

    const { contactDamageProfile } = hostileEntity;

    if (
      contactDamageProfile.lastDamageTick !== null &&
      tick - contactDamageProfile.lastDamageTick < contactDamageProfile.cooldownTicks
    ) {
      continue;
    }

    nextPlayerEntity = applyDamage(nextPlayerEntity, contactDamageProfile.damage, tick);
    floatingDamageNumbers.push(
      createFloatingDamageNumber(nextPlayerEntity, contactDamageProfile.damage, tick)
    );
    nextEntities[index] = {
      ...hostileEntity,
      contactDamageProfile: {
        ...contactDamageProfile,
        lastDamageTick: tick
      }
    };
  }

  return {
    entities: nextEntities.map((entity) =>
      entity.id === nextPlayerEntity.id ? nextPlayerEntity : entity
    ),
    floatingDamageNumbers
  };
};

const countLocalHostiles = (entities: readonly SimulatedEntity[], playerEntity: SimulatedEntity) =>
  entities.filter(
    (entity) =>
      entity.role === "hostile" &&
      isAlive(entity) &&
      distanceBetweenWorldPoints(entity.worldPosition, playerEntity.worldPosition) <=
        hostileCombatContract.hostile.acquisitionRadiusWorldUnits
      ).length;

const resolvePreferredSpawnHeadingRadians = ({
  command,
  playerEntity,
  tick
}: {
  command: SimulationCommand;
  playerEntity: SimulatedEntity;
  tick: number;
}) => {
  const movementIntent = command.controlState?.movementIntent;

  if (
    movementIntent?.isActive &&
    (movementIntent.vector.x !== 0 || movementIntent.vector.y !== 0)
  ) {
    return Math.atan2(movementIntent.vector.y, movementIntent.vector.x);
  }

  if (
    playerEntity.movementHeadingMemory &&
    tick - playerEntity.movementHeadingMemory.lastMeaningfulTick <=
      entityCombatPresentationContract.spawnHeadingMemoryTicks
  ) {
    return playerEntity.movementHeadingMemory.headingRadians;
  }

  if (movementVectorMagnitude(playerEntity.velocity) > 0) {
    return Math.atan2(playerEntity.velocity.y, playerEntity.velocity.x);
  }

  return null;
};

const sampleSpawnAngleWithinSector = ({
  baseHeadingRadians,
  sectorCenterOffsetRadians,
  sectorWidthRadians,
  signature
}: {
  baseHeadingRadians: number;
  sectorCenterOffsetRadians: number;
  sectorWidthRadians: number;
  signature: number;
}) => {
  const halfWidth = sectorWidthRadians / 2;
  const normalizedOffset = ((signature % 1000) / 999) * sectorWidthRadians - halfWidth;

  return baseHeadingRadians + sectorCenterOffsetRadians + normalizedOffset;
};

const sampleHostileSpawnPosition = ({
  attempt,
  command,
  playerEntity,
  sequence,
  tick,
  worldSeed
}: {
  attempt: number;
  command: SimulationCommand;
  playerEntity: SimulatedEntity;
  sequence: number;
  tick: number;
  worldSeed: string;
}) => {
  const angleSignature = sampleDeterministicSignature(
    `${worldSeed}:hostile-angle:${sequence}:${playerEntity.worldPosition.x}:${playerEntity.worldPosition.y}`
  );
  const distanceSignature = sampleDeterministicSignature(
    `${worldSeed}:hostile-distance:${sequence}:${playerEntity.worldPosition.x}:${playerEntity.worldPosition.y}`
  );
  const preferredHeadingRadians = resolvePreferredSpawnHeadingRadians({
    command,
    playerEntity,
    tick
  });
  const sectorDefinitions =
    preferredHeadingRadians === null
      ? null
      : [
          { centerOffsetRadians: 0, widthRadians: (70 * Math.PI) / 180 },
          { centerOffsetRadians: (55 * Math.PI) / 180, widthRadians: (42 * Math.PI) / 180 },
          { centerOffsetRadians: (-55 * Math.PI) / 180, widthRadians: (42 * Math.PI) / 180 },
          { centerOffsetRadians: (105 * Math.PI) / 180, widthRadians: (34 * Math.PI) / 180 },
          { centerOffsetRadians: (-105 * Math.PI) / 180, widthRadians: (34 * Math.PI) / 180 },
          { centerOffsetRadians: (145 * Math.PI) / 180, widthRadians: (26 * Math.PI) / 180 },
          { centerOffsetRadians: (-145 * Math.PI) / 180, widthRadians: (26 * Math.PI) / 180 },
          { centerOffsetRadians: Math.PI, widthRadians: (20 * Math.PI) / 180 }
        ];
  const sectorDefinition =
    sectorDefinitions?.[attempt % sectorDefinitions.length] ?? null;
  const angleRadians =
    preferredHeadingRadians === null || !sectorDefinition
      ? ((angleSignature % 360) * Math.PI) / 180
      : sampleSpawnAngleWithinSector({
          baseHeadingRadians: preferredHeadingRadians,
          sectorCenterOffsetRadians: sectorDefinition.centerOffsetRadians,
          sectorWidthRadians: sectorDefinition.widthRadians,
          signature: angleSignature
        });
  const distanceRatio = 1.05 + (distanceSignature % 46) / 100;
  const radialDistance =
    hostileCombatContract.hostile.safeSpawnDistanceWorldUnits * distanceRatio;

  return {
    x: playerEntity.worldPosition.x + Math.cos(angleRadians) * radialDistance,
    y: playerEntity.worldPosition.y + Math.sin(angleRadians) * radialDistance
  };
};

const canSpawnEntityAtPosition = ({
  entities,
  footprintRadius,
  worldPosition,
  worldSeed
}: {
  entities: readonly SimulatedEntity[];
  footprintRadius: number;
  worldPosition: WorldPoint;
  worldSeed: string;
}) => {
  if (isWorldPositionBlockedByObstacle(worldPosition, footprintRadius, worldSeed)) {
    return false;
  }

  return ![...entities, ...deterministicRuntimeSupportEntities].some((entity) => {
    const requiredDistance = footprintRadius + entity.footprint.radius;

    return distanceBetweenWorldPoints(worldPosition, entity.worldPosition) < requiredDistance;
  });
};

const maintainLocalHostilePopulation = ({
  command,
  entities,
  nextHostileSequence,
  tick,
  worldSeed
}: Pick<EntitySimulationState, "entities" | "nextHostileSequence" | "worldSeed"> & {
  command: SimulationCommand;
  tick: number;
}) => {
  const playerEntity = getPlayerEntity(entities);

  if (!playerEntity || !isAlive(playerEntity)) {
    return {
      entities: [...entities],
      nextHostileSequence
    };
  }

  const retainedEntities = entities.filter(
    (entity) =>
      entity.role !== "hostile" ||
      !isAlive(entity) ||
      distanceBetweenWorldPoints(entity.worldPosition, playerEntity.worldPosition) <=
        hostileCombatContract.hostile.despawnDistanceWorldUnits
  );

  const localHostileCount = countLocalHostiles(retainedEntities, playerEntity);

  if (
    localHostileCount >= hostileCombatContract.hostile.localPopulationCap ||
    tick % hostileCombatContract.hostile.spawnCooldownTicks !== 0
  ) {
    return {
      entities: retainedEntities,
      nextHostileSequence
    };
  }

  for (
    let attempt = 0;
    attempt < hostileCombatContract.hostile.spawnAttemptCount;
    attempt += 1
  ) {
    const hostileSequence = nextHostileSequence + attempt;
    const candidatePosition = sampleHostileSpawnPosition({
      attempt,
      command,
      playerEntity,
      sequence: hostileSequence,
      tick,
      worldSeed
    });

    if (
      distanceBetweenWorldPoints(candidatePosition, playerEntity.worldPosition) <
      hostileCombatContract.hostile.safeSpawnDistanceWorldUnits
    ) {
      continue;
    }

    const hostileEntity = createHostileEntity(hostileSequence, candidatePosition, tick);

    if (
      !canSpawnEntityAtPosition({
        entities: retainedEntities,
        footprintRadius: hostileEntity.footprint.radius,
        worldPosition: candidatePosition,
        worldSeed
      })
    ) {
      continue;
    }

    return {
      entities: [...retainedEntities, hostileEntity],
      nextHostileSequence: hostileSequence + 1
    };
  }

  return {
    entities: retainedEntities,
    nextHostileSequence
  };
};

const countNearbyPickups = (entities: readonly SimulatedEntity[], playerEntity: SimulatedEntity) =>
  entities.filter(
    (entity) =>
      entity.role === "pickup" &&
      distanceBetweenWorldPoints(entity.worldPosition, playerEntity.worldPosition) <=
        pickupContract.pickup.despawnDistanceWorldUnits
  ).length;

const samplePickupSpawnPosition = ({
  playerEntity,
  sequence,
  worldSeed
}: {
  playerEntity: SimulatedEntity;
  sequence: number;
  worldSeed: string;
}) => {
  const angleSignature = sampleDeterministicSignature(
    `${worldSeed}:pickup-angle:${sequence}:${playerEntity.worldPosition.x}:${playerEntity.worldPosition.y}`
  );
  const distanceSignature = sampleDeterministicSignature(
    `${worldSeed}:pickup-distance:${sequence}:${playerEntity.worldPosition.x}:${playerEntity.worldPosition.y}`
  );
  const angleRadians = ((angleSignature % 360) * Math.PI) / 180;
  const distanceRatio = 0.85 + (distanceSignature % 45) / 100;
  const radialDistance =
    pickupContract.pickup.safeSpawnDistanceWorldUnits * distanceRatio;

  return {
    x: playerEntity.worldPosition.x + Math.cos(angleRadians) * radialDistance,
    y: playerEntity.worldPosition.y + Math.sin(angleRadians) * radialDistance
  };
};

const samplePickupKind = ({
  playerEntity,
  sequence,
  worldSeed
}: {
  playerEntity: SimulatedEntity;
  sequence: number;
  worldSeed: string;
}): SimulatedPickupKind => {
  const pickupRoll = sampleDeterministicSignature(
    `${worldSeed}:pickup-kind:${sequence}:${playerEntity.worldPosition.x}:${playerEntity.worldPosition.y}`
  );

  return pickupRoll % 100 < pickupContract.healingKit.spawnChancePercent
    ? "healing-kit"
    : "gold";
};

const maintainNearbyPickupPopulation = ({
  entities,
  nextPickupSequence,
  tick,
  worldSeed
}: Pick<EntitySimulationState, "entities" | "nextPickupSequence" | "worldSeed"> & {
  tick: number;
}) => {
  const playerEntity = getPlayerEntity(entities);

  if (!playerEntity || !isAlive(playerEntity)) {
    return {
      entities: [...entities],
      nextPickupSequence
    };
  }

  const retainedEntities = entities.filter(
    (entity) =>
      entity.role !== "pickup" ||
      distanceBetweenWorldPoints(entity.worldPosition, playerEntity.worldPosition) <=
        pickupContract.pickup.despawnDistanceWorldUnits
  );

  const nearbyPickupCount = countNearbyPickups(retainedEntities, playerEntity);

  if (
    nearbyPickupCount >= pickupContract.pickup.localPopulationCap ||
    tick % pickupContract.pickup.spawnCooldownTicks !== 0
  ) {
    return {
      entities: retainedEntities,
      nextPickupSequence
    };
  }

  for (let attempt = 0; attempt < pickupContract.pickup.spawnAttemptCount; attempt += 1) {
    const pickupSequence = nextPickupSequence + attempt;
    const candidatePosition = samplePickupSpawnPosition({
      playerEntity,
      sequence: pickupSequence,
      worldSeed
    });

    if (
      distanceBetweenWorldPoints(candidatePosition, playerEntity.worldPosition) <
      pickupContract.pickup.safeSpawnDistanceWorldUnits
    ) {
      continue;
    }

    const pickupEntity = createPickupEntity(
      pickupSequence,
      samplePickupKind({
        playerEntity,
        sequence: pickupSequence,
        worldSeed
      }),
      candidatePosition,
      tick
    );

    if (
      !canSpawnEntityAtPosition({
        entities: retainedEntities,
        footprintRadius: pickupEntity.footprint.radius,
        worldPosition: candidatePosition,
        worldSeed
      })
    ) {
      continue;
    }

    return {
      entities: [...retainedEntities, pickupEntity],
      nextPickupSequence: pickupSequence + 1
    };
  }

  return {
    entities: retainedEntities,
    nextPickupSequence
  };
};

const resolvePickupCollection = ({
  entities,
  runStats
}: Pick<EntitySimulationState, "entities" | "runStats">) => {
  const playerEntity = getPlayerEntity(entities);

  if (!playerEntity || !isAlive(playerEntity)) {
    return {
      entities: [...entities],
      runStats
    };
  }

  let nextPlayerEntity = playerEntity;
  const nextRunStats = { ...runStats };
  const retainedEntities: SimulatedEntity[] = [];

  for (const entity of entities) {
    if (entity.role !== "pickup" || !entity.pickupProfile) {
      retainedEntities.push(entity);
      continue;
    }

    if (!isEntityPairOverlapping(entity, nextPlayerEntity)) {
      retainedEntities.push(entity);
      continue;
    }

    if (entity.pickupProfile.kind === "healing-kit") {
      nextPlayerEntity = applyHealing(
        nextPlayerEntity,
        Math.ceil(nextPlayerEntity.combat.maxHealth * pickupContract.healingKit.healRatio)
      );
      nextRunStats.healingKitsCollected += 1;
      continue;
    }

    nextRunStats.goldCollected += pickupContract.gold.value;
  }

  return {
    entities: retainedEntities.map((entity) =>
      entity.id === nextPlayerEntity.id ? nextPlayerEntity : entity
    ),
    runStats: nextRunStats
  };
};

export const advanceSimulationState = (
  simulationState: EntitySimulationState,
  command: SimulationCommand = {}
): EntitySimulationState => {
  const worldSeed = command.worldSeed ?? simulationState.worldSeed;
  const nextTick = simulationState.tick + 1;
  const pickupMaintainedState = maintainNearbyPickupPopulation({
    entities: simulationState.entities,
    nextPickupSequence: simulationState.nextPickupSequence,
    tick: nextTick,
    worldSeed
  });
  const spawnMaintainedState = maintainLocalHostilePopulation({
    command,
    entities: pickupMaintainedState.entities,
    nextHostileSequence: simulationState.nextHostileSequence,
    tick: nextTick,
    worldSeed
  });
  const playerEntity = getPlayerEntity(spawnMaintainedState.entities);
  const movedEntities = spawnMaintainedState.entities.map((entity) =>
    resolveEntityMovement({
      dynamicColliders: spawnMaintainedState.entities.filter(
        (colliderEntity) => colliderEntity.id !== entity.id && isDynamicCollider(colliderEntity)
      ),
      entity,
      intent: resolveEntityIntent({
        command,
        entity,
        playerEntity,
        tick: simulationState.tick,
        worldSeed
      }),
      tick: nextTick,
      worldSeed
    })
  );
  const attackResolvedState = resolveAutomaticPlayerAttack(movedEntities, nextTick);
  const combatResolvedState = resolveHostileContactDamage(
    attackResolvedState.entities,
    spawnMaintainedState.entities,
    nextTick
  );
  const pickupResolvedState = resolvePickupCollection({
    entities: combatResolvedState.entities,
    runStats: simulationState.runStats
  });
  const defeatedHostileCount = combatResolvedState.entities.filter(
    (entity) => entity.role === "hostile" && !isAlive(entity)
  ).length;
  const survivingEntities = pickupResolvedState.entities.filter(
    (entity) => entity.role === "player" || isAlive(entity)
  );
  const nextPlayerEntity = getPlayerEntity(survivingEntities);

  return {
    entities: survivingEntities,
    entity: nextPlayerEntity,
    floatingDamageNumbers: pruneFloatingDamageNumbers(
      [
        ...simulationState.floatingDamageNumbers,
        ...attackResolvedState.floatingDamageNumbers,
        ...combatResolvedState.floatingDamageNumbers
      ],
      nextTick
    ),
    nextPickupSequence: pickupMaintainedState.nextPickupSequence,
    nextHostileSequence: spawnMaintainedState.nextHostileSequence,
    runStats: {
      ...pickupResolvedState.runStats,
      hostileDefeats: pickupResolvedState.runStats.hostileDefeats + defeatedHostileCount
    },
    tick: nextTick,
    worldSeed
  };
};
