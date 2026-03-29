import type { LootArchiveId } from "./lootArchive";

export type CrystalPickupTier = "high" | "low" | "mid";

export const resolveCrystalPickupTier = (stackCount: number): CrystalPickupTier => {
  const resolvedStackCount = Math.max(1, Math.floor(stackCount));

  if (resolvedStackCount > 50) {
    return "high";
  }

  if (resolvedStackCount > 10) {
    return "mid";
  }

  return "low";
};

export const resolveCrystalPickupTint = (stackCount: number) => {
  const crystalPickupTier = resolveCrystalPickupTier(stackCount);

  if (crystalPickupTier === "high") {
    return "#ff5a5a";
  }

  if (crystalPickupTier === "mid") {
    return "#7dff9b";
  }

  return "#73f2ff";
};

export const resolveCrystalPickupVisualKind = (stackCount: number) => {
  const crystalPickupTier = resolveCrystalPickupTier(stackCount);

  if (crystalPickupTier === "high") {
    return "pickup-crystal-high" as const;
  }

  if (crystalPickupTier === "mid") {
    return "pickup-crystal-mid" as const;
  }

  return "pickup-crystal-low" as const;
};

export const resolveCrystalLootArchiveId = (stackCount: number): LootArchiveId => {
  const crystalPickupTier = resolveCrystalPickupTier(stackCount);

  if (crystalPickupTier === "high") {
    return "crystal-high";
  }

  if (crystalPickupTier === "mid") {
    return "crystal-mid";
  }

  return "crystal-low";
};
