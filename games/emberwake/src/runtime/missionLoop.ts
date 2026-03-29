import type { WorldPoint } from "@engine/geometry/primitives";

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
  zoneWorldPosition: WorldPoint;
};

export const missionLoopContract = {
  exitRadiusWorldUnits: 440,
  minimumStageSpacingWorldUnits: 10_000,
  zoneActivationRadiusWorldUnits: 520
} as const;

export const missionExitWorldPosition: WorldPoint = { x: 0, y: 0 };

export const missionStages: MissionStageDefinition[] = [
  {
    bossId: "mission-boss-sentinel",
    label: "Sentinel Reliquary",
    zoneWorldPosition: { x: 12_000, y: 0 }
  },
  {
    bossId: "mission-boss-watchglass",
    label: "Watchglass Vault",
    zoneWorldPosition: { x: 0, y: 12_000 }
  },
  {
    bossId: "mission-boss-rammer",
    label: "Rammer Breach",
    zoneWorldPosition: { x: -12_000, y: 0 }
  }
] as const;

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
  activeStageIndex: Math.max(0, Math.min(missionStages.length - 1, missionState?.activeStageIndex ?? 0)),
  itemCount: Math.max(0, Math.min(missionStages.length, missionState?.itemCount ?? 0))
});

export const getMissionStage = (stageIndex: number) => missionStages[stageIndex] ?? null;
