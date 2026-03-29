import type { EntityAssetId } from "@src/assets/assetCatalog";
import type {
  EntityFacingMode
} from "@src/assets/entityDirectionalRuntime";

export type EntitySpriteSeparationCategory = "hostile" | "pickup" | "player";

export const entityVisualDefinitions = {
  "ember-core": {
    assetId: "entity.player.primary.runtime",
    label: "Primary ember core",
    runtimePresentation: {
      facingMode: "lateral-mirror-left",
      spriteSeparationCategory: "player"
    }
  },
  "debug-anchor": {
    assetId: "entity.hostile.anchor.runtime",
    label: "Debug anchor",
    runtimePresentation: {
      facingMode: "lateral-mirror-left",
      spriteSeparationCategory: "hostile"
    }
  },
  "debug-drifter": {
    assetId: "entity.hostile.drifter.runtime",
    label: "Debug drifter",
    runtimePresentation: {
      facingMode: "lateral-mirror-left",
      spriteSeparationCategory: "hostile"
    }
  },
  "debug-needle": {
    assetId: "entity.hostile.needle.runtime",
    label: "Debug needle",
    runtimePresentation: {
      facingMode: "single-rotating",
      spriteSeparationCategory: "hostile"
    }
  },
  "debug-rammer": {
    assetId: "entity.hostile.rammer.runtime",
    label: "Debug rammer",
    runtimePresentation: {
      facingMode: "lateral-mirror-left",
      spriteSeparationCategory: "hostile"
    }
  },
  "debug-sentinel": {
    assetId: "entity.hostile.sentinel.runtime",
    label: "Debug sentinel",
    runtimePresentation: {
      facingMode: "lateral-mirror-left",
      spriteSeparationCategory: "hostile"
    }
  },
  "debug-watcher": {
    assetId: "entity.hostile.watcher.runtime",
    label: "Debug watcher",
    runtimePresentation: {
      facingMode: "lateral-mirror-left",
      spriteSeparationCategory: "hostile"
    }
  },
  "pickup-gold": {
    assetId: "entity.pickup.gold.runtime",
    label: "Gold pickup",
    runtimePresentation: {
      facingMode: "static",
      spriteSeparationCategory: "pickup"
    }
  },
  "pickup-crystal": {
    assetId: "entity.pickup.crystal.runtime",
    label: "Crystal pickup",
    runtimePresentation: {
      facingMode: "static",
      spriteSeparationCategory: "pickup"
    }
  },
  "pickup-cache": {
    assetId: "entity.pickup.cache.runtime",
    label: "Cache pickup",
    runtimePresentation: {
      facingMode: "static",
      spriteSeparationCategory: "pickup"
    }
  },
  "pickup-healing-kit": {
    assetId: "entity.pickup.healing-kit.runtime",
    label: "Healing kit pickup",
    runtimePresentation: {
      facingMode: "static",
      spriteSeparationCategory: "pickup"
    }
  },
  "pickup-magnet": {
    assetId: "entity.pickup.magnet.runtime",
    label: "Magnet pickup",
    runtimePresentation: {
      facingMode: "static",
      spriteSeparationCategory: "pickup"
    }
  },
  "pickup-hourglass": {
    assetId: "entity.pickup.hourglass.runtime",
    label: "Hourglass pickup",
    runtimePresentation: {
      facingMode: "static",
      spriteSeparationCategory: "pickup"
    }
  }
} as const satisfies Record<
  string,
  {
    assetId: EntityAssetId;
    label: string;
    runtimePresentation: {
      facingMode: EntityFacingMode;
      spriteSeparationCategory: EntitySpriteSeparationCategory;
    };
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
