type AssetCatalogEntry = {
  domain: "entities" | "map" | "overlays" | "shell";
  fallbackAssetId?: string;
  label: string;
  stage: "placeholders" | "runtime";
};

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
    },
    "entity.hostile.anchor.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.debug.anchor.placeholder",
      label: "Anchor hostile runtime",
      stage: "runtime"
    },
    "entity.hostile.drifter.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.debug.drifter.placeholder",
      label: "Drifter hostile runtime",
      stage: "runtime"
    },
    "entity.hostile.needle.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.debug.drifter.placeholder",
      label: "Needle hostile runtime",
      stage: "runtime"
    },
    "entity.hostile.rammer.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.debug.sentinel.placeholder",
      label: "Rammer hostile runtime",
      stage: "runtime"
    },
    "entity.hostile.sentinel.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.debug.sentinel.placeholder",
      label: "Sentinel hostile runtime",
      stage: "runtime"
    },
    "entity.hostile.watcher.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.debug.watcher.placeholder",
      label: "Watcher hostile runtime",
      stage: "runtime"
    },
    "entity.pickup.cache.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.debug.anchor.placeholder",
      label: "Cache pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.crystal.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.debug.drifter.placeholder",
      label: "Crystal pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.gold.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.debug.watcher.placeholder",
      label: "Gold pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.healing-kit.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.debug.anchor.placeholder",
      label: "Healing kit pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.hourglass.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.debug.anchor.placeholder",
      label: "Hourglass pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.magnet.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.debug.watcher.placeholder",
      label: "Magnet pickup runtime",
      stage: "runtime"
    },
    "entity.player.primary.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.player.primary.placeholder",
      label: "Primary player runtime",
      stage: "runtime"
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
    },
    "map.terrain.ashfield.runtime": {
      domain: "map",
      fallbackAssetId: "map.terrain.ashfield.placeholder",
      label: "Ashfield terrain runtime",
      stage: "runtime"
    },
    "map.terrain.emberplain.runtime": {
      domain: "map",
      fallbackAssetId: "map.terrain.emberplain.placeholder",
      label: "Emberplain terrain runtime",
      stage: "runtime"
    },
    "map.terrain.glowfen.runtime": {
      domain: "map",
      fallbackAssetId: "map.terrain.glowfen.placeholder",
      label: "Glowfen terrain runtime",
      stage: "runtime"
    },
    "map.terrain.obsidian.runtime": {
      domain: "map",
      fallbackAssetId: "map.terrain.obsidian.placeholder",
      label: "Obsidian terrain runtime",
      stage: "runtime"
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
  },
  shell: {}
} as const satisfies Record<string, Record<string, AssetCatalogEntry>>;

export type EntityAssetId = keyof typeof assetCatalog.entities;
export type MapAssetId = keyof typeof assetCatalog.map;
export type OverlayAssetId = keyof typeof assetCatalog.overlays;
export type ShellAssetId = keyof typeof assetCatalog.shell;
export type AssetId = EntityAssetId | MapAssetId | OverlayAssetId | ShellAssetId;

export const getAssetCatalogEntry = (assetId: AssetId) => {
  if (assetId in assetCatalog.entities) {
    return assetCatalog.entities[assetId as EntityAssetId];
  }

  if (assetId in assetCatalog.map) {
    return assetCatalog.map[assetId as MapAssetId];
  }

  if (assetId in assetCatalog.overlays) {
    return assetCatalog.overlays[assetId as OverlayAssetId];
  }

  if (assetId in assetCatalog.shell) {
    return assetCatalog.shell[assetId as ShellAssetId];
  }

  throw new Error(`Unknown asset id: ${assetId}`);
};

export const isAssetId = (assetId: string): assetId is AssetId =>
  assetId in assetCatalog.entities ||
  assetId in assetCatalog.map ||
  assetId in assetCatalog.overlays ||
  assetId in assetCatalog.shell;
