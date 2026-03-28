import { describe, expect, it } from "vitest";

import { createGenericMoverEntity } from "@game/content/entities/entityContract";
import { hostileCombatContract } from "./hostileCombatContract";
import { createInitialSimulationState, getScriptedEntityPhase, type SimulatedEntity } from "./entitySimulation";
import { resolveEntityIntent } from "./entitySimulationIntent";

describe("entitySimulationIntent", () => {
  it("makes shock ram hostiles telegraph before charging in a fixed direction", () => {
    const initialState = createInitialSimulationState();
    const hostileEntity: SimulatedEntity = {
      ...createGenericMoverEntity({
        id: "entity:hostile:shock-ram",
        visual: {
          kind: "debug-rammer",
          tint: "#ff4f63"
        },
        worldPosition: { x: -220, y: 0 }
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
      hostileBehaviorState: {
        chargeDirectionRadians: null,
        cooldownUntilTick: null,
        phase: null,
        phaseStartedAtTick: null
      },
      hostileProfileId: "shock-ram",
      movementSurfaceModifier: "normal",
      movementSpeedWorldUnitsPerSecond:
        hostileCombatContract.hostile.moveSpeedWorldUnitsPerSecond * 0.92,
      pathfindingState: {
        lastComputedTick: null,
        routeTiles: [],
        targetTile: null
      },
      role: "hostile",
      spawnedAtTick: 0,
      state: "idle",
      velocity: { x: 0, y: 0 },
      visualScale: 1
    };

    const telegraphIntent = resolveEntityIntent({
      command: {},
      entity: hostileEntity,
      getScriptedEntityPhase,
      playerEntity: initialState.entity,
      tick: 1,
      worldSeed: initialState.worldSeed
    });

    expect(telegraphIntent.state).toBe("idle");
    expect(telegraphIntent.velocity).toEqual({ x: 0, y: 0 });
    expect(telegraphIntent.hostileBehaviorState?.phase).toBe("telegraph");

    const chargeIntent = resolveEntityIntent({
      command: {},
      entity: {
        ...hostileEntity,
        hostileBehaviorState: telegraphIntent.hostileBehaviorState
      },
      getScriptedEntityPhase,
      playerEntity: initialState.entity,
      tick: 61,
      worldSeed: initialState.worldSeed
    });

    expect(chargeIntent.state).toBe("moving");
    expect(chargeIntent.hostileBehaviorState?.phase).toBe("charge");
    expect(Math.hypot(chargeIntent.velocity.x, chargeIntent.velocity.y)).toBeCloseTo(
      (hostileEntity.movementSpeedWorldUnitsPerSecond ?? 0) * 2
    );
  });
});
