import { describe, expect, it } from "vitest";

import {
  addPendingLevelUps,
  applyLevelUpChoice,
  createInitialBuildState,
  listActiveWeaponDefinitions,
  listPassiveItemDefinitions,
  normalizeBuildState,
  resolveActiveWeaponRuntimeStats,
  resolveBossDamageMultiplier,
  resolveBuildSummary,
  resolveChestReward,
  resolveEmergencyAegisChargeCount,
  resolveGoldGainMultiplier,
  resolvePickupRadiusMultiplier,
  resolveFusionReadyState
} from "./buildSystem";

describe("buildSystem", () => {
  it("starts from a bounded starter build state", () => {
    const buildState = createInitialBuildState();

    expect(buildState.activeSlots).toEqual([
      {
        fusionId: null,
        lastAttackTick: null,
        level: 1,
        weaponId: "ash-lash"
      }
    ]);
    expect(buildState.passiveSlots).toEqual([]);
    expect(buildState.pendingLevelUps).toBe(0);
    expect(buildState.nextChestDefeatMilestone).toBe(7);
  });

  it("creates level-up choices when pending levels are added", () => {
    const buildState = addPendingLevelUps(createInitialBuildState(), 1, 24);

    expect(buildState.pendingLevelUps).toBe(1);
    expect(buildState.levelUpChoices).toHaveLength(3);
    expect(buildState.levelUpChoices.some((choice) => choice.slotKind === "active")).toBe(true);
  });

  it("applies a level-up choice and clears the pending choice set", () => {
    const initialBuildState = addPendingLevelUps(createInitialBuildState(), 1, 24);
    const [firstChoice] = initialBuildState.levelUpChoices;
    const nextBuildState = applyLevelUpChoice(initialBuildState, 0, 24);

    expect(nextBuildState.pendingLevelUps).toBe(0);
    expect(nextBuildState.levelUpChoices).toEqual([]);
    expect(firstChoice).toBeDefined();

    if (firstChoice?.selectionKind === "new") {
      expect(
        nextBuildState.activeSlots.length + nextBuildState.passiveSlots.length
      ).toBe(
        initialBuildState.activeSlots.length + initialBuildState.passiveSlots.length + 1
      );
      return;
    }

    expect(nextBuildState.activeSlots[0]?.level).toBeGreaterThan(
      initialBuildState.activeSlots[0]?.level ?? 0
    );
  });

  it("recognizes fusion readiness once the required passive and active cap are present", () => {
    const buildState = normalizeBuildState({
      activeSlots: [
        {
          fusionId: null,
          lastAttackTick: null,
          level: 8,
          weaponId: "ash-lash"
        }
      ],
      passiveSlots: [
        {
          level: 1,
          passiveId: "overclock-seal"
        }
      ]
    });

    expect(resolveFusionReadyState(buildState, buildState.activeSlots[0]!)).toMatchObject({
      fusionId: "redline-ribbon"
    });
  });

  it("lets chest rewards resolve a ready fusion before a generic upgrade", () => {
    const buildState = normalizeBuildState({
      activeSlots: [
        {
          fusionId: null,
          lastAttackTick: null,
          level: 8,
          weaponId: "ash-lash"
        }
      ],
      passiveSlots: [
        {
          level: 1,
          passiveId: "overclock-seal"
        }
      ]
    });
    const nextBuildState = resolveChestReward(buildState, 64);

    expect(nextBuildState.activeSlots[0]?.fusionId).toBe("redline-ribbon");
    expect(nextBuildState.recentFusionId).toBe("redline-ribbon");
  });

  it("applies passive modifiers to resolved weapon stats", () => {
    const buildState = normalizeBuildState({
      activeSlots: [
        {
          fusionId: null,
          lastAttackTick: null,
          level: 3,
          weaponId: "guided-senbon"
        }
      ],
      passiveSlots: [
        {
          level: 2,
          passiveId: "hardlight-sheath"
        },
        {
          level: 1,
          passiveId: "duplex-relay"
        }
      ]
    });
    const stats = resolveActiveWeaponRuntimeStats(buildState, buildState.activeSlots[0]!);

    expect(stats.damage).toBeGreaterThan(20);
    expect(stats.targetCount).toBeGreaterThan(1);
  });

  it("scales vacuum tabi pickup reach more aggressively by level", () => {
    const buildState = normalizeBuildState({
      passiveSlots: [
        {
          level: 3,
          passiveId: "vacuum-tabi"
        }
      ]
    });

    expect(resolvePickupRadiusMultiplier(buildState)).toBeCloseTo(1.96);
  });

  it("exposes the full second-wave active and passive roster", () => {
    expect(listActiveWeaponDefinitions().map((definition) => definition.id)).toEqual(
      expect.arrayContaining([
        "orbiting-blades",
        "chain-lightning",
        "burning-trail",
        "boomerang-arc",
        "halo-burst",
        "frost-nova",
        "vacuum-pulse"
      ])
    );
    expect(listPassiveItemDefinitions().map((definition) => definition.id)).toEqual(
      expect.arrayContaining([
        "thorn-mail",
        "execution-sigil",
        "greed-engine",
        "boss-hunter",
        "emergency-aegis"
      ])
    );
  });

  it("keeps second-wave actives differentiated by role and runtime posture", () => {
    const buildState = normalizeBuildState({
      activeSlots: [
        {
          fusionId: null,
          lastAttackTick: null,
          level: 2,
          weaponId: "orbiting-blades"
        },
        {
          fusionId: null,
          lastAttackTick: null,
          level: 2,
          weaponId: "halo-burst"
        },
        {
          fusionId: null,
          lastAttackTick: null,
          level: 2,
          weaponId: "vacuum-pulse"
        }
      ]
    });

    const orbitStats = resolveActiveWeaponRuntimeStats(buildState, buildState.activeSlots[0]!);
    const haloStats = resolveActiveWeaponRuntimeStats(buildState, buildState.activeSlots[1]!);
    const vacuumStats = resolveActiveWeaponRuntimeStats(buildState, buildState.activeSlots[2]!);

    expect(orbitStats.attackKind).toBe("orbit");
    expect(haloStats.attackKind).toBe("nova");
    expect(vacuumStats.attackKind).toBe("vacuum");
    expect(haloStats.areaRadiusWorldUnits).toBeGreaterThan(orbitStats.areaRadiusWorldUnits);
    expect(vacuumStats.cooldownTicks).toBeLessThan(haloStats.cooldownTicks);
  });

  it("exposes economy boss and survivability passive modifiers for the second wave", () => {
    const buildState = normalizeBuildState({
      passiveSlots: [
        {
          level: 2,
          passiveId: "greed-engine"
        },
        {
          level: 3,
          passiveId: "boss-hunter"
        },
        {
          level: 1,
          passiveId: "emergency-aegis"
        }
      ]
    });

    expect(resolveGoldGainMultiplier(buildState)).toBeGreaterThan(1);
    expect(resolveBossDamageMultiplier(buildState)).toBeGreaterThan(1);
    expect(resolveEmergencyAegisChargeCount(buildState)).toBe(1);
  });

  it("summarizes the current build state for diagnostics and HUD surfaces", () => {
    const buildState = normalizeBuildState({
      activeSlots: [
        {
          fusionId: "redline-ribbon",
          lastAttackTick: null,
          level: 8,
          weaponId: "ash-lash"
        },
        {
          fusionId: null,
          lastAttackTick: null,
          level: 2,
          weaponId: "guided-senbon"
        }
      ],
      passiveSlots: [
        {
          level: 1,
          passiveId: "overclock-seal"
        }
      ]
    });

    expect(resolveBuildSummary(buildState)).toEqual({
      activeCount: 2,
      fusedActiveCount: 1,
      fusionReadyCount: 0,
      passiveCount: 1,
      pendingChoiceCount: 0
    });
  });
});
