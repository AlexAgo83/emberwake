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
    expect(secondState.entity.combat.currentHealth).toBe(firstState.entity.combat.currentHealth);
  });
});
