import type { WorldPoint } from "@engine/geometry/primitives";
import {
  tileCoordinateToWorldOrigin,
  worldContract,
  worldPointToTileCoordinate
} from "@engine/world/worldContract";
import { createGenericMoverEntity } from "@game/content/entities/entityContract";
import { obstacleDefinitions, sampleWorldPointLayers, sampleWorldTileLayers } from "@game/content/world/worldGeneration";
import type { SingleEntityControlState } from "@game/input/singleEntityControlContract";
import type { EntityState, WorldEntity } from "@game/content/entities/entityContract";
import {
  deterministicRuntimeSupportEntities,
  emberwakeRuntimeBootstrap
} from "@game/runtime/emberwakeRuntimeBootstrap";
import { hostileCombatContract } from "@game/runtime/hostileCombatContract";
import { pickupContract } from "@game/runtime/pickupContract";
import { resolvePseudoPhysicalMovement } from "@game/runtime/pseudoPhysics";
import {
  entityCombatPresentationContract,
  pruneFloatingDamageNumbers,
  resolveAutomaticPlayerAttack,
  resolveHostileContactDamage,
  resolvePickupCollection
} from "@game/runtime/entitySimulationCombat";
import { resolveEntityIntent } from "@game/runtime/entitySimulationIntent";
import {
  maintainLocalHostilePopulation,
  maintainNearbyPickupPopulation
} from "@game/runtime/entitySimulationSpawn";
import type { MovementSurfaceModifierKind } from "@game/content/world/worldData";

export const entitySimulationContract = {
  fixedStepMs: 1000 / 60,
  maxCatchUpStepsPerFrame: 6,
  speedOptions: [0.5, 1, 2] as const
} as const;
export { entityCombatPresentationContract };

export type SimulatedPickupKind = "crystal" | "gold" | "healing-kit";

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
  crystalsCollected: number;
  currentLevel: number;
  currentXp: number;
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

export type SimulationCommand = {
  controlState?: SingleEntityControlState;
  worldSeed?: string;
};

export type ScriptedPhase = {
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

const createCombatState = (maxHealth: number): EntityCombatState => ({
  currentHealth: maxHealth,
  maxHealth
});

const createDamageReactionState = (): DamageReactionState => ({
  lastDamageAmount: null,
  lastDamageTick: null
});

const createInitialRunStats = (): RunStats => ({
  crystalsCollected: 0,
  currentLevel: 1,
  currentXp: 0,
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
      kind:
        pickupKind === "healing-kit"
          ? "pickup-healing-kit"
          : pickupKind === "crystal"
            ? "pickup-crystal"
            : "pickup-gold",
      tint:
        pickupKind === "healing-kit"
          ? "#7dff9b"
          : pickupKind === "crystal"
            ? "#73f2ff"
            : "#ffd76c"
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

const movementVectorMagnitude = (vector: WorldPoint) => Math.hypot(vector.x, vector.y);

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
      (entity.id.includes(":healing-kit:")
        ? "healing-kit"
        : entity.id.includes(":crystal:")
          ? "crystal"
          : "gold");

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
  intent: ReturnType<typeof resolveEntityIntent>;
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

export const advanceSimulationState = (
  simulationState: EntitySimulationState,
  command: SimulationCommand = {}
): EntitySimulationState => {
  const worldSeed = command.worldSeed ?? simulationState.worldSeed;
  const nextTick = simulationState.tick + 1;
  const pickupMaintainedState = maintainNearbyPickupPopulation({
    canSpawnEntityAtPosition,
    createPickupEntity,
    entities: simulationState.entities,
    nextPickupSequence: simulationState.nextPickupSequence,
    tick: nextTick,
    worldSeed
  });
  const spawnMaintainedState = maintainLocalHostilePopulation({
    canSpawnEntityAtPosition,
    command,
    createHostileEntity,
    entities: pickupMaintainedState.entities,
    nextHostileSequence: simulationState.nextHostileSequence,
    spawnHeadingMemoryTicks: entityCombatPresentationContract.spawnHeadingMemoryTicks,
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
        getScriptedEntityPhase,
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
    entities: (() => {
      const defeatedHostiles = combatResolvedState.entities.filter(
        (entity) => entity.role === "hostile" && !isAlive(entity)
      );

      if (defeatedHostiles.length === 0) {
        return combatResolvedState.entities;
      }

      const droppedCrystalEntities = defeatedHostiles.flatMap((hostileEntity, hostileIndex) =>
        Array.from({ length: pickupContract.crystal.enemyDropCount }, (_, crystalIndex) =>
          createPickupEntity(
            pickupMaintainedState.nextPickupSequence +
              hostileIndex * pickupContract.crystal.enemyDropCount +
              crystalIndex,
            "crystal",
            hostileEntity.worldPosition,
            nextTick
          )
        )
      );

      return [...combatResolvedState.entities, ...droppedCrystalEntities];
    })(),
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
    nextPickupSequence:
      pickupMaintainedState.nextPickupSequence +
      defeatedHostileCount * pickupContract.crystal.enemyDropCount,
    nextHostileSequence: spawnMaintainedState.nextHostileSequence,
    runStats: {
      ...pickupResolvedState.runStats,
      hostileDefeats: pickupResolvedState.runStats.hostileDefeats + defeatedHostileCount
    },
    tick: nextTick,
    worldSeed
  };
};
