import type { EntityAssetId } from "@src/assets/assetCatalog";

export const entityVisualDefinitions = {
  "ember-core": {
    assetId: "entity.player.primary.placeholder",
    label: "Primary ember core"
  },
  "debug-anchor": {
    assetId: "entity.debug.anchor.placeholder",
    label: "Debug anchor"
  },
  "debug-drifter": {
    assetId: "entity.debug.drifter.placeholder",
    label: "Debug drifter"
  },
  "debug-needle": {
    assetId: "entity.debug.drifter.placeholder",
    label: "Debug needle"
  },
  "debug-rammer": {
    assetId: "entity.debug.sentinel.placeholder",
    label: "Debug rammer"
  },
  "debug-sentinel": {
    assetId: "entity.debug.sentinel.placeholder",
    label: "Debug sentinel"
  },
  "debug-watcher": {
    assetId: "entity.debug.watcher.placeholder",
    label: "Debug watcher"
  },
  "pickup-gold": {
    assetId: "entity.debug.watcher.placeholder",
    label: "Gold pickup"
  },
  "pickup-crystal": {
    assetId: "entity.debug.drifter.placeholder",
    label: "Crystal pickup"
  },
  "pickup-cache": {
    assetId: "entity.debug.anchor.placeholder",
    label: "Cache pickup"
  },
  "pickup-healing-kit": {
    assetId: "entity.debug.anchor.placeholder",
    label: "Healing kit pickup"
  },
  "pickup-magnet": {
    assetId: "entity.debug.watcher.placeholder",
    label: "Magnet pickup"
  },
  "pickup-hourglass": {
    assetId: "entity.debug.anchor.placeholder",
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
