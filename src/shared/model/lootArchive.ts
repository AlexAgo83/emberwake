import type { EntityAssetId } from "@src/assets/assetCatalog";

export type LootArchiveId =
  | "cache-gift"
  | "cache-mission"
  | "crystal-high"
  | "crystal-low"
  | "crystal-mid"
  | "gold"
  | "healing-kit"
  | "hourglass"
  | "magnet";

export type LootArchiveCategory = "mission" | "rewards" | "utilities";

export type LootArchiveEntry = {
  assetId: EntityAssetId;
  category: LootArchiveCategory;
  description: string;
  id: LootArchiveId;
  label: string;
};

export const lootArchiveEntries = [
  {
    assetId: "entity.pickup.crystal.low.runtime",
    category: "rewards",
    description: "Thin field crystal carrying the lightest XP yield.",
    id: "crystal-low",
    label: "Scattered Crystal"
  },
  {
    assetId: "entity.pickup.crystal.mid.runtime",
    category: "rewards",
    description: "Dense crystal bloom with a steadier mid-run XP payout.",
    id: "crystal-mid",
    label: "Bound Crystal"
  },
  {
    assetId: "entity.pickup.crystal.high.runtime",
    category: "rewards",
    description: "Large hot crystal cluster preserving the highest bundled XP value.",
    id: "crystal-high",
    label: "Crown Crystal"
  },
  {
    assetId: "entity.pickup.gold.runtime",
    category: "rewards",
    description: "Recovered gold shard banked into permanent shell progression after the run.",
    id: "gold",
    label: "Gold Shard"
  },
  {
    assetId: "entity.pickup.cache.runtime",
    category: "mission",
    description: "Mission reliquary secured from a primary objective boss.",
    id: "cache-mission",
    label: "Mission Reliquary"
  },
  {
    assetId: "entity.pickup.cache.runtime",
    category: "rewards",
    description: "Field cache containing a wrapped gift-grade reward drop.",
    id: "cache-gift",
    label: "Gift Cache"
  },
  {
    assetId: "entity.pickup.healing-kit.runtime",
    category: "utilities",
    description: "Emergency treatment pickup restoring a chunk of shell integrity.",
    id: "healing-kit",
    label: "Healing Kit"
  },
  {
    assetId: "entity.pickup.hourglass.runtime",
    category: "utilities",
    description: "Temporal relay freezing hostile motion for a short window.",
    id: "hourglass",
    label: "Hourglass Relay"
  },
  {
    assetId: "entity.pickup.magnet.runtime",
    category: "utilities",
    description: "Pickup magnet pulse that drags nearby rewards into collection range.",
    id: "magnet",
    label: "Magnet Sigil"
  }
] as const satisfies readonly LootArchiveEntry[];

export const lootArchiveIds = lootArchiveEntries.map((entry) => entry.id);
