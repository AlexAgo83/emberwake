import type { EntityAssetId } from "@src/assets/assetCatalog";

export type MissionRewardItemId =
  | "ashwake-seal"
  | "glass-cipher"
  | "breach-writ"
  | "kiln-charter"
  | "ward-sigil"
  | "lantern-prism"
  | "mist-lens"
  | "bloom-valve"
  | "reed-crest"
  | "keystone-plate"
  | "mirror-core"
  | "sluice-key"
  | "lantern-crown"
  | "gate-mandate"
  | "cinder-writ";

export type MissionRewardLootArchiveId = `mission-${MissionRewardItemId}`;
export type MissionRewardVisualKind = `pickup-mission-${MissionRewardItemId}`;

export type MissionRewardDefinition = {
  assetId: EntityAssetId;
  description: string;
  itemId: MissionRewardItemId;
  label: string;
  lootArchiveId: MissionRewardLootArchiveId;
  visualKind: MissionRewardVisualKind;
};

const createMissionRewardDefinition = (
  itemId: MissionRewardItemId,
  label: string,
  description: string
): MissionRewardDefinition => ({
  assetId: `entity.pickup.mission.${itemId}.runtime`,
  description,
  itemId,
  label,
  lootArchiveId: `mission-${itemId}`,
  visualKind: `pickup-mission-${itemId}`
});

export const missionRewardDefinitions = {
  "ashwake-seal": createMissionRewardDefinition(
    "ashwake-seal",
    "Ashwake Seal",
    "A scorched frontier seal recovered from the first Ashwake objective chain."
  ),
  "glass-cipher": createMissionRewardDefinition(
    "glass-cipher",
    "Glass Cipher",
    "A mission prism encoding survey routes through shattered watchglass lanes."
  ),
  "breach-writ": createMissionRewardDefinition(
    "breach-writ",
    "Breach Writ",
    "A stamped breach order proving the rammer line was broken open."
  ),
  "kiln-charter": createMissionRewardDefinition(
    "kiln-charter",
    "Kiln Charter",
    "A heat-scored charter lifted from the emberplain kiln spur."
  ),
  "ward-sigil": createMissionRewardDefinition(
    "ward-sigil",
    "Ward Sigil",
    "A plated sigil that once anchored the ember ward perimeter."
  ),
  "lantern-prism": createMissionRewardDefinition(
    "lantern-prism",
    "Lantern Prism",
    "A refractor lantern shard pointing deeper through the ember survey routes."
  ),
  "mist-lens": createMissionRewardDefinition(
    "mist-lens",
    "Mist Lens",
    "A fog-hardened lens drawn from the Glowfen mirror basin."
  ),
  "bloom-valve": createMissionRewardDefinition(
    "bloom-valve",
    "Bloom Valve",
    "A bloom-fed regulator pulled out of the fen sump pressure nest."
  ),
  "reed-crest": createMissionRewardDefinition(
    "reed-crest",
    "Reed Crest",
    "A marsh crest plate used to signal the basin's bastion line."
  ),
  "keystone-plate": createMissionRewardDefinition(
    "keystone-plate",
    "Keystone Plate",
    "A vault keystone plate that unlocks deeper obsidian corridors."
  ),
  "mirror-core": createMissionRewardDefinition(
    "mirror-core",
    "Mirror Core",
    "A polished core still humming with the vault's reflected charge."
  ),
  "sluice-key": createMissionRewardDefinition(
    "sluice-key",
    "Sluice Key",
    "A ruin sluice key recovered from collapsed obsidian infrastructure."
  ),
  "lantern-crown": createMissionRewardDefinition(
    "lantern-crown",
    "Lantern Crown",
    "A crown lantern socket carried by the breach's final relay frame."
  ),
  "gate-mandate": createMissionRewardDefinition(
    "gate-mandate",
    "Gate Mandate",
    "A mandate shard that certifies passage through the abyss gate lattice."
  ),
  "cinder-writ": createMissionRewardDefinition(
    "cinder-writ",
    "Cinder Writ",
    "The final writ confirming the crown breach was forced open."
  )
} as const satisfies Record<MissionRewardItemId, MissionRewardDefinition>;

export const missionRewardItemIds = Object.keys(
  missionRewardDefinitions
) as MissionRewardItemId[];

export const listMissionRewardDefinitions = () =>
  missionRewardItemIds.map((itemId) => missionRewardDefinitions[itemId]);

export const getMissionRewardDefinition = (itemId: MissionRewardItemId) =>
  missionRewardDefinitions[itemId];
