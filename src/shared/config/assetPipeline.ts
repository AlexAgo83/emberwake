export const assetDomains = ["entities", "map", "overlays", "shell"] as const;

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
    },
    shell: {
      placeholders: "src/assets/shell/placeholders",
      runtime: "src/assets/shell/runtime",
      source: "src/assets/shell/source"
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
    },
    shell: {
      pivot: "top-left"
    }
  },
  naming: {
    delimiter: ".",
    canonicalRule: "filename-stem-must-match-asset-id",
    assetIdShape: "domain.family.name.lifecycle",
    metadataSidecar: ".meta.json",
    stageSpecificFilePattern: "<directory>/<assetId>.<ext>",
    examples: {
      entityPlaceholder: "entity.player.primary.placeholder.svg",
      entityRuntime: "entity.player.primary.runtime.png",
      mapPlaceholder: "map.terrain.emberplain.placeholder.svg",
      overlayRuntime: "overlay.system.fullscreen-button.runtime.svg",
      shellRuntime: "shell.scene.codex.header.runtime.webp",
      metadataSidecar: "entity.player.primary.runtime.meta.json"
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
    supportedExtensionsByPriority: {
      entities: ["png", "webp", "svg"],
      map: ["webp", "png", "svg"],
      overlays: ["svg", "png", "webp"],
      shell: ["svg", "webp", "png"]
    },
    fallbackChain: [
      "exact-runtime-file-for-asset-id",
      "exact-placeholder-file-for-asset-id",
      "procedural-or-inline-code-fallback"
    ],
    pwaPolicy: "precache-shell-runtime-assets-on-demand"
  }
} as const;

export const getAssetDomainDirectory = (
  domain: AssetDomain,
  stage: keyof (typeof assetPipeline.directories)[AssetDomain]
) => assetPipeline.directories[domain][stage];
