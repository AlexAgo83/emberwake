import { describe, expect, it } from "vitest";

import {
  createDefaultMetaProfile,
  purchaseTalentRank,
  resolveTalentNextCost
} from "./metaProgression";

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
});
