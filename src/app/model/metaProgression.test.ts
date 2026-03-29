import { describe, expect, it } from "vitest";

import {
  createDefaultMetaProfile,
  purchaseTalentRank,
  resolveShopOwnershipProgress,
  resolveTalentEffectPreview,
  resolveTalentNextCost
} from "./metaProgression";
import type { ShopUnlockId } from "./metaProgression";

describe("metaProgression talent costs", () => {
  it("uses a steeper escalating cost curve for standard talents", () => {
    const profile = createDefaultMetaProfile();

    expect(resolveTalentNextCost(profile, "max-health")).toBe(14);
    expect(resolveTalentNextCost(profile, "pickup-radius")).toBe(12);
    expect(resolveTalentNextCost(profile, "gold-gain")).toBe(12);
    expect(resolveTalentNextCost(profile, "xp-gain")).toBe(14);
    expect(resolveTalentNextCost(profile, "move-speed")).toBe(14);
    expect(resolveTalentNextCost(profile, "shield")).toBe(140);
  });

  it("applies the next stronger tier cost after each purchased rank", () => {
    const purchasedProfile = purchaseTalentRank(
      {
        ...createDefaultMetaProfile(),
        goldBalance: 200,
        talentRanks: {
          ...createDefaultMetaProfile().talentRanks,
          "max-health": 0
        }
      },
      "max-health"
    );

    expect(purchasedProfile.goldBalance).toBe(186);
    expect(purchasedProfile.talentRanks["max-health"]).toBe(1);
    expect(resolveTalentNextCost(purchasedProfile, "max-health")).toBe(28);
  });

  it("derives owned and projected percentage-based talent effects from runtime modifiers", () => {
    const profile = {
      ...createDefaultMetaProfile(),
      talentRanks: {
        ...createDefaultMetaProfile().talentRanks,
        "gold-gain": 1
      }
    };

    expect(resolveTalentEffectPreview(profile, "gold-gain")).toEqual({
      currentEffectLabel: "+12%",
      nextIncrementLabel: "+12%",
      projectedTotalLabel: "+24%"
    });
  });

  it("keeps fixed-value talent previews in honest units", () => {
    const profile = {
      ...createDefaultMetaProfile(),
      talentRanks: {
        ...createDefaultMetaProfile().talentRanks,
        "max-health": 1,
        shield: 1
      }
    };

    expect(resolveTalentEffectPreview(profile, "max-health")).toEqual({
      currentEffectLabel: "+12 HP",
      nextIncrementLabel: "+12 HP",
      projectedTotalLabel: "+24 HP"
    });
    expect(resolveTalentEffectPreview(profile, "shield")).toEqual({
      currentEffectLabel: "+1 charge",
      nextIncrementLabel: "+1 charge",
      projectedTotalLabel: "+2 charges"
    });
  });

  it("reports bounded shop ownership progress as a percentage", () => {
    const profile = {
      ...createDefaultMetaProfile(),
      purchasedShopUnlockIds: ["second-wave-skills"] as ShopUnlockId[]
    };

    expect(resolveShopOwnershipProgress(profile)).toEqual({
      ownedCount: 1,
      ownedPercentage: 33,
      totalCount: 3
    });
  });
});
