import type { MapAssetId } from "@src/assets/assetCatalog";

const derivedWorldSeedDelimiter = "::runner:";

export type WorldProfileId =
  | "ashwake-verge"
  | "emberplain-reach"
  | "glowfen-basin"
  | "obsidian-vault"
  | "cinderfall-crown";

export type WorldProfile = {
  description: string;
  hostileDamageMultiplier: number;
  hostileHealthMultiplier: number;
  id: WorldProfileId;
  label: string;
  representativeAssetId: MapAssetId;
  tier: number;
  worldSeed: string;
};

export type WorldProgress = {
  attemptCount: number;
  bestMissionItemCount: number;
  completionCount: number;
  isCompleted: boolean;
  isUnlocked: boolean;
};

export const worldProfiles = [
  {
    description: "The first ash-laced frontier where the shell learns to survive.",
    hostileDamageMultiplier: 1,
    hostileHealthMultiplier: 1,
    id: "ashwake-verge",
    label: "Ashwake Verge",
    representativeAssetId: "map.terrain.ashfield.runtime",
    tier: 1,
    worldSeed: "emberwake-world-ashwake-verge"
  },
  {
    description: "Open ember lanes with hotter pressure and longer pursuit sightlines.",
    hostileDamageMultiplier: 1.1,
    hostileHealthMultiplier: 1.1,
    id: "emberplain-reach",
    label: "Emberplain Reach",
    representativeAssetId: "map.terrain.emberplain.runtime",
    tier: 2,
    worldSeed: "emberwake-world-emberplain-reach"
  },
  {
    description: "Cold bloom marshland where the swarm hits harder from the fog.",
    hostileDamageMultiplier: 1.2,
    hostileHealthMultiplier: 1.2,
    id: "glowfen-basin",
    label: "Glowfen Basin",
    representativeAssetId: "map.terrain.glowfen.runtime",
    tier: 3,
    worldSeed: "emberwake-world-glowfen-basin"
  },
  {
    description: "A sealed obsidian lattice where elite pressure sharpens into attrition.",
    hostileDamageMultiplier: 1.3,
    hostileHealthMultiplier: 1.3,
    id: "obsidian-vault",
    label: "Obsidian Vault",
    representativeAssetId: "map.terrain.obsidian.runtime",
    tier: 4,
    worldSeed: "emberwake-world-obsidian-vault"
  },
  {
    description: "The crownfall breach, where the final world pushes the ladder to its cap.",
    hostileDamageMultiplier: 1.4,
    hostileHealthMultiplier: 1.4,
    id: "cinderfall-crown",
    label: "Cinderfall Crown",
    representativeAssetId: "map.terrain.emberplain.runtime",
    tier: 5,
    worldSeed: "emberwake-world-cinderfall-crown"
  }
] as const satisfies readonly WorldProfile[];

export const worldProfileIds = worldProfiles.map((worldProfile) => worldProfile.id);
export const worldProfileSeedOptions = worldProfiles.map((worldProfile) => worldProfile.worldSeed) as [
  WorldProfile["worldSeed"],
  ...WorldProfile["worldSeed"][]
];

export const defaultWorldProfileId: WorldProfileId = "ashwake-verge";

export const getWorldProfile = (worldProfileId: WorldProfileId) =>
  worldProfiles.find((worldProfile) => worldProfile.id === worldProfileId)!;

export const getWorldProfileBySeed = (worldSeed: string) =>
  worldProfiles.find(
    (worldProfile) =>
      worldProfile.worldSeed === (worldSeed.split(derivedWorldSeedDelimiter, 1)[0] ?? worldSeed)
  ) ?? null;

export const getNextWorldProfileId = (worldProfileId: WorldProfileId): WorldProfileId | null => {
  const currentWorldIndex = worldProfiles.findIndex(
    (worldProfile) => worldProfile.id === worldProfileId
  );

  if (currentWorldIndex === -1 || currentWorldIndex >= worldProfiles.length - 1) {
    return null;
  }

  return worldProfiles[currentWorldIndex + 1]!.id;
};

export const createDefaultWorldProgressRecord = (): Record<WorldProfileId, WorldProgress> =>
  Object.fromEntries(
    worldProfiles.map((worldProfile) => [
      worldProfile.id,
      {
        attemptCount: 0,
        bestMissionItemCount: 0,
        completionCount: 0,
        isCompleted: false,
        isUnlocked: worldProfile.id === defaultWorldProfileId
      }
    ])
  ) as Record<WorldProfileId, WorldProgress>;
