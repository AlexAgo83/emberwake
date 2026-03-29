import {
  advanceSimulationState,
  createInitialSimulationState,
  entitySimulationContract,
  getScriptedEntityPhase,
  type EntitySimulationState,
  normalizeEntitySimulationState
} from "./entitySimulation";
import type { SimulatedEntity } from "./entitySimulation";
import { createGenericMoverEntity, entityContract } from "./entityContract";
import { singleEntityControlContract } from "../../input/model/singleEntityControlContract";
import { hostileCombatContract } from "@game/runtime/hostileCombatContract";
import { getHostileSpawnProfile } from "@game/runtime/hostilePressure";
import { resolveRunProgressionPhase } from "@game/runtime/runProgressionPhases";
import { emberwakeRuntimeBootstrap } from "@game/runtime/emberwakeRuntimeBootstrap";
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

  const createPickupFixture = (
    pickupKind: "crystal" | "gold" | "hourglass" | "magnet",
    overrides: Partial<SimulatedEntity> = {}
  ): SimulatedEntity => ({
    ...createGenericMoverEntity({
      id: `entity:pickup:${pickupKind}:fixture`,
      renderLayer: 90,
      visual: {
        kind:
          pickupKind === "crystal"
            ? "pickup-crystal"
            : pickupKind === "hourglass"
              ? "pickup-hourglass"
            : pickupKind === "magnet"
              ? "pickup-magnet"
              : "pickup-gold",
        tint:
          pickupKind === "crystal"
            ? "#73f2ff"
            : pickupKind === "hourglass"
              ? "#8ed9ff"
            : pickupKind === "magnet"
              ? "#ffd1ff"
              : "#ffd76c"
      },
      worldPosition: {
        x: 128,
        y: 0
      }
    }),
    combat: {
      currentHealth: 1,
      maxHealth: 1
    },
    footprint: {
      radius: 22
    },
    movementSurfaceModifier: "normal",
    pickupProfile: {
      kind: pickupKind,
      stackCount: 1
    },
    role: "pickup",
    spawnedAtTick: 0,
    state: "idle",
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
    expect(simulationState.runStats).toMatchObject({
      bossDefeats: 0,
      crystalsCollected: 0,
      currentLevel: 1,
      currentXp: 0,
      goldCollected: 0,
      healingKitsCollected: 0,
      hostileDefeats: 0
    });
    expect(simulationState.combatSkillFeedbackEvents).toEqual([]);
    expect(simulationState.floatingDamageNumbers).toEqual([]);
    expect(simulationState.entity.velocity).toEqual({ x: 0, y: 0 });
  });

  it("exposes the new hostile archetype contracts", () => {
    expect(getHostileSpawnProfile("needle-wisp")).toMatchObject({
      behaviorKind: "pursuit",
      moveSpeedMultiplier: 1.5,
      visualScaleMultiplier: 0.5
    });
    expect(getHostileSpawnProfile("shock-ram")).toMatchObject({
      behaviorKind: "telegraphed-charge",
      visualScaleMultiplier: 1
    });
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
    expect(simulationState.entity.orientation).toBeLessThan(0);
    expect(simulationState.entity.orientation).toBeGreaterThan(-Math.PI / 2);
  });

  it("spawns hostile entities near the player without exceeding the first local cap", () => {
    let simulationState = createInitialSimulationState();
    const expectedFirstSpawnTick = Math.round(
      hostileCombatContract.hostile.spawnCooldownTicks *
        resolveRunProgressionPhase(1).spawnCooldownMultiplier
    );

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
    const expectedFirstSpawnTick = Math.round(
      hostileCombatContract.hostile.spawnCooldownTicks *
        resolveRunProgressionPhase(1).spawnCooldownMultiplier
    );

    for (let step = 0; step < expectedFirstSpawnTick; step += 1) {
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

  it("introduces stronger hostile profiles once later phases open", () => {
    const initialState = createInitialSimulationState();
    const latePhaseSpawnTick = 4508;
    const simulationState = advanceSimulationState({
      ...initialState,
      nextHostileSequence: 6,
      tick: latePhaseSpawnTick - 1
    });
    const spawnedHostile = simulationState.entities.find((entity) => entity.role === "hostile");

    expect(spawnedHostile).toBeDefined();
    expect(spawnedHostile?.hostileProfileId).toBe("watchglass");
    expect(spawnedHostile?.combat.maxHealth).toBeGreaterThan(
      hostileCombatContract.hostile.maxHealth
    );
  });

  it("spawns an authored mini-boss beat every two minutes of survival", () => {
    const initialState = createInitialSimulationState();
    const miniBossBeatTick = 120 * 60;
    const simulationState = advanceSimulationState({
      ...initialState,
      tick: miniBossBeatTick - 1
    });
    const spawnedHostile = simulationState.entities.find((entity) => entity.role === "hostile");

    expect(spawnedHostile).toBeDefined();
    expect(spawnedHostile?.hostileProfileId).toBe("watchglass-prime");
    expect(spawnedHostile?.footprint.radius).toBeGreaterThan(50);
    expect(spawnedHostile?.visualScale).toBe(1.5);
    expect(spawnedHostile?.combat.maxHealth).toBe(
      Math.round(
        hostileCombatContract.hostile.maxHealth *
          resolveRunProgressionPhase(miniBossBeatTick).hostileMaxHealthMultiplier *
          getHostileSpawnProfile("watchglass-prime").maxHealthMultiplier
      )
    );
  });

  it("escalates newly spawned hostile stats after a boss has been defeated", () => {
    const initialState = createInitialSimulationState();
    const baselineState = advanceSimulationState(
      {
        ...initialState,
        nextHostileSequence: 4,
        tick: 4500
      },
      {
        profiling: {
          playerInvincible: false,
          spawnMode: "fixed-spawn-pressure"
        }
      }
    );
    const escalatedState = advanceSimulationState(
      {
        ...initialState,
        nextHostileSequence: 4,
        runStats: {
          ...initialState.runStats,
          bossDefeats: 1
        },
        tick: 4500
      },
      {
        profiling: {
          playerInvincible: false,
          spawnMode: "fixed-spawn-pressure"
        }
      }
    );

    const baselineHostile = baselineState.entities.find((entity) => entity.role === "hostile");
    const escalatedHostile = escalatedState.entities.find((entity) => entity.role === "hostile");

    expect(baselineHostile).toBeDefined();
    expect(escalatedHostile).toBeDefined();
    expect(baselineHostile?.hostileProfileId).toBe(escalatedHostile?.hostileProfileId);
    expect(escalatedHostile?.combat.maxHealth).toBeGreaterThan(
      baselineHostile?.combat.maxHealth ?? 0
    );
    expect(escalatedHostile?.contactDamageProfile?.damage).toBeGreaterThan(
      baselineHostile?.contactDamageProfile?.damage ?? 0
    );
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

  it("does not block the player against hidden runtime support entities that are not in the simulation state", () => {
    const initialState = createInitialSimulationState();
    const hiddenSupport = emberwakeRuntimeBootstrap.supportEntities[1]!;
    let simulationState: EntitySimulationState = {
      ...initialState,
      entities: [
        {
          ...initialState.entity,
          state: "idle" as const,
          worldPosition: {
            x: hiddenSupport.worldPosition.x - 120,
            y: hiddenSupport.worldPosition.y
          }
        }
      ]
    };
    simulationState.entity = simulationState.entities[0]!;

    for (let step = 0; step < 80; step += 1) {
      simulationState = advanceSimulationState(simulationState, {
        controlState: {
          controlledEntityId: entityContract.primaryEntityId,
          debugCameraModifierActive: false,
          inputOwner: singleEntityControlContract.ownership.controlledEntity,
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

    expect(simulationState.entity.worldPosition.x).toBeGreaterThan(hiddenSupport.worldPosition.x);
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
    expect(simulationState.combatSkillFeedbackEvents).toHaveLength(1);
    expect(simulationState.combatSkillFeedbackEvents[0]).toMatchObject({
      arcRadians: hostileCombatContract.player.automaticConeAttack.arcRadians,
      fusionId: null,
      kind: "slash-ribbon",
      sourceEntityId: entityContract.primaryEntityId,
      spawnedAtTick: 1,
      weaponId: "ash-lash"
    });
    expect(simulationState.floatingDamageNumbers).toHaveLength(1);
    expect(simulationState.floatingDamageNumbers[0]).toMatchObject({
      amount: 22,
      sourceEntityId: hostileEntity.id
    });
    expect(
      simulationState.entities.some(
        (entity) => entity.role === "pickup" && entity.pickupProfile?.kind === "crystal"
      )
    ).toBe(true);
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

  it("assigns unique floating damage ids when repeated same-tick hits target the player", () => {
    const initialState = createInitialSimulationState();
    const firstHostile = createHostileFixture({
      id: "entity:hostile:test:0",
      worldPosition: { x: 0, y: 0 }
    });
    const secondHostile = createHostileFixture({
      id: "entity:hostile:test:1",
      worldPosition: { x: 0, y: 0 }
    });

    const simulationState = advanceSimulationState({
      ...initialState,
      entities: [
        {
          ...initialState.entity,
          automaticAttack: {
            ...initialState.entity.automaticAttack!,
            lastAttackTick: 0
          }
        },
        firstHostile,
        secondHostile
      ],
      nextHostileSequence: 2,
      tick: 1
    });

    const playerDamageNumbers = simulationState.floatingDamageNumbers.filter(
      (damageNumber) => damageNumber.sourceEntityId === initialState.entity.id
    );

    expect(playerDamageNumbers).toHaveLength(2);
    expect(new Set(playerDamageNumbers.map((damageNumber) => damageNumber.id)).size).toBe(2);
  });

  it("drops floating damage numbers with a spawned tick ahead of the current simulation tick", () => {
    const initialState = createInitialSimulationState();

    const normalizedState = normalizeEntitySimulationState({
      ...initialState,
      floatingDamageNumbers: [
        {
          amount: 48,
          driftX: 2,
          id: "floating-damage:future",
          sourceEntityId: initialState.entity.id,
          spawnedAtTick: 12,
          worldPosition: {
            x: 96,
            y: 64
          }
        }
      ],
      tick: 4
    });

    expect(normalizedState.floatingDamageNumbers).toEqual([]);
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
                kind: "gold",
                stackCount: 3
              },
              worldPosition: { ...simulationState.entity.worldPosition }
            }
          : entity
      )
    });

    expect(collectedState.entities.some((entity) => entity.id === pickupEntity!.id)).toBe(false);
    expect(collectedState.runStats.goldCollected).toBe(6);
  });

  it("expires stale distant gold pickups early enough to free nearby utility spawn budget", () => {
    const initialState = createInitialSimulationState();
    const staleGoldPickup = createPickupFixture("gold", {
      id: "entity:pickup:gold:stale",
      spawnedAtTick: 0,
      worldPosition: {
        x: 1500,
        y: 0
      }
    });

    const nextState = advanceSimulationState({
      ...initialState,
      entities: [initialState.entity, staleGoldPickup],
      nextPickupSequence: 1,
      tick: 2000
    });

    expect(nextState.entities.some((entity) => entity.id === staleGoldPickup.id)).toBe(false);
  });

  it("keeps utility pickup respawns available even when nearby crystals fill the area", () => {
    const initialState = createInitialSimulationState();
    const nextState = advanceSimulationState({
      ...initialState,
      entities: [
        initialState.entity,
        createPickupFixture("crystal", {
          id: "entity:pickup:crystal:block-a",
          worldPosition: { x: 120, y: 0 }
        }),
        createPickupFixture("crystal", {
          id: "entity:pickup:crystal:block-b",
          worldPosition: { x: 150, y: 20 }
        }),
        createPickupFixture("crystal", {
          id: "entity:pickup:crystal:block-c",
          worldPosition: { x: 180, y: -12 }
        }),
        createPickupFixture("crystal", {
          id: "entity:pickup:crystal:block-d",
          worldPosition: { x: 210, y: 8 }
        })
      ],
      nextPickupSequence: 4,
      tick: 23
    });
    const utilityPickups = nextState.entities.filter(
      (entity) =>
        entity.role === "pickup" &&
        (entity.pickupProfile?.kind === "gold" ||
          entity.pickupProfile?.kind === "healing-kit" ||
          entity.pickupProfile?.kind === "magnet")
    );

    expect(utilityPickups.length).toBeGreaterThan(0);
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

  it("converts collected crystals into xp and level progression", () => {
    const initialState = createInitialSimulationState();
    const crystalPickup = {
      ...createGenericMoverEntity({
        id: "entity:pickup:crystal:0",
        renderLayer: 90,
        visual: {
          kind: "pickup-crystal",
          tint: "#73f2ff"
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
        kind: "crystal" as const
      },
      role: "pickup" as const,
      spawnedAtTick: 0,
      state: "idle" as const,
      velocity: {
        x: 0,
        y: 0
      }
    };

    const leveledState = advanceSimulationState({
      ...initialState,
      entities: [initialState.entity, crystalPickup, { ...crystalPickup, id: "entity:pickup:crystal:1" }, { ...crystalPickup, id: "entity:pickup:crystal:2" }, { ...crystalPickup, id: "entity:pickup:crystal:3" }],
      nextPickupSequence: 4
    });

    expect(leveledState.runStats.crystalsCollected).toBe(4);
    expect(leveledState.runStats.currentLevel).toBe(1);
    expect(leveledState.runStats.currentXp).toBe(72);
  });

  it("pulls nearby crystals into the player before awarding xp", () => {
    const initialState = createInitialSimulationState();
    const crystalPickup = createPickupFixture("crystal", {
      id: "entity:pickup:crystal:attract",
      worldPosition: { x: 74, y: 0 }
    });

    const attractedState = advanceSimulationState(
      {
        ...initialState,
        entities: [initialState.entity, crystalPickup],
        nextPickupSequence: 1
      },
      {
        profiling: {
          playerInvincible: false,
          spawnMode: "no-spawn"
        }
      }
    );
    const attractedCrystal = attractedState.entities.find(
      (entity) => entity.id === crystalPickup.id
    );

    expect(attractedState.runStats.currentXp).toBe(0);
    expect(attractedCrystal?.pickupProfile?.attractionState?.source).toBe("proximity");
    expect(attractedCrystal?.worldPosition.x).toBeLessThan(crystalPickup.worldPosition.x);

    const collectedState = advanceSimulationState(attractedState, {
      profiling: {
        playerInvincible: false,
        spawnMode: "no-spawn"
      }
    });

    expect(collectedState.entities.some((entity) => entity.id === crystalPickup.id)).toBe(false);
    expect(collectedState.runStats.currentXp).toBe(18);
    expect(collectedState.runStats.crystalsCollected).toBe(1);
  });

  it("lets a magnet pickup pull remote crystals toward the player", () => {
    const initialState = createInitialSimulationState();
    const remoteCrystal = createPickupFixture("crystal", {
      id: "entity:pickup:crystal:remote",
      worldPosition: { x: 520, y: 0 }
    });
    const magnetPickup = createPickupFixture("magnet", {
      id: "entity:pickup:magnet:0",
      pickupProfile: {
        kind: "magnet"
      },
      worldPosition: { ...initialState.entity.worldPosition }
    });

    const nextState = advanceSimulationState(
      {
        ...initialState,
        entities: [initialState.entity, magnetPickup, remoteCrystal],
        nextPickupSequence: 2
      },
      {
        profiling: {
          playerInvincible: false,
          spawnMode: "no-spawn"
        }
      }
    );
    const pulledCrystal = nextState.entities.find((entity) => entity.id === remoteCrystal.id);

    expect(nextState.entities.some((entity) => entity.id === magnetPickup.id)).toBe(false);
    expect(pulledCrystal?.pickupProfile?.attractionState?.source).toBe("magnet");
    expect(pulledCrystal?.worldPosition.x).toBeLessThan(remoteCrystal.worldPosition.x);
    expect(nextState.runStats.currentXp).toBe(0);
  });

  it("activates hourglass time stop without extending an already active stop", () => {
    const initialState = createInitialSimulationState();
    const overlappingHostile = createHostileFixture({
      id: "entity:hostile:hourglass",
      worldPosition: { x: 0, y: 0 }
    });
    const hourglassPickup = createPickupFixture("hourglass", {
      id: "entity:pickup:hourglass:0",
      pickupProfile: {
        kind: "hourglass"
      },
      worldPosition: { ...initialState.entity.worldPosition }
    });

    const firstState = advanceSimulationState(
      {
        ...initialState,
        entities: [initialState.entity, overlappingHostile, hourglassPickup]
      },
      {
        profiling: {
          playerInvincible: false,
          spawnMode: "no-spawn"
        }
      }
    );
    const frozenHostile = firstState.entities.find((entity) => entity.id === overlappingHostile.id);
    const activeDuration = firstState.enemyTimeStopUntilTick - firstState.tick;

    expect(firstState.enemyTimeStopUntilTick).toBeGreaterThan(firstState.tick);
    expect(firstState.entities.some((entity) => entity.id === hourglassPickup.id)).toBe(false);
    expect(firstState.entity.combat.currentHealth).toBe(
      initialState.entity.combat.currentHealth - overlappingHostile.contactDamageProfile!.damage
    );
    expect(frozenHostile?.hostileControlState?.frozenUntilTick ?? 0).toBeGreaterThan(firstState.tick);

    const secondHourglassPickup = createPickupFixture("hourglass", {
      id: "entity:pickup:hourglass:1",
      pickupProfile: {
        kind: "hourglass"
      },
      worldPosition: { ...firstState.entity.worldPosition }
    });
    const secondState = advanceSimulationState(
      {
        ...firstState,
        entities: [...firstState.entities, secondHourglassPickup]
      },
      {
        profiling: {
          playerInvincible: false,
          spawnMode: "no-spawn"
        }
      }
    );
    const heldHostile = secondState.entities.find((entity) => entity.id === overlappingHostile.id);

    expect(secondState.enemyTimeStopUntilTick).toBe(firstState.enemyTimeStopUntilTick);
    expect(secondState.entity.combat.currentHealth).toBe(firstState.entity.combat.currentHealth);
    expect(heldHostile?.velocity).toEqual({ x: 0, y: 0 });
    expect(activeDuration).toBeGreaterThanOrEqual(178);
  });

  it("removes legacy cache pickups from the active simulation", () => {
    const initialState = createInitialSimulationState();
    const legacyCachePickup: SimulatedEntity = {
      ...createGenericMoverEntity({
        id: "entity:pickup:cache:0",
        renderLayer: 90,
        visual: {
          kind: "pickup-cache",
          tint: "#9ae5ff"
        },
        worldPosition: { x: 96, y: 0 }
      }),
      combat: {
        currentHealth: 1,
        maxHealth: 1
      },
      footprint: {
        radius: 22
      },
      movementSurfaceModifier: "normal",
      pickupProfile: {
        kind: "cache"
      },
      role: "pickup",
      spawnedAtTick: 0,
      state: "idle",
      velocity: {
        x: 0,
        y: 0
      }
    };

    const nextState = advanceSimulationState(
      {
        ...initialState,
        entities: [initialState.entity, legacyCachePickup],
        nextPickupSequence: 1
      },
      {
        profiling: {
          playerInvincible: false,
          spawnMode: "no-spawn"
        }
      }
    );

    expect(nextState.entities.some((entity) => entity.pickupProfile?.kind === "cache")).toBe(false);
  });

  it("consolidates nearby hostile crystal drops into a single stacked pickup", () => {
    const initialState = createInitialSimulationState();
    const stackedCrystalPickup = {
      ...createGenericMoverEntity({
        id: "entity:pickup:crystal:existing",
        renderLayer: 90,
        visual: {
          kind: "pickup-crystal",
          tint: "#73f2ff"
        },
        worldPosition: { x: 128, y: 0 }
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
        kind: "crystal" as const,
        stackCount: 2
      },
      role: "pickup" as const,
      spawnedAtTick: 0,
      state: "idle" as const,
      velocity: {
        x: 0,
        y: 0
      }
    };
    const defeatedHostiles = Array.from({ length: 4 }, (_, hostileIndex) =>
      createHostileFixture({
        combat: {
          currentHealth: 0,
          maxHealth: hostileCombatContract.hostile.maxHealth
        },
        id: `entity:hostile:defeated:${hostileIndex}`,
        worldPosition: {
          x: 128 + hostileIndex * 6,
          y: 0
        }
      })
    );

    const nextState = advanceSimulationState({
      ...initialState,
      entities: [initialState.entity, stackedCrystalPickup, ...defeatedHostiles],
      nextPickupSequence: 1
    });
    const crystalPickups = nextState.entities.filter(
      (entity) => entity.role === "pickup" && entity.pickupProfile?.kind === "crystal"
    );

    expect(crystalPickups).toHaveLength(1);
    expect(crystalPickups[0]?.pickupProfile?.stackCount).toBe(6);
    expect(nextState.runStats.hostileDefeats).toBe(4);
  });

  it("periodically compacts nearby stacked pickups that already exist in the world", () => {
    const initialState = createInitialSimulationState();
    const nextState = advanceSimulationState(
      {
        ...initialState,
        entities: [
          initialState.entity,
          createPickupFixture("crystal", {
            id: "entity:pickup:crystal:a",
            pickupProfile: {
              kind: "crystal",
              stackCount: 1
            },
            worldPosition: { x: 128, y: 0 }
          }),
          createPickupFixture("crystal", {
            id: "entity:pickup:crystal:b",
            pickupProfile: {
              kind: "crystal",
              stackCount: 2
            },
            worldPosition: { x: 140, y: 0 }
          }),
          createPickupFixture("crystal", {
            id: "entity:pickup:crystal:c",
            pickupProfile: {
              kind: "crystal",
              stackCount: 3
            },
            worldPosition: { x: 154, y: 0 }
          })
        ],
        tick: 29
      },
      {
        profiling: {
          playerInvincible: false,
          spawnMode: "no-spawn"
        }
      }
    );
    const crystalPickups = nextState.entities.filter(
      (entity) => entity.role === "pickup" && entity.pickupProfile?.kind === "crystal"
    );

    expect(crystalPickups).toHaveLength(1);
    expect(crystalPickups[0]?.pickupProfile?.stackCount).toBe(6);
    expect(crystalPickups[0]?.visual.tint).toBe("#73f2ff");
  });

  it("creates a distant super crystal by compacting off-player pickup clusters", () => {
    const initialState = createInitialSimulationState();
    const nextState = advanceSimulationState(
      {
        ...initialState,
        entities: [
          initialState.entity,
          createPickupFixture("crystal", {
            id: "entity:pickup:crystal:remote-a",
            worldPosition: { x: 2100, y: 80 }
          }),
          createPickupFixture("crystal", {
            id: "entity:pickup:crystal:remote-b",
            pickupProfile: {
              kind: "crystal",
              stackCount: 2
            },
            worldPosition: { x: 2190, y: 92 }
          }),
          createPickupFixture("crystal", {
            id: "entity:pickup:crystal:remote-c",
            pickupProfile: {
              kind: "crystal",
              stackCount: 4
            },
            worldPosition: { x: 2260, y: 108 }
          })
        ],
        tick: 29
      },
      {
        profiling: {
          playerInvincible: false,
          spawnMode: "no-spawn"
        }
      }
    );
    const crystalPickups = nextState.entities.filter(
      (entity) => entity.role === "pickup" && entity.pickupProfile?.kind === "crystal"
    );

    expect(crystalPickups).toHaveLength(1);
    expect(crystalPickups[0]?.pickupProfile?.stackCount).toBe(7);
    expect(crystalPickups[0]?.worldPosition.x).toBeGreaterThan(2100);
    expect(crystalPickups[0]?.worldPosition.x).toBeLessThan(2260);
    expect(crystalPickups[0]?.visual.tint).toBe("#73f2ff");
  });

  it("turns merged crystals green once they exceed ten times a base crystal value", () => {
    const initialState = createInitialSimulationState();
    const nextState = advanceSimulationState(
      {
        ...initialState,
        entities: [
          initialState.entity,
          createPickupFixture("crystal", {
            id: "entity:pickup:crystal:green-a",
            pickupProfile: {
              kind: "crystal",
              stackCount: 6
            },
            worldPosition: { x: 128, y: 0 }
          }),
          createPickupFixture("crystal", {
            id: "entity:pickup:crystal:green-b",
            pickupProfile: {
              kind: "crystal",
              stackCount: 5
            },
            worldPosition: { x: 142, y: 0 }
          })
        ],
        tick: 29
      },
      {
        profiling: {
          playerInvincible: false,
          spawnMode: "no-spawn"
        }
      }
    );
    const mergedCrystal = nextState.entities.find(
      (entity) => entity.role === "pickup" && entity.pickupProfile?.kind === "crystal"
    );

    expect(mergedCrystal?.pickupProfile?.stackCount).toBe(11);
    expect(mergedCrystal?.visual.tint).toBe("#7dff9b");
  });

  it("turns merged crystals red once they exceed fifty times a base crystal value", () => {
    const initialState = createInitialSimulationState();
    const nextState = advanceSimulationState(
      {
        ...initialState,
        entities: [
          initialState.entity,
          createPickupFixture("crystal", {
            id: "entity:pickup:crystal:red-a",
            pickupProfile: {
              kind: "crystal",
              stackCount: 26
            },
            worldPosition: { x: 128, y: 0 }
          }),
          createPickupFixture("crystal", {
            id: "entity:pickup:crystal:red-b",
            pickupProfile: {
              kind: "crystal",
              stackCount: 25
            },
            worldPosition: { x: 146, y: 0 }
          })
        ],
        tick: 29
      },
      {
        profiling: {
          playerInvincible: false,
          spawnMode: "no-spawn"
        }
      }
    );
    const mergedCrystal = nextState.entities.find(
      (entity) => entity.role === "pickup" && entity.pickupProfile?.kind === "crystal"
    );

    expect(mergedCrystal?.pickupProfile?.stackCount).toBe(51);
    expect(mergedCrystal?.visual.tint).toBe("#ff5a5a");
  });

  it("lets vacuum pulse trigger map-wide crystal attraction when it fires", () => {
    const initialState = createInitialSimulationState();
    const vacuumState = normalizeEntitySimulationState({
      ...initialState,
      buildState: {
        ...initialState.buildState,
        activeSlots: [
          {
            fusionId: null,
            lastAttackTick: null,
            level: 1,
            weaponId: "vacuum-pulse"
          }
        ]
      },
      entities: [
        initialState.entity,
        createHostileFixture({
          id: "entity:hostile:vacuum-target",
          worldPosition: { x: 96, y: 0 }
        }),
        createPickupFixture("crystal", {
          id: "entity:pickup:crystal:vacuum",
          worldPosition: { x: 240, y: 0 }
        })
      ]
    });

    const nextState = advanceSimulationState(vacuumState, {
      profiling: {
        playerInvincible: false,
        spawnMode: "no-spawn"
      }
    });
    const crystalEntity = nextState.entities.find(
      (entity) => entity.id === "entity:pickup:crystal:vacuum"
    );

    expect(nextState.pickupPulseUntilTick).toBeGreaterThan(nextState.tick);
    expect(crystalEntity?.worldPosition.x ?? Number.POSITIVE_INFINITY).toBeLessThan(240);
  });

  it("freezes nearby hostiles when frost nova resolves", () => {
    const initialState = createInitialSimulationState();
    const frostState = normalizeEntitySimulationState({
      ...initialState,
      buildState: {
        ...initialState.buildState,
        activeSlots: [
          {
            fusionId: null,
            lastAttackTick: null,
            level: 1,
            weaponId: "frost-nova"
          }
        ]
      },
      entities: [
        initialState.entity,
        createHostileFixture({
          id: "entity:hostile:frost-target",
          worldPosition: { x: 72, y: 0 }
        })
      ]
    });

    const frozenState = advanceSimulationState(frostState, {
      profiling: {
        playerInvincible: false,
        spawnMode: "no-spawn"
      }
    });
    const frozenHostile = frozenState.entities.find(
      (entity) => entity.id === "entity:hostile:frost-target"
    );
    const heldState = advanceSimulationState(frozenState, {
      profiling: {
        playerInvincible: false,
        spawnMode: "no-spawn"
      }
    });
    const heldHostile = heldState.entities.find(
      (entity) => entity.id === "entity:hostile:frost-target"
    );

    expect(frozenHostile?.hostileControlState?.frozenUntilTick ?? 0).toBeGreaterThan(
      frozenState.tick
    );
    expect(heldHostile?.velocity).toEqual({ x: 0, y: 0 });
  });

  it("amplifies collected gold when greed engine is equipped", () => {
    const initialState = createInitialSimulationState();
    const greedState = normalizeEntitySimulationState({
      ...initialState,
      buildState: {
        ...initialState.buildState,
        passiveSlots: [
          {
            level: 2,
            passiveId: "greed-engine"
          }
        ]
      },
      entities: [
        initialState.entity,
        createPickupFixture("gold", {
          id: "entity:pickup:gold:greed",
          worldPosition: { x: 12, y: 0 }
        })
      ]
    });

    const nextState = advanceSimulationState(greedState, {
      profiling: {
        playerInvincible: false,
        spawnMode: "no-spawn"
      }
    });

    expect(nextState.runStats.goldCollected).toBeGreaterThan(2);
  });

  it("spends emergency aegis to keep the player alive after lethal contact", () => {
    const initialState = createInitialSimulationState();
    const aegisState = normalizeEntitySimulationState({
      ...initialState,
      buildState: {
        ...initialState.buildState,
        passiveSlots: [
          {
            level: 1,
            passiveId: "emergency-aegis"
          }
        ]
      },
      entities: [
        initialState.entity,
        createHostileFixture({
          id: "entity:hostile:aegis",
          contactDamageProfile: {
            cooldownTicks: hostileCombatContract.hostile.contactDamageCooldownTicks,
            damage: 999,
            lastDamageTick: null
          },
          worldPosition: { x: 0, y: 0 }
        })
      ]
    });

    const nextState = advanceSimulationState(aegisState, {
      profiling: {
        playerInvincible: false,
        spawnMode: "no-spawn"
      }
    });

    expect(nextState.entity.combat.currentHealth).toBeGreaterThan(0);
    expect(nextState.emergencyAegisChargesSpent).toBe(1);
  });

  it("turns event horizon into a vacuum fusion that freezes nearby hostiles", () => {
    const initialState = createInitialSimulationState();
    const horizonState = normalizeEntitySimulationState({
      ...initialState,
      buildState: {
        ...initialState.buildState,
        activeSlots: [
          {
            fusionId: "event-horizon",
            lastAttackTick: null,
            level: 8,
            weaponId: "null-canister"
          }
        ],
        passiveSlots: [
          {
            level: 1,
            passiveId: "vacuum-tabi"
          }
        ]
      },
      entities: [
        initialState.entity,
        createHostileFixture({
          combat: {
            currentHealth: 220,
            maxHealth: 220
          },
          id: "entity:hostile:event-horizon",
          worldPosition: { x: 84, y: 0 }
        }),
        createPickupFixture("crystal", {
          id: "entity:pickup:crystal:event-horizon",
          worldPosition: { x: 240, y: 0 }
        })
      ]
    });

    const nextState = advanceSimulationState(horizonState, {
      profiling: {
        playerInvincible: false,
        spawnMode: "no-spawn"
      }
    });
    const hostileEntity = nextState.entities.find(
      (entity) => entity.id === "entity:hostile:event-horizon"
    );
    const crystalEntity = nextState.entities.find(
      (entity) => entity.id === "entity:pickup:crystal:event-horizon"
    );

    expect(nextState.pickupPulseUntilTick).toBeGreaterThan(nextState.tick + 10);
    expect(hostileEntity?.hostileControlState?.frozenUntilTick ?? 0).toBeGreaterThan(
      nextState.tick
    );
    expect(crystalEntity?.worldPosition.x ?? Number.POSITIVE_INFINITY).toBeLessThan(240);
  });

  it("lets afterimage pyre hit harder than baseline cinder arc on the same target", () => {
    const initialState = createInitialSimulationState();
    const baseCinderState = normalizeEntitySimulationState({
      ...initialState,
      buildState: {
        ...initialState.buildState,
        activeSlots: [
          {
            fusionId: null,
            lastAttackTick: null,
            level: 8,
            weaponId: "cinder-arc"
          }
        ]
      },
      entities: [
        initialState.entity,
        createHostileFixture({
          combat: {
            currentHealth: 220,
            maxHealth: 220
          },
          id: "entity:hostile:base-cinder",
          worldPosition: { x: 120, y: 0 }
        })
      ]
    });
    const afterimageState = normalizeEntitySimulationState({
      ...initialState,
      buildState: {
        ...initialState.buildState,
        activeSlots: [
          {
            fusionId: "afterimage-pyre",
            lastAttackTick: null,
            level: 8,
            weaponId: "cinder-arc"
          }
        ],
        passiveSlots: [
          {
            level: 1,
            passiveId: "echo-thread"
          }
        ]
      },
      entities: [
        initialState.entity,
        createHostileFixture({
          combat: {
            currentHealth: 220,
            maxHealth: 220
          },
          id: "entity:hostile:afterimage",
          worldPosition: { x: 120, y: 0 }
        })
      ]
    });

    const baseNextState = advanceSimulationState(baseCinderState, {
      profiling: {
        playerInvincible: false,
        spawnMode: "no-spawn"
      }
    });
    const afterimageNextState = advanceSimulationState(afterimageState, {
      profiling: {
        playerInvincible: false,
        spawnMode: "no-spawn"
      }
    });
    const baseTarget = baseNextState.entities.find(
      (entity) => entity.id === "entity:hostile:base-cinder"
    );
    const afterimageTarget = afterimageNextState.entities.find(
      (entity) => entity.id === "entity:hostile:afterimage"
    );

    expect(afterimageTarget?.combat.currentHealth ?? Number.POSITIVE_INFINITY).toBeLessThan(
      baseTarget?.combat.currentHealth ?? 0
    );
  });

  it("compacts dense far crystal fields without losing collectible value", () => {
    const initialState = createInitialSimulationState();
    const crystalEntities = Array.from({ length: 24 }, (_, index) =>
      createPickupFixture("crystal", {
        id: `entity:pickup:crystal:dense:${index}`,
        worldPosition: {
          x: 6_000 + (index % 6) * 42,
          y: 6_000 + Math.floor(index / 6) * 42
        }
      })
    );
    const compactedState = advanceSimulationState(
      {
        ...initialState,
        entities: [initialState.entity, ...crystalEntities],
        tick: 29
      },
      {
        profiling: {
          playerInvincible: false,
          spawnMode: "no-spawn"
        }
      }
    );
    const compactedCrystalEntities = compactedState.entities.filter(
      (entity) => entity.role === "pickup" && entity.pickupProfile?.kind === "crystal"
    );
    const totalCrystalStackCount = compactedCrystalEntities.reduce(
      (currentTotal, entity) => currentTotal + Math.max(1, entity.pickupProfile?.stackCount ?? 1),
      0
    );

    expect(compactedCrystalEntities.length).toBeLessThan(crystalEntities.length);
    expect(totalCrystalStackCount).toBe(crystalEntities.length);
    expect(
      compactedCrystalEntities.every((entity) =>
        ["pickup-crystal-high", "pickup-crystal-low", "pickup-crystal-mid"].includes(
          entity.visual.kind
        )
      )
    ).toBe(true);
  });
});
