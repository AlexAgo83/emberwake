import type { WorldPoint } from "@engine/geometry/primitives";
import { sampleDeterministicSignature } from "@engine/world/worldContract";
import {
  getMissionRewardDefinition,
  type MissionRewardItemId,
  type MissionRewardLootArchiveId,
  type MissionRewardVisualKind
} from "@shared/model/missionRewards";
import {
  defaultWorldProfileId,
  getWorldProfileBySeed,
  type WorldProfileId
} from "@shared/model/worldProfiles";
import type { EntityAssetId } from "@src/assets/assetCatalog";

export type MissionBossId =
  | "mission-boss-sentinel"
  | "mission-boss-watchglass"
  | "mission-boss-rammer";

export type MissionState = {
  activeStageIndex: number;
  completed: boolean;
  currentBossEntityId: string | null;
  currentDroppedItemEntityId: string | null;
  exitUnlocked: boolean;
  itemCount: number;
};

export type MissionStageDefinition = {
  bossId: MissionBossId;
  label: string;
  rewardAssetId: EntityAssetId;
  rewardDescription: string;
  rewardItemId: MissionRewardItemId;
  rewardLabel: string;
  rewardLootArchiveId: MissionRewardLootArchiveId;
  rewardVisualKind: MissionRewardVisualKind;
  zoneWorldPosition: WorldPoint;
};

type MissionStageTemplate = {
  anchorWorldPosition: WorldPoint;
  bossId: MissionBossId;
  label: string;
  rewardItemId: MissionRewardItemId;
};

export const missionLoopContract = {
  exitRadiusWorldUnits: 440,
  minimumStageSpacingWorldUnits: 10_000,
  seededPlacementJitterWorldUnits: 1_150,
  zoneActivationRadiusWorldUnits: 520
} as const;

export const missionExitWorldPosition: WorldPoint = { x: 0, y: 0 };

const worldMissionStageTemplates: Record<WorldProfileId, readonly MissionStageTemplate[]> = {
  "ashwake-verge": [
    {
      anchorWorldPosition: { x: 12_000, y: 0 },
      bossId: "mission-boss-sentinel",
      label: "Sentinel Reliquary",
      rewardItemId: "ashwake-seal"
    },
    {
      anchorWorldPosition: { x: 0, y: 12_000 },
      bossId: "mission-boss-watchglass",
      label: "Watchglass Vault",
      rewardItemId: "glass-cipher"
    },
    {
      anchorWorldPosition: { x: -12_000, y: 0 },
      bossId: "mission-boss-rammer",
      label: "Rammer Breach",
      rewardItemId: "breach-writ"
    }
  ],
  "emberplain-reach": [
    {
      anchorWorldPosition: { x: 14_000, y: -2_500 },
      bossId: "mission-boss-rammer",
      label: "Kiln Spur",
      rewardItemId: "kiln-charter"
    },
    {
      anchorWorldPosition: { x: 1_500, y: 13_500 },
      bossId: "mission-boss-sentinel",
      label: "Ember Ward",
      rewardItemId: "ward-sigil"
    },
    {
      anchorWorldPosition: { x: -12_500, y: 3_000 },
      bossId: "mission-boss-watchglass",
      label: "Survey Lantern",
      rewardItemId: "lantern-prism"
    }
  ],
  "glowfen-basin": [
    {
      anchorWorldPosition: { x: 11_000, y: 4_500 },
      bossId: "mission-boss-watchglass",
      label: "Fen Mirror",
      rewardItemId: "mist-lens"
    },
    {
      anchorWorldPosition: { x: -3_500, y: 14_000 },
      bossId: "mission-boss-rammer",
      label: "Bloom Sump",
      rewardItemId: "bloom-valve"
    },
    {
      anchorWorldPosition: { x: -14_500, y: -2_500 },
      bossId: "mission-boss-sentinel",
      label: "Reed Bastion",
      rewardItemId: "reed-crest"
    }
  ],
  "obsidian-vault": [
    {
      anchorWorldPosition: { x: 15_000, y: 2_000 },
      bossId: "mission-boss-sentinel",
      label: "Vault Keystone",
      rewardItemId: "keystone-plate"
    },
    {
      anchorWorldPosition: { x: 3_500, y: -13_500 },
      bossId: "mission-boss-watchglass",
      label: "Mirror Bastion",
      rewardItemId: "mirror-core"
    },
    {
      anchorWorldPosition: { x: -13_000, y: 5_000 },
      bossId: "mission-boss-rammer",
      label: "Ruin Sluice",
      rewardItemId: "sluice-key"
    }
  ],
  "cinderfall-crown": [
    {
      anchorWorldPosition: { x: 16_500, y: 0 },
      bossId: "mission-boss-watchglass",
      label: "Crown Lantern",
      rewardItemId: "lantern-crown"
    },
    {
      anchorWorldPosition: { x: 0, y: -16_500 },
      bossId: "mission-boss-sentinel",
      label: "Abyss Gate",
      rewardItemId: "gate-mandate"
    },
    {
      anchorWorldPosition: { x: -15_500, y: 2_500 },
      bossId: "mission-boss-rammer",
      label: "Final Breach",
      rewardItemId: "cinder-writ"
    }
  ]
};

const resolveMissionWorldProfileId = (worldSeed?: string) =>
  (worldSeed ? getWorldProfileBySeed(worldSeed)?.id : null) ?? defaultWorldProfileId;

const createSeededMissionWorldPosition = (
  anchorWorldPosition: WorldPoint,
  worldSeed: string | undefined,
  rewardItemId: MissionRewardItemId
) => {
  if (!worldSeed) {
    return anchorWorldPosition;
  }

  const offsetLimit = missionLoopContract.seededPlacementJitterWorldUnits;
  const offsetX =
    (sampleDeterministicSignature(`${worldSeed}:mission:${rewardItemId}:x`) %
      (offsetLimit * 2 + 1)) -
    offsetLimit;
  const offsetY =
    (sampleDeterministicSignature(`${worldSeed}:mission:${rewardItemId}:y`) %
      (offsetLimit * 2 + 1)) -
    offsetLimit;

  return {
    x: anchorWorldPosition.x + offsetX,
    y: anchorWorldPosition.y + offsetY
  };
};

export const createInitialMissionState = (): MissionState => ({
  activeStageIndex: 0,
  completed: false,
  currentBossEntityId: null,
  currentDroppedItemEntityId: null,
  exitUnlocked: false,
  itemCount: 0
});

export const normalizeMissionState = (
  missionState: Partial<MissionState> | undefined
): MissionState => ({
  ...createInitialMissionState(),
  ...missionState,
  activeStageIndex: Math.max(0, Math.min(2, missionState?.activeStageIndex ?? 0)),
  itemCount: Math.max(0, Math.min(3, missionState?.itemCount ?? 0))
});

export const getMissionStages = (worldSeed?: string): readonly MissionStageDefinition[] =>
  worldMissionStageTemplates[resolveMissionWorldProfileId(worldSeed)].map((stageTemplate) => {
    const rewardDefinition = getMissionRewardDefinition(stageTemplate.rewardItemId);

    return {
      bossId: stageTemplate.bossId,
      label: stageTemplate.label,
      rewardAssetId: rewardDefinition.assetId,
      rewardDescription: rewardDefinition.description,
      rewardItemId: rewardDefinition.itemId,
      rewardLabel: rewardDefinition.label,
      rewardLootArchiveId: rewardDefinition.lootArchiveId,
      rewardVisualKind: rewardDefinition.visualKind,
      zoneWorldPosition: createSeededMissionWorldPosition(
        stageTemplate.anchorWorldPosition,
        worldSeed,
        stageTemplate.rewardItemId
      )
    };
  });

export const getMissionStage = (stageIndex: number, worldSeed?: string) =>
  getMissionStages(worldSeed)[stageIndex] ?? null;
