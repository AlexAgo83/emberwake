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

export type SimulatedEntity = WorldEntity & {
  automaticAttack?: AutomaticAttackProfile;
  combat: EntityCombatState;
  contactDamageProfile?: ContactDamageProfile;
  focusState?: FocusState;
  movementSurfaceModifier: MovementSurfaceModifierKind;
  pickupProfile?: PickupProfile;
  role: SimulatedEntityRole;
  spawnedAtTick: number;
  velocity: WorldPoint;
};

export type EntitySimulationState = {
  entities: SimulatedEntity[];
  entity: SimulatedEntity;
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
  movementSurfaceModifier: "normal",
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

export const createInitialSimulationState = (): EntitySimulationState => {
  const playerEntity = createPlayerEntity();

  return {
    entities: [playerEntity],
    entity: playerEntity,
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
      movementSurfaceModifier: entity.movementSurfaceModifier ?? "normal",
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
      movementSurfaceModifier: entity.movementSurfaceModifier ?? "normal",
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
  tick
}: {
  command: SimulationCommand;
  entity: SimulatedEntity;
  playerEntity: SimulatedEntity;
  tick: number;
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
      state: "idle",
      velocity: { x: 0, y: 0 }
    };
  }

  return {
    focusTargetEntityId: playerEntity.id,
    state: "moving",
    velocity: createVelocityTowardTarget(
      entity.worldPosition,
      playerEntity.worldPosition,
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
  worldSeed
}: {
  dynamicColliders: readonly SimulatedEntity[];
  entity: SimulatedEntity;
  intent: ResolvedEntityIntent;
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

  return {
    ...entity,
    focusState: entity.focusState
      ? {
          ...entity.focusState,
          targetEntityId: intent.focusTargetEntityId ?? null
        }
      : undefined,
    movementSurfaceModifier: resolvedMovement.surfaceModifierKind,
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

const applyDamage = (entity: SimulatedEntity, damage: number): SimulatedEntity => ({
  ...entity,
  combat: {
    ...entity.combat,
    currentHealth: Math.max(0, entity.combat.currentHealth - damage)
  }
});

const applyHealing = (entity: SimulatedEntity, healing: number): SimulatedEntity => ({
  ...entity,
  combat: {
    ...entity.combat,
    currentHealth: Math.min(entity.combat.maxHealth, entity.combat.currentHealth + healing)
  }
});

const resolveAutomaticPlayerAttack = (
  entities: readonly SimulatedEntity[],
  tick: number
): SimulatedEntity[] => {
  const playerEntity = getPlayerEntity(entities);

  if (!playerEntity || !playerEntity.automaticAttack || !isAlive(playerEntity)) {
    return [...entities];
  }

  const { automaticAttack } = playerEntity;

  if (
    automaticAttack.lastAttackTick !== null &&
    tick - automaticAttack.lastAttackTick < automaticAttack.cooldownTicks
  ) {
    return [...entities];
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
    return [...entities];
  }

  return entities.map((entity) => {
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

    return applyDamage(entity, automaticAttack.damage);
  });
};

const isEntityPairOverlapping = (leftEntity: SimulatedEntity, rightEntity: SimulatedEntity) =>
  distanceBetweenWorldPoints(leftEntity.worldPosition, rightEntity.worldPosition) <=
  leftEntity.footprint.radius + rightEntity.footprint.radius + 0.5;

const resolveHostileContactDamage = (
  entities: readonly SimulatedEntity[],
  previousEntities: readonly SimulatedEntity[],
  tick: number
): SimulatedEntity[] => {
  const playerEntity = getPlayerEntity(entities);
  const previousPlayerEntity = getPlayerEntity(previousEntities);

  if (!playerEntity || !isAlive(playerEntity)) {
    return [...entities];
  }

  let nextPlayerEntity = playerEntity;
  const nextEntities = entities.map((entity) => ({ ...entity }));

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

    nextPlayerEntity = applyDamage(nextPlayerEntity, contactDamageProfile.damage);
    nextEntities[index] = {
      ...hostileEntity,
      contactDamageProfile: {
        ...contactDamageProfile,
        lastDamageTick: tick
      }
    };
  }

  return nextEntities.map((entity) =>
    entity.id === nextPlayerEntity.id ? nextPlayerEntity : entity
  );
};

const countLocalHostiles = (entities: readonly SimulatedEntity[], playerEntity: SimulatedEntity) =>
  entities.filter(
    (entity) =>
      entity.role === "hostile" &&
      isAlive(entity) &&
      distanceBetweenWorldPoints(entity.worldPosition, playerEntity.worldPosition) <=
        hostileCombatContract.hostile.acquisitionRadiusWorldUnits
  ).length;

const sampleHostileSpawnPosition = ({
  playerEntity,
  sequence,
  worldSeed
}: {
  playerEntity: SimulatedEntity;
  sequence: number;
  worldSeed: string;
}) => {
  const angleSignature = sampleDeterministicSignature(
    `${worldSeed}:hostile-angle:${sequence}:${playerEntity.worldPosition.x}:${playerEntity.worldPosition.y}`
  );
  const distanceSignature = sampleDeterministicSignature(
    `${worldSeed}:hostile-distance:${sequence}:${playerEntity.worldPosition.x}:${playerEntity.worldPosition.y}`
  );
  const angleRadians = ((angleSignature % 360) * Math.PI) / 180;
  const distanceRatio = 0.75 + (distanceSignature % 55) / 100;
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
  entities,
  nextHostileSequence,
  tick,
  worldSeed
}: Pick<EntitySimulationState, "entities" | "nextHostileSequence" | "worldSeed"> & {
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
      playerEntity,
      sequence: hostileSequence,
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
        tick: simulationState.tick
      }),
      worldSeed
    })
  );
  const attackResolvedEntities = resolveAutomaticPlayerAttack(movedEntities, nextTick);
  const combatResolvedEntities = resolveHostileContactDamage(
    attackResolvedEntities,
    spawnMaintainedState.entities,
    nextTick
  );
  const pickupResolvedState = resolvePickupCollection({
    entities: combatResolvedEntities,
    runStats: simulationState.runStats
  });
  const defeatedHostileCount = combatResolvedEntities.filter(
    (entity) => entity.role === "hostile" && !isAlive(entity)
  ).length;
  const survivingEntities = pickupResolvedState.entities.filter(
    (entity) => entity.role === "player" || isAlive(entity)
  );
  const nextPlayerEntity = getPlayerEntity(survivingEntities);

  return {
    entities: survivingEntities,
    entity: nextPlayerEntity,
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
