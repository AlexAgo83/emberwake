export const assetDomains = ["entities", "map", "overlays"] as const;

export type AssetDomain = (typeof assetDomains)[number];

export const assetPipeline = {
  directories: {
    entities: {
      placeholders: "src/assets/entities/placeholders",
      runtime: "src/assets/entities/runtime",
      source: "src/assets/entities/source"
    },
    map: {
      placeholders: "src/assets/map/placeholders",
      runtime: "src/assets/map/runtime",
      source: "src/assets/map/source"
    },
    overlays: {
      placeholders: "src/assets/overlays/placeholders",
      runtime: "src/assets/overlays/runtime",
      source: "src/assets/overlays/source"
    }
  },
  logicalSizing: {
    entity: {
      defaultFacing: "east",
      pivot: "center",
      spriteLogicalSizeWorldUnits: 128
    },
    map: {
      pivot: "center",
      tileLogicalSizeWorldUnits: 64
    },
    overlay: {
      pivot: "top-left"
    }
  },
  naming: {
    delimiter: ".",
    examples: {
      entityPlaceholder: "entity.player.primary.placeholder.svg",
      mapPlaceholder: "map.terrain.emberplain.placeholder.svg",
      overlayRuntime: "overlay.system.fullscreen-button.runtime.svg"
    }
  },
  packaging: {
    atlasPromotionThreshold: 12,
    initialMode: "unitary-placeholders",
    runtimeMode: "direct-runtime-files-or-generated-atlas",
    targetMode: "atlas-or-spritesheet"
  },
  runtime: {
    bundlingStrategy: "vite-static-assets-with-explicit-imports-or-manifest-lookup",
    cachingPolicy: "hashed-runtime-assets-immutable-shell-files-no-cache",
    loadingStrategy: "lazy-per-domain-with-placeholder-first-fallbacks",
    pwaPolicy: "precache-shell-runtime-assets-on-demand"
  }
} as const;

export const getAssetDomainDirectory = (
  domain: AssetDomain,
  stage: keyof (typeof assetPipeline.directories)[AssetDomain]
) => assetPipeline.directories[domain][stage];
