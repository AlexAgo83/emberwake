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
    "entity.boss.abyss-watchglass.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.hostile.watcher.runtime",
      label: "Abyss Watchglass boss runtime",
      stage: "runtime"
    },
    "entity.boss.ruin-ram.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.hostile.rammer.runtime",
      label: "Ruin Ram boss runtime",
      stage: "runtime"
    },
    "entity.boss.sentinel-tyrant.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.hostile.sentinel.runtime",
      label: "Sentinel Tyrant boss runtime",
      stage: "runtime"
    },
    "entity.boss.watchglass-prime.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.hostile.watcher.runtime",
      label: "Watchglass Prime boss runtime",
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
    "entity.pickup.mission.ashwake-seal.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.cache.runtime",
      label: "Ashwake Seal mission pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.mission.glass-cipher.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.cache.runtime",
      label: "Glass Cipher mission pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.mission.breach-writ.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.cache.runtime",
      label: "Breach Writ mission pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.mission.kiln-charter.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.cache.runtime",
      label: "Kiln Charter mission pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.mission.ward-sigil.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.cache.runtime",
      label: "Ward Sigil mission pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.mission.lantern-prism.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.cache.runtime",
      label: "Lantern Prism mission pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.mission.mist-lens.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.cache.runtime",
      label: "Mist Lens mission pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.mission.bloom-valve.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.cache.runtime",
      label: "Bloom Valve mission pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.mission.reed-crest.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.cache.runtime",
      label: "Reed Crest mission pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.mission.keystone-plate.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.cache.runtime",
      label: "Keystone Plate mission pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.mission.mirror-core.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.cache.runtime",
      label: "Mirror Core mission pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.mission.sluice-key.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.cache.runtime",
      label: "Sluice Key mission pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.mission.lantern-crown.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.cache.runtime",
      label: "Lantern Crown mission pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.mission.gate-mandate.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.cache.runtime",
      label: "Gate Mandate mission pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.mission.cinder-writ.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.cache.runtime",
      label: "Cinder Writ mission pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.crystal.high.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.crystal.runtime",
      label: "High crystal pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.crystal.low.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.crystal.runtime",
      label: "Low crystal pickup runtime",
      stage: "runtime"
    },
    "entity.pickup.crystal.mid.runtime": {
      domain: "entities",
      fallbackAssetId: "entity.pickup.crystal.runtime",
      label: "Mid crystal pickup runtime",
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
