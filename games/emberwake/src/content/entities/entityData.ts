import type { EntityAssetId } from "@src/assets/assetCatalog";

export const entityVisualDefinitions = {
  "ember-core": {
    assetId: "entity.player.primary.runtime",
    label: "Primary ember core"
  },
  "debug-anchor": {
    assetId: "entity.hostile.anchor.runtime",
    label: "Debug anchor"
  },
  "debug-drifter": {
    assetId: "entity.hostile.drifter.runtime",
    label: "Debug drifter"
  },
  "debug-needle": {
    assetId: "entity.hostile.needle.runtime",
    label: "Debug needle"
  },
  "debug-rammer": {
    assetId: "entity.hostile.rammer.runtime",
    label: "Debug rammer"
  },
  "debug-sentinel": {
    assetId: "entity.hostile.sentinel.runtime",
    label: "Debug sentinel"
  },
  "debug-watcher": {
    assetId: "entity.hostile.watcher.runtime",
    label: "Debug watcher"
  },
  "pickup-gold": {
    assetId: "entity.pickup.gold.runtime",
    label: "Gold pickup"
  },
  "pickup-crystal": {
    assetId: "entity.pickup.crystal.runtime",
    label: "Crystal pickup"
  },
  "pickup-cache": {
    assetId: "entity.pickup.cache.runtime",
    label: "Cache pickup"
  },
  "pickup-healing-kit": {
    assetId: "entity.pickup.healing-kit.runtime",
    label: "Healing kit pickup"
  },
  "pickup-magnet": {
    assetId: "entity.pickup.magnet.runtime",
    label: "Magnet pickup"
  },
  "pickup-hourglass": {
    assetId: "entity.pickup.hourglass.runtime",
    label: "Hourglass pickup"
  }
} as const satisfies Record<
  string,
  {
    assetId: EntityAssetId;
    label: string;
  }
>;

export type EntityVisualKind = keyof typeof entityVisualDefinitions;

export const entityArchetypeDefinitions = {
  "generic-mover": {
    defaultRenderLayer: 100,
    defaultState: "idle",
    defaultVisualKind: "ember-core",
    footprintRadius: 40
  }
} as const;

export type EntityArchetypeId = keyof typeof entityArchetypeDefinitions;
