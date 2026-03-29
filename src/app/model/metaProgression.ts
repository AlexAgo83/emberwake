import type { ActiveWeaponId, BuildMetaProgression, FusionId, PassiveItemId } from "@game";

export type MetaTalentId =
  | "gold-gain"
  | "max-health"
  | "move-speed"
  | "pickup-radius"
  | "shield"
  | "xp-gain";

export type ShopUnlockId =
  | "second-wave-fusions"
  | "second-wave-skills"
  | "utility-drops";

export type MetaArchiveProgress = {
  creatureDefeatCounts: Partial<Record<string, number>>;
  discoveredActiveWeaponIds: ActiveWeaponId[];
  discoveredCreatureIds: string[];
  discoveredFusionIds: FusionId[];
  discoveredPassiveItemIds: PassiveItemId[];
};

export type MetaProfile = {
  archive: MetaArchiveProgress;
  goldBalance: number;
  purchasedShopUnlockIds: ShopUnlockId[];
  talentRanks: Record<MetaTalentId, number>;
};

export type ShopUnlockDefinition = {
  cost: number;
  description: string;
  id: ShopUnlockId;
  label: string;
};

export type TalentDefinition = {
  costCurve: number[];
  description: string;
  id: MetaTalentId;
  label: string;
};

export type ShopOwnershipProgress = {
  ownedCount: number;
  ownedPercentage: number;
  totalCount: number;
};

export type TalentEffectPreview = {
  currentEffectLabel: string;
  nextIncrementLabel: string | null;
  projectedTotalLabel: string | null;
};

const firstWaveActiveWeaponIds: ActiveWeaponId[] = [
  "ash-lash",
  "guided-senbon",
  "shade-kunai",
  "cinder-arc",
  "orbit-sutra",
  "null-canister"
];

const secondWaveActiveWeaponIds: ActiveWeaponId[] = [
  "orbiting-blades",
  "chain-lightning",
  "burning-trail",
  "boomerang-arc",
  "halo-burst",
  "frost-nova",
  "vacuum-pulse"
];

const firstWavePassiveItemIds: PassiveItemId[] = [
  "overclock-seal",
  "hardlight-sheath",
  "wideband-coil",
  "echo-thread",
  "duplex-relay",
  "vacuum-tabi"
];

const secondWavePassiveItemIds: PassiveItemId[] = [
  "thorn-mail",
  "execution-sigil",
  "greed-engine",
  "boss-hunter",
  "emergency-aegis"
];

const baselineFusionIds: FusionId[] = [
  "redline-ribbon",
  "choir-of-pins",
  "blackfile-volley",
  "temple-circuit"
];

const secondWaveFusionIds: FusionId[] = ["afterimage-pyre", "event-horizon"];

export const shopUnlockCatalog: ShopUnlockDefinition[] = [
  {
    cost: 42,
    description: "Adds the second-wave active and passive roster to level-up offers.",
    id: "second-wave-skills",
    label: "Second Wave Skills"
  },
  {
    cost: 54,
    description: "Unlocks Afterimage Pyre and Event Horizon in the fusion payoff pool.",
    id: "second-wave-fusions",
    label: "Fusion Completion"
  },
  {
    cost: 28,
    description: "Opens magnet-grade utility drops now, with hourglass-compatible posture later.",
    id: "utility-drops",
    label: "Utility Drops"
  }
];

export const talentCatalog: TalentDefinition[] = [
  {
    costCurve: [14, 28, 46, 72, 108],
    description: "Raise starting max health for every run.",
    id: "max-health",
    label: "Max Health"
  },
  {
    costCurve: [12, 24, 38, 60, 90],
    description: "Widen pickup reach before skill modifiers stack on top.",
    id: "pickup-radius",
    label: "Pickup Radius"
  },
  {
    costCurve: [12, 24, 40, 64, 96],
    description: "Improve gold gain before shop inflation catches up.",
    id: "gold-gain",
    label: "Gold Gain"
  },
  {
    costCurve: [14, 28, 44, 70, 104],
    description: "Improve crystal conversion into run XP.",
    id: "xp-gain",
    label: "XP Gain"
  },
  {
    costCurve: [14, 30, 48, 76, 114],
    description: "Increase baseline move speed for evasive builds.",
    id: "move-speed",
    label: "Move Speed"
  },
  {
    costCurve: [140, 240],
    description: "Adds extra emergency shield charges to late runs.",
    id: "shield",
    label: "Shield"
  }
];

export const createDefaultMetaProfile = (): MetaProfile => ({
  archive: {
    creatureDefeatCounts: {},
    discoveredActiveWeaponIds: ["ash-lash"],
    discoveredCreatureIds: [],
    discoveredFusionIds: [],
    discoveredPassiveItemIds: []
  },
  goldBalance: 0,
  purchasedShopUnlockIds: [],
  talentRanks: {
    "gold-gain": 0,
    "max-health": 0,
    "move-speed": 0,
    "pickup-radius": 0,
    shield: 0,
    "xp-gain": 0
  }
});

export const getTalentDefinition = (talentId: MetaTalentId) =>
  talentCatalog.find((talent) => talent.id === talentId)!;

export const getShopUnlockDefinition = (unlockId: ShopUnlockId) =>
  shopUnlockCatalog.find((unlock) => unlock.id === unlockId)!;

const withProjectedTalentRank = (profile: MetaProfile, talentId: MetaTalentId): MetaProfile => {
  const currentRank = profile.talentRanks[talentId];
  const maxRank = getTalentDefinition(talentId).costCurve.length;

  return {
    ...profile,
    talentRanks: {
      ...profile.talentRanks,
      [talentId]: Math.min(currentRank + 1, maxRank)
    }
  };
};

const formatPercentBonus = (bonusFraction: number) => `${bonusFraction >= 0 ? "+" : ""}${Math.round(bonusFraction * 100)}%`;

const formatUnitBonus = (value: number, singularUnit: string, pluralUnit: string) =>
  `${value >= 0 ? "+" : ""}${value} ${Math.abs(value) === 1 ? singularUnit : pluralUnit}`;

export const resolveTalentNextCost = (profile: MetaProfile, talentId: MetaTalentId) => {
  const talentDefinition = getTalentDefinition(talentId);
  const currentRank = profile.talentRanks[talentId];

  return talentDefinition.costCurve[currentRank] ?? null;
};

export const resolveShopOwnershipProgress = (profile: MetaProfile): ShopOwnershipProgress => {
  const ownedCount = profile.purchasedShopUnlockIds.length;
  const totalCount = shopUnlockCatalog.length;

  return {
    ownedCount,
    ownedPercentage: totalCount === 0 ? 0 : Math.round((ownedCount / totalCount) * 100),
    totalCount
  };
};

export const resolveTalentEffectPreview = (
  profile: MetaProfile,
  talentId: MetaTalentId
): TalentEffectPreview => {
  const currentModifiers = deriveBuildMetaProgression(profile).talentModifiers;
  const nextCost = resolveTalentNextCost(profile, talentId);

  if (talentId === "gold-gain") {
    const currentBonus = currentModifiers.goldGainMultiplier - 1;

    return {
      currentEffectLabel: formatPercentBonus(currentBonus),
      nextIncrementLabel: nextCost === null ? null : formatPercentBonus(0.12),
      projectedTotalLabel:
        nextCost === null
          ? null
          : formatPercentBonus(deriveBuildMetaProgression(withProjectedTalentRank(profile, talentId)).talentModifiers.goldGainMultiplier - 1)
    };
  }

  if (talentId === "xp-gain") {
    const currentBonus = currentModifiers.xpGainMultiplier - 1;

    return {
      currentEffectLabel: formatPercentBonus(currentBonus),
      nextIncrementLabel: nextCost === null ? null : formatPercentBonus(0.1),
      projectedTotalLabel:
        nextCost === null
          ? null
          : formatPercentBonus(deriveBuildMetaProgression(withProjectedTalentRank(profile, talentId)).talentModifiers.xpGainMultiplier - 1)
    };
  }

  if (talentId === "move-speed") {
    const currentBonus = currentModifiers.moveSpeedMultiplier - 1;

    return {
      currentEffectLabel: formatPercentBonus(currentBonus),
      nextIncrementLabel: nextCost === null ? null : formatPercentBonus(0.06),
      projectedTotalLabel:
        nextCost === null
          ? null
          : formatPercentBonus(deriveBuildMetaProgression(withProjectedTalentRank(profile, talentId)).talentModifiers.moveSpeedMultiplier - 1)
    };
  }

  if (talentId === "pickup-radius") {
    const currentBonus = currentModifiers.pickupRadiusMultiplier - 1;

    return {
      currentEffectLabel: formatPercentBonus(currentBonus),
      nextIncrementLabel: nextCost === null ? null : formatPercentBonus(0.08),
      projectedTotalLabel:
        nextCost === null
          ? null
          : formatPercentBonus(deriveBuildMetaProgression(withProjectedTalentRank(profile, talentId)).talentModifiers.pickupRadiusMultiplier - 1)
    };
  }

  if (talentId === "max-health") {
    return {
      currentEffectLabel: formatUnitBonus(currentModifiers.maxHealthBonus, "HP", "HP"),
      nextIncrementLabel: nextCost === null ? null : formatUnitBonus(12, "HP", "HP"),
      projectedTotalLabel:
        nextCost === null
          ? null
          : formatUnitBonus(
              deriveBuildMetaProgression(withProjectedTalentRank(profile, talentId)).talentModifiers.maxHealthBonus,
              "HP",
              "HP"
            )
    };
  }

  return {
    currentEffectLabel: formatUnitBonus(currentModifiers.emergencyShieldCharges, "charge", "charges"),
    nextIncrementLabel: nextCost === null ? null : formatUnitBonus(1, "charge", "charges"),
    projectedTotalLabel:
      nextCost === null
        ? null
        : formatUnitBonus(
            deriveBuildMetaProgression(withProjectedTalentRank(profile, talentId)).talentModifiers.emergencyShieldCharges,
            "charge",
            "charges"
          )
  };
};

export const canPurchaseTalentRank = (profile: MetaProfile, talentId: MetaTalentId) => {
  const nextCost = resolveTalentNextCost(profile, talentId);

  return nextCost !== null && profile.goldBalance >= nextCost;
};

export const canPurchaseShopUnlock = (profile: MetaProfile, unlockId: ShopUnlockId) =>
  !profile.purchasedShopUnlockIds.includes(unlockId) &&
  profile.goldBalance >= getShopUnlockDefinition(unlockId).cost;

export const purchaseTalentRank = (profile: MetaProfile, talentId: MetaTalentId): MetaProfile => {
  const nextCost = resolveTalentNextCost(profile, talentId);

  if (nextCost === null || profile.goldBalance < nextCost) {
    return profile;
  }

  return {
    ...profile,
    goldBalance: profile.goldBalance - nextCost,
    talentRanks: {
      ...profile.talentRanks,
      [talentId]: profile.talentRanks[talentId] + 1
    }
  };
};

export const purchaseShopUnlock = (profile: MetaProfile, unlockId: ShopUnlockId): MetaProfile => {
  const unlockDefinition = getShopUnlockDefinition(unlockId);

  if (
    profile.purchasedShopUnlockIds.includes(unlockId) ||
    profile.goldBalance < unlockDefinition.cost
  ) {
    return profile;
  }

  return {
    ...profile,
    goldBalance: profile.goldBalance - unlockDefinition.cost,
    purchasedShopUnlockIds: [...profile.purchasedShopUnlockIds, unlockId]
  };
};

export const bankGoldIntoMetaProfile = (profile: MetaProfile, goldAmount: number): MetaProfile => ({
  ...profile,
  goldBalance: profile.goldBalance + Math.max(0, Math.round(goldAmount))
});

export const mergeArchiveProgress = (
  profile: MetaProfile,
  archive: Partial<MetaArchiveProgress>
): MetaProfile => {
  const nextCreatureDefeatCounts = {
    ...profile.archive.creatureDefeatCounts
  };

  for (const [creatureId, defeatCount] of Object.entries(archive.creatureDefeatCounts ?? {})) {
    nextCreatureDefeatCounts[creatureId] =
      Math.max(0, nextCreatureDefeatCounts[creatureId] ?? 0) + Math.max(0, defeatCount ?? 0);
  }

  return {
    ...profile,
    archive: {
      creatureDefeatCounts: nextCreatureDefeatCounts,
      discoveredActiveWeaponIds: Array.from(
        new Set([
          ...profile.archive.discoveredActiveWeaponIds,
          ...(archive.discoveredActiveWeaponIds ?? [])
        ])
      ) as ActiveWeaponId[],
      discoveredCreatureIds: Array.from(
        new Set([...profile.archive.discoveredCreatureIds, ...(archive.discoveredCreatureIds ?? [])])
      ),
      discoveredFusionIds: Array.from(
        new Set([...profile.archive.discoveredFusionIds, ...(archive.discoveredFusionIds ?? [])])
      ) as FusionId[],
      discoveredPassiveItemIds: Array.from(
        new Set([
          ...profile.archive.discoveredPassiveItemIds,
          ...(archive.discoveredPassiveItemIds ?? [])
        ])
      ) as PassiveItemId[]
    }
  };
};

export const overlayArchiveProgress = (
  profile: MetaProfile,
  archive: Partial<MetaArchiveProgress> | null | undefined
): MetaArchiveProgress => {
  const nextCreatureDefeatCounts = {
    ...profile.archive.creatureDefeatCounts
  };

  for (const [creatureId, defeatCount] of Object.entries(archive?.creatureDefeatCounts ?? {})) {
    nextCreatureDefeatCounts[creatureId] =
      Math.max(0, nextCreatureDefeatCounts[creatureId] ?? 0) + Math.max(0, defeatCount ?? 0);
  }

  return {
    creatureDefeatCounts: nextCreatureDefeatCounts,
    discoveredActiveWeaponIds: Array.from(
      new Set([
        ...profile.archive.discoveredActiveWeaponIds,
        ...(archive?.discoveredActiveWeaponIds ?? [])
      ])
    ) as ActiveWeaponId[],
    discoveredCreatureIds: Array.from(
      new Set([
        ...profile.archive.discoveredCreatureIds,
        ...(archive?.discoveredCreatureIds ?? [])
      ])
    ),
    discoveredFusionIds: Array.from(
      new Set([...profile.archive.discoveredFusionIds, ...(archive?.discoveredFusionIds ?? [])])
    ) as FusionId[],
    discoveredPassiveItemIds: Array.from(
      new Set([
        ...profile.archive.discoveredPassiveItemIds,
        ...(archive?.discoveredPassiveItemIds ?? [])
      ])
    ) as PassiveItemId[]
  };
};

export const deriveBuildMetaProgression = (profile: MetaProfile): BuildMetaProgression => {
  const hasSecondWaveSkills = profile.purchasedShopUnlockIds.includes("second-wave-skills");
  const hasSecondWaveFusions = profile.purchasedShopUnlockIds.includes("second-wave-fusions");
  const hasUtilityDrops = profile.purchasedShopUnlockIds.includes("utility-drops");

  return {
    availableActiveWeaponIds: hasSecondWaveSkills
      ? [...firstWaveActiveWeaponIds, ...secondWaveActiveWeaponIds]
      : [...firstWaveActiveWeaponIds],
    availableFusionIds: hasSecondWaveFusions
      ? [...baselineFusionIds, ...secondWaveFusionIds]
      : [...baselineFusionIds],
    availablePassiveItemIds: hasSecondWaveSkills
      ? [...firstWavePassiveItemIds, ...secondWavePassiveItemIds]
      : [...firstWavePassiveItemIds],
    talentModifiers: {
      emergencyShieldCharges: profile.talentRanks.shield,
      goldGainMultiplier: 1 + profile.talentRanks["gold-gain"] * 0.12,
      maxHealthBonus: profile.talentRanks["max-health"] * 12,
      moveSpeedMultiplier: 1 + profile.talentRanks["move-speed"] * 0.06,
      pickupRadiusMultiplier: 1 + profile.talentRanks["pickup-radius"] * 0.08,
      xpGainMultiplier: 1 + profile.talentRanks["xp-gain"] * 0.1
    },
    unlockedPickupKinds: hasUtilityDrops
      ? ["gold", "healing-kit", "magnet", "hourglass"]
      : ["gold", "healing-kit"]
  };
};
