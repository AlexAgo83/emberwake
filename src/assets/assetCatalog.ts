export const assetCatalog = {
  entities: {
    "entity.debug.anchor.placeholder": {
      domain: "entities",
      label: "Debug anchor placeholder",
      stage: "placeholders"
    },
    "entity.debug.drifter.placeholder": {
      domain: "entities",
      label: "Debug drifter placeholder",
      stage: "placeholders"
    },
    "entity.debug.sentinel.placeholder": {
      domain: "entities",
      label: "Debug sentinel placeholder",
      stage: "placeholders"
    },
    "entity.debug.watcher.placeholder": {
      domain: "entities",
      label: "Debug watcher placeholder",
      stage: "placeholders"
    },
    "entity.player.primary.placeholder": {
      domain: "entities",
      label: "Primary player placeholder",
      stage: "placeholders"
    }
  },
  map: {
    "map.terrain.ashfield.placeholder": {
      domain: "map",
      label: "Ashfield terrain placeholder",
      stage: "placeholders"
    },
    "map.terrain.emberplain.placeholder": {
      domain: "map",
      label: "Emberplain terrain placeholder",
      stage: "placeholders"
    },
    "map.terrain.glowfen.placeholder": {
      domain: "map",
      label: "Glowfen terrain placeholder",
      stage: "placeholders"
    },
    "map.terrain.obsidian.placeholder": {
      domain: "map",
      label: "Obsidian terrain placeholder",
      stage: "placeholders"
    }
  },
  overlays: {
    "overlay.system.fullscreen-button.runtime": {
      domain: "overlays",
      label: "Fullscreen system button",
      stage: "runtime"
    },
    "overlay.system.virtual-stick.runtime": {
      domain: "overlays",
      label: "Virtual stick overlay",
      stage: "runtime"
    }
  }
} as const;

export type EntityAssetId = keyof typeof assetCatalog.entities;
export type MapAssetId = keyof typeof assetCatalog.map;
export type OverlayAssetId = keyof typeof assetCatalog.overlays;
export type AssetId = EntityAssetId | MapAssetId | OverlayAssetId;

export const isAssetId = (assetId: string): assetId is AssetId =>
  assetId in assetCatalog.entities || assetId in assetCatalog.map || assetId in assetCatalog.overlays;
