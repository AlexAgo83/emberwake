import {
  advanceSimulationState,
  createInitialSimulationState,
  entitySimulationContract,
  getScriptedEntityPhase
} from "./entitySimulation";
import type { SimulatedEntity } from "./entitySimulation";
import { createGenericMoverEntity, entityContract } from "./entityContract";
import { singleEntityControlContract } from "../../input/model/singleEntityControlContract";
import { hostileCombatContract } from "@game/runtime/hostileCombatContract";
import { sampleWorldTileLayers } from "../../world/model/worldGeneration";
import { worldContract } from "../../world/model/worldContract";

describe("entitySimulation", () => {
  const createHostileFixture = (
    overrides: Partial<SimulatedEntity> = {}
  ): SimulatedEntity => ({
    ...createGenericMoverEntity({
      id: "entity:hostile:test",
      visual: {
        kind: "debug-sentinel",
        tint: "#ff6d78"
      },
      worldPosition: {
        x: 140,
        y: 0
      }
    }),
    combat: {
      currentHealth: hostileCombatContract.hostile.maxHealth,
      maxHealth: hostileCombatContract.hostile.maxHealth
    },
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
    spawnedAtTick: 0,
    velocity: {
      x: 0,
      y: 0
    },
    ...overrides
  });

  it("starts from a deterministic idle state", () => {
    const simulationState = createInitialSimulationState();

    expect(simulationState.tick).toBe(0);
    expect(simulationState.entity.state).toBe("idle");
    expect(simulationState.entities).toHaveLength(1);
    expect(simulationState.entity.combat.currentHealth).toBe(hostileCombatContract.player.maxHealth);
    expect(simulationState.entity.movementSurfaceModifier).toBe("normal");
    expect(simulationState.runStats).toEqual({
      goldCollected: 0,
      healingKitsCollected: 0,
      hostileDefeats: 0
    });
    expect(simulationState.floatingDamageNumbers).toEqual([]);
    expect(simulationState.entity.velocity).toEqual({ x: 0, y: 0 });
  });

  it("exposes deterministic scripted phases", () => {
    expect(getScriptedEntityPhase(0).state).toBe("idle");
    expect(getScriptedEntityPhase(80).velocity).toEqual({ x: 120, y: 0 });
    expect(getScriptedEntityPhase(260).velocity).toEqual({ x: 0, y: 120 });
  });

  it("advances entities in continuous world space with a fixed step", () => {
    let simulationState = createInitialSimulationState();

    for (let step = 0; step < 80; step += 1) {
      simulationState = advanceSimulationState(simulationState);
    }

    expect(simulationState.tick).toBe(80);
    expect(simulationState.entity.state).toBe("moving");
    expect(simulationState.entity.worldPosition.x).toBeCloseTo(
      20 * 120 * (entitySimulationContract.fixedStepMs / 1000)
    );
    expect(simulationState.entity.worldPosition.y).toBeCloseTo(0);
  });

  it("updates orientation from velocity while preserving it during idle phases", () => {
    let simulationState = createInitialSimulationState();

    for (let step = 0; step < 200; step += 1) {
      simulationState = advanceSimulationState(simulationState);
    }

    expect(simulationState.entity.orientation).toBeCloseTo(0);

    for (let step = 0; step < 120; step += 1) {
      simulationState = advanceSimulationState(simulationState);
    }

    expect(simulationState.entity.orientation).toBeCloseTo(Math.PI / 2);
  });

  it("lets the controlled entity override scripted motion with direct movement intent", () => {
    const simulationState = advanceSimulationState(createInitialSimulationState(), {
      controlState: {
        controlledEntityId: entityContract.primaryEntityId,
        debugCameraModifierActive: false,
        inputOwner: singleEntityControlContract.ownership.controlledEntity,
        movementIntent: {
          isActive: true,
          magnitude: 1,
          source: "keyboard",
          vector: {
            x: 0,
            y: -1
          }
        }
      }
    });

    expect(simulationState.entity.state).toBe("moving");
    expect(simulationState.entity.velocity).toEqual({
      x: 0,
      y: -singleEntityControlContract.desktopMoveSpeedWorldUnitsPerSecond
    });
    expect(simulationState.entity.worldPosition.y).toBeCloseTo(
      -singleEntityControlContract.desktopMoveSpeedWorldUnitsPerSecond *
        (entitySimulationContract.fixedStepMs / 1000)
    );
    expect(simulationState.entity.orientation).toBeCloseTo(-Math.PI / 2);
  });

  it("spawns hostile entities near the player without exceeding the first local cap", () => {
    let simulationState = createInitialSimulationState();
    const expectedFirstSpawnTick = hostileCombatContract.hostile.spawnCooldownTicks;

    for (let step = 0; step < expectedFirstSpawnTick; step += 1) {
      simulationState = advanceSimulationState(simulationState);
    }

    const hostileEntities = simulationState.entities.filter((entity) => entity.role === "hostile");

    expect(hostileEntities.length).toBeGreaterThan(0);
    expect(hostileEntities.length).toBeLessThanOrEqual(
      hostileCombatContract.hostile.localPopulationCap
    );
    expect(
      hostileEntities.every(
        (entity) =>
          entity.spawnedAtTick === expectedFirstSpawnTick &&
          Math.hypot(
            entity.worldPosition.x - simulationState.entity.worldPosition.x,
            entity.worldPosition.y - simulationState.entity.worldPosition.y
          ) >= hostileCombatContract.hostile.safeSpawnDistanceWorldUnits
      )
    ).toBe(true);
  });

  it("biases the first hostile spawn ahead of the player's active movement intent", () => {
    let simulationState = createInitialSimulationState();

    for (let step = 0; step < hostileCombatContract.hostile.spawnCooldownTicks; step += 1) {
      simulationState = advanceSimulationState(simulationState, {
        controlState: {
          controlledEntityId: entityContract.primaryEntityId,
          debugCameraModifierActive: false,
          inputOwner: "player-entity",
          movementIntent: {
            isActive: true,
            magnitude: 1,
            source: "keyboard",
            vector: {
              x: 1,
              y: 0
            }
          }
        }
      });
    }

    const hostileEntity = simulationState.entities.find((entity) => entity.role === "hostile");

    expect(hostileEntity).toBeDefined();
    expect(hostileEntity!.worldPosition.x).toBeGreaterThan(simulationState.entity.worldPosition.x);
  });

  it("moves hostiles toward the player when the player is in focus", () => {
    const initialState = createInitialSimulationState();
    const hostileEntity = createHostileFixture({
      worldPosition: {
        x: -120,
        y: 0
      }
    });

    const simulationState = advanceSimulationState({
      ...initialState,
      entities: [initialState.entity, hostileEntity],
      nextHostileSequence: 1
    });
    const movedHostile = simulationState.entities.find((entity) => entity.id === hostileEntity.id)!;

    expect(movedHostile.worldPosition.x).toBeGreaterThan(hostileEntity.worldPosition.x);
    expect(movedHostile.focusState?.targetEntityId).toBe(entityContract.primaryEntityId);
  });

  it("computes a bounded fallback route when direct hostile pursuit is blocked", () => {
    let blockingTile: { x: number; y: number } | null = null;

    for (let tileX = -160; tileX <= 160 && !blockingTile; tileX += 1) {
      for (let tileY = -160; tileY <= 160; tileY += 1) {
        if (sampleWorldTileLayers(tileX, tileY).obstacleKind === "solid") {
          blockingTile = { x: tileX, y: tileY };
          break;
        }
      }
    }

    expect(blockingTile).not.toBeNull();

    const initialState = createInitialSimulationState();
    const hostileEntity = createHostileFixture({
      worldPosition: {
        x: (blockingTile!.x - 1.5) * worldContract.tileSizeInWorldUnits,
        y: (blockingTile!.y + 0.5) * worldContract.tileSizeInWorldUnits
      }
    });
    const playerEntity = {
      ...initialState.entity,
      state: "idle" as const,
      worldPosition: {
        x: (blockingTile!.x + 2.5) * worldContract.tileSizeInWorldUnits,
        y: (blockingTile!.y + 0.5) * worldContract.tileSizeInWorldUnits
      }
    };

    const simulationState = advanceSimulationState({
      ...initialState,
      entities: [playerEntity, hostileEntity],
      entity: playerEntity,
      nextHostileSequence: 1
    });
    const routedHostile = simulationState.entities.find((entity) => entity.id === hostileEntity.id)!;

    expect(routedHostile.pathfindingState?.routeTiles.length ?? 0).toBeGreaterThan(0);
    expect(routedHostile.focusState?.targetEntityId).toBe(entityContract.primaryEntityId);
  });

  it("automatically damages hostiles inside the player's forward cone", () => {
    const initialState = createInitialSimulationState();
    const hostileEntity = createHostileFixture({
      combat: {
        currentHealth: hostileCombatContract.player.automaticConeAttack.damage,
        maxHealth: hostileCombatContract.hostile.maxHealth
      }
    });

    const simulationState = advanceSimulationState({
      ...initialState,
      entities: [initialState.entity, hostileEntity],
      nextHostileSequence: 1
    });

    expect(simulationState.entities.some((entity) => entity.id === hostileEntity.id)).toBe(false);
    expect(simulationState.entity.automaticAttack?.lastAttackTick).toBe(1);
    expect(simulationState.floatingDamageNumbers).toHaveLength(1);
    expect(simulationState.floatingDamageNumbers[0]).toMatchObject({
      amount: hostileCombatContract.player.automaticConeAttack.damage,
      sourceEntityId: hostileEntity.id
    });
    expect(simulationState.runStats.hostileDefeats).toBe(1);
  });

  it("applies hostile contact damage on overlap with a hostile-specific cooldown", () => {
    const initialState = createInitialSimulationState();
    const hostileEntity = createHostileFixture({
      worldPosition: {
        x: -20,
        y: 0
      }
    });

    const firstState = advanceSimulationState({
      ...initialState,
      entities: [
        {
          ...initialState.entity,
          automaticAttack: {
            ...initialState.entity.automaticAttack!,
            lastAttackTick: 0
          }
        },
        hostileEntity
      ],
      nextHostileSequence: 1,
      tick: 1
    });
    const firstHostile = firstState.entities.find((entity) => entity.id === hostileEntity.id)!;
    const secondState = advanceSimulationState({
      ...firstState,
      entities: [
        {
          ...firstState.entity,
          automaticAttack: {
            ...firstState.entity.automaticAttack!,
            lastAttackTick: firstState.tick
          }
        },
        firstHostile
      ]
    });

    expect(firstState.entity.combat.currentHealth).toBe(
      hostileCombatContract.player.maxHealth - hostileCombatContract.hostile.contactDamage
    );
    expect(firstState.entity.damageReactionState?.lastDamageAmount).toBe(
      hostileCombatContract.hostile.contactDamage
    );
    expect(firstState.floatingDamageNumbers).toHaveLength(1);
    expect(secondState.entity.combat.currentHealth).toBe(firstState.entity.combat.currentHealth);
  });

  it("spawns nearby pickups and increments gold when the player collects one", () => {
    let simulationState = createInitialSimulationState();

    for (let step = 0; step < 24; step += 1) {
      simulationState = advanceSimulationState(simulationState);
    }

    const pickupEntity = simulationState.entities.find((entity) => entity.role === "pickup");

    expect(pickupEntity).toBeDefined();

    const collectedState = advanceSimulationState({
      ...simulationState,
      entities: simulationState.entities.map((entity) =>
        entity.id === pickupEntity!.id
          ? {
              ...entity,
              pickupProfile: {
                kind: "gold"
              },
              worldPosition: { ...simulationState.entity.worldPosition }
            }
          : entity
      )
    });

    expect(collectedState.entities.some((entity) => entity.id === pickupEntity!.id)).toBe(false);
    expect(collectedState.runStats.goldCollected).toBe(1);
  });

  it("applies healing-kit pickups with a max-health clamp", () => {
    const initialState = createInitialSimulationState();
    const healingPickup = {
      ...createGenericMoverEntity({
        id: "entity:pickup:healing-kit:0",
        renderLayer: 90,
        visual: {
          kind: "pickup-healing-kit",
          tint: "#7dff9b"
        },
        worldPosition: { ...initialState.entity.worldPosition }
      }),
      combat: {
        currentHealth: 1,
        maxHealth: 1
      },
      footprint: {
        radius: 22
      },
      movementSurfaceModifier: "normal" as const,
      pickupProfile: {
        kind: "healing-kit" as const
      },
      role: "pickup" as const,
      spawnedAtTick: 0,
      state: "idle" as const,
      velocity: {
        x: 0,
        y: 0
      }
    };
    const healedState = advanceSimulationState({
      ...initialState,
      entities: [
        {
          ...initialState.entity,
          combat: {
            ...initialState.entity.combat,
            currentHealth: 30
          }
        },
        healingPickup
      ],
      nextPickupSequence: 1
    });

    expect(healedState.entity.combat.currentHealth).toBe(55);
    expect(healedState.runStats.healingKitsCollected).toBe(1);
  });
});
