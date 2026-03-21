import type { MapAssetId } from "@src/assets/assetCatalog";

export const terrainDefinitions = {
  ashfield: {
    assetId: "map.terrain.ashfield.placeholder",
    debugPalette: {
      baseColor: 0x1b1f25,
      overlayColor: 0xffc36e,
      variants: [0x222932, 0x1a2128, 0x262e38]
    },
    label: "Ashfield"
  },
  emberplain: {
    assetId: "map.terrain.emberplain.placeholder",
    debugPalette: {
      baseColor: 0x301d27,
      overlayColor: 0xff8b63,
      variants: [0x41242f, 0x3a212b, 0x4b2b36]
    },
    label: "Emberplain"
  },
  glowfen: {
    assetId: "map.terrain.glowfen.placeholder",
    debugPalette: {
      baseColor: 0x16242f,
      overlayColor: 0x4ce2ff,
      variants: [0x1f3342, 0x18303d, 0x214255]
    },
    label: "Glowfen"
  },
  obsidian: {
    assetId: "map.terrain.obsidian.placeholder",
    debugPalette: {
      baseColor: 0x21192d,
      overlayColor: 0xd88cff,
      variants: [0x2a2038, 0x241d32, 0x312746]
    },
    label: "Obsidian"
  }
} as const satisfies Record<
  string,
  {
    assetId: MapAssetId;
    debugPalette: {
      baseColor: number;
      overlayColor: number;
      variants: readonly [number, number, number];
    };
    label: string;
  }
>;

export type TerrainKind = keyof typeof terrainDefinitions;

export const terrainKinds = Object.keys(terrainDefinitions) as TerrainKind[];

export const obstacleDefinitions = {
  none: {
    blocksMovement: false,
    debugColor: null,
    label: "Open"
  },
  solid: {
    blocksMovement: true,
    debugColor: 0x0c0f16,
    label: "Solid"
  }
} as const;

export type ObstacleKind = keyof typeof obstacleDefinitions;

export const movementSurfaceModifierDefinitions = {
  normal: {
    accentColor: null,
    controlResponsiveness: 1,
    label: "Normal",
    speedMultiplier: 1,
    velocityRetainFactor: 0
  },
  slippery: {
    accentColor: 0x8fd6ff,
    controlResponsiveness: 0.22,
    label: "Slippery",
    speedMultiplier: 1,
    velocityRetainFactor: 0.9
  },
  slow: {
    accentColor: 0xffc36e,
    controlResponsiveness: 1,
    label: "Slow",
    speedMultiplier: 0.58,
    velocityRetainFactor: 0
  }
} as const;

export type MovementSurfaceModifierKind = keyof typeof movementSurfaceModifierDefinitions;
