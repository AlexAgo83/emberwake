export const dataAuthoringContract = {
  authoringBaseline: "typed-typescript-modules",
  boundaries: {
    debugScenarios: "games/emberwake/src/content/scenarios",
    executableLogic: "hooks-model-render-files",
    runtimeConfiguration: "src/shared/config",
    staticGameData: [
      "games/emberwake/src/content/world",
      "games/emberwake/src/content/entities",
      "src/assets"
    ]
  },
  crossDomainReferences: {
    assets: "opaque-string-ids-owned-by-asset-catalog",
    entities: "archetype-and-visual-ids-owned-by-entity-data",
    world: "terrain-kind-ids-owned-by-world-data"
  },
  validation: {
    authoringModel: "type-level-and-cross-catalog-module-assertions",
    futureExtension: "schema-validation-can-wrap-content-catalog-validation-without-moving-ownership",
    runtimeConfig: "import-meta-env-and-explicit-config-modules-only"
  }
} as const;
