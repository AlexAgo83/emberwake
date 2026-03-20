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
  "debug-sentinel": {
    assetId: "entity.debug.sentinel.placeholder",
    label: "Debug sentinel"
  },
  "debug-watcher": {
    assetId: "entity.debug.watcher.placeholder",
    label: "Debug watcher"
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
