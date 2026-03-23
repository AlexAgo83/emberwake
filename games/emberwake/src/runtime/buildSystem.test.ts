import { describe, expect, it } from "vitest";

import {
  addPendingLevelUps,
  applyLevelUpChoice,
  createInitialBuildState,
  normalizeBuildState,
  resolveActiveWeaponRuntimeStats,
  resolveBuildSummary,
  resolveChestReward,
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
    expect(buildState.nextChestDefeatMilestone).toBe(8);
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
