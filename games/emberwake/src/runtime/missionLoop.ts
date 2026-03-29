import type { WorldPoint } from "@engine/geometry/primitives";
import {
  defaultWorldProfileId,
  getWorldProfileBySeed,
  type WorldProfileId
} from "@shared/model/worldProfiles";

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
  rewardLabel: string;
  zoneWorldPosition: WorldPoint;
};

export const missionLoopContract = {
  exitRadiusWorldUnits: 440,
  minimumStageSpacingWorldUnits: 10_000,
  zoneActivationRadiusWorldUnits: 520
} as const;

export const missionExitWorldPosition: WorldPoint = { x: 0, y: 0 };

const worldMissionStages: Record<WorldProfileId, readonly MissionStageDefinition[]> = {
  "ashwake-verge": [
    {
      bossId: "mission-boss-sentinel",
      label: "Sentinel Reliquary",
      rewardLabel: "Ashwake Seal",
      zoneWorldPosition: { x: 12_000, y: 0 }
    },
    {
      bossId: "mission-boss-watchglass",
      label: "Watchglass Vault",
      rewardLabel: "Glass Cipher",
      zoneWorldPosition: { x: 0, y: 12_000 }
    },
    {
      bossId: "mission-boss-rammer",
      label: "Rammer Breach",
      rewardLabel: "Breach Writ",
      zoneWorldPosition: { x: -12_000, y: 0 }
    }
  ],
  "emberplain-reach": [
    {
      bossId: "mission-boss-rammer",
      label: "Kiln Spur",
      rewardLabel: "Kiln Charter",
      zoneWorldPosition: { x: 14_000, y: -2_500 }
    },
    {
      bossId: "mission-boss-sentinel",
      label: "Ember Ward",
      rewardLabel: "Ward Sigil",
      zoneWorldPosition: { x: 1_500, y: 13_500 }
    },
    {
      bossId: "mission-boss-watchglass",
      label: "Survey Lantern",
      rewardLabel: "Lantern Prism",
      zoneWorldPosition: { x: -12_500, y: 3_000 }
    }
  ],
  "glowfen-basin": [
    {
      bossId: "mission-boss-watchglass",
      label: "Fen Mirror",
      rewardLabel: "Mist Lens",
      zoneWorldPosition: { x: 11_000, y: 4_500 }
    },
    {
      bossId: "mission-boss-rammer",
      label: "Bloom Sump",
      rewardLabel: "Bloom Valve",
      zoneWorldPosition: { x: -3_500, y: 14_000 }
    },
    {
      bossId: "mission-boss-sentinel",
      label: "Reed Bastion",
      rewardLabel: "Reed Crest",
      zoneWorldPosition: { x: -14_500, y: -2_500 }
    }
  ],
  "obsidian-vault": [
    {
      bossId: "mission-boss-sentinel",
      label: "Vault Keystone",
      rewardLabel: "Keystone Plate",
      zoneWorldPosition: { x: 15_000, y: 2_000 }
    },
    {
      bossId: "mission-boss-watchglass",
      label: "Mirror Bastion",
      rewardLabel: "Mirror Core",
      zoneWorldPosition: { x: 3_500, y: -13_500 }
    },
    {
      bossId: "mission-boss-rammer",
      label: "Ruin Sluice",
      rewardLabel: "Sluice Key",
      zoneWorldPosition: { x: -13_000, y: 5_000 }
    }
  ],
  "cinderfall-crown": [
    {
      bossId: "mission-boss-watchglass",
      label: "Crown Lantern",
      rewardLabel: "Lantern Crown",
      zoneWorldPosition: { x: 16_500, y: 0 }
    },
    {
      bossId: "mission-boss-sentinel",
      label: "Abyss Gate",
      rewardLabel: "Gate Mandate",
      zoneWorldPosition: { x: 0, y: -16_500 }
    },
    {
      bossId: "mission-boss-rammer",
      label: "Final Breach",
      rewardLabel: "Cinder Writ",
      zoneWorldPosition: { x: -15_500, y: 2_500 }
    }
  ]
};

const resolveMissionWorldProfileId = (worldSeed?: string) =>
  (worldSeed ? getWorldProfileBySeed(worldSeed)?.id : null) ?? defaultWorldProfileId;

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

export const getMissionStages = (worldSeed?: string) =>
  worldMissionStages[resolveMissionWorldProfileId(worldSeed)];

export const getMissionStage = (stageIndex: number, worldSeed?: string) =>
  getMissionStages(worldSeed)[stageIndex] ?? null;
