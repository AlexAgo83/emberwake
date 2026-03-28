import type { EntityVisualKind } from "@game/content/entities/entityData";
import type { RunProgressionPhaseId } from "@game/runtime/runProgressionPhases";

export type HostileProfileId =
  | "ash-drifter"
  | "needle-wisp"
  | "shock-ram"
  | "sentinel-husk"
  | "watchglass"
  | "watchglass-prime";

type WeightedHostileProfileEntry = {
  profileId: HostileProfileId;
  weight: number;
};

export type HostileBehaviorKind = "pursuit" | "telegraphed-charge";

export type HostileSpawnProfile = {
  behaviorKind: HostileBehaviorKind;
  contactDamageMultiplier: number;
  footprintRadius: number;
  id: HostileProfileId;
  isMiniBoss: boolean;
  maxHealthMultiplier: number;
  moveSpeedMultiplier: number;
  renderLayer: number;
  tint: string;
  visualKind: EntityVisualKind;
  visualScaleMultiplier: number;
};

const secondsToTicks = (seconds: number) => Math.round(seconds * 60);

export const hostilePressureContract = {
  authoredMiniBossBeatIntervalTicks: secondsToTicks(300),
  bossDefeatEscalation: {
    hostileContactDamageMultiplierStep: 0.08,
    hostileMaxHealthMultiplierStep: 0.18,
    localPopulationCapBonusStep: 2,
    spawnCooldownMultiplierStep: 0.92
  }
} as const;

const hostileSpawnProfiles: Record<HostileProfileId, HostileSpawnProfile> = {
  "ash-drifter": {
    behaviorKind: "pursuit",
    contactDamageMultiplier: 0.84,
    footprintRadius: 32,
    id: "ash-drifter",
    isMiniBoss: false,
    maxHealthMultiplier: 0.78,
    moveSpeedMultiplier: 1.08,
    renderLayer: 100,
    tint: "#ff8d66",
    visualKind: "debug-drifter",
    visualScaleMultiplier: 1
  },
  "needle-wisp": {
    behaviorKind: "pursuit",
    contactDamageMultiplier: 0.72,
    footprintRadius: 20,
    id: "needle-wisp",
    isMiniBoss: false,
    maxHealthMultiplier: 0.52,
    moveSpeedMultiplier: 1.5,
    renderLayer: 98,
    tint: "#ffbb72",
    visualKind: "debug-needle",
    visualScaleMultiplier: 0.5
  },
  "shock-ram": {
    behaviorKind: "telegraphed-charge",
    contactDamageMultiplier: 1.46,
    footprintRadius: 42,
    id: "shock-ram",
    isMiniBoss: false,
    maxHealthMultiplier: 1.22,
    moveSpeedMultiplier: 0.92,
    renderLayer: 104,
    tint: "#ff4f63",
    visualKind: "debug-rammer",
    visualScaleMultiplier: 1
  },
  "sentinel-husk": {
    behaviorKind: "pursuit",
    contactDamageMultiplier: 1,
    footprintRadius: 40,
    id: "sentinel-husk",
    isMiniBoss: false,
    maxHealthMultiplier: 1,
    moveSpeedMultiplier: 1,
    renderLayer: 100,
    tint: "#ff6d78",
    visualKind: "debug-sentinel",
    visualScaleMultiplier: 1
  },
  watchglass: {
    behaviorKind: "pursuit",
    contactDamageMultiplier: 1.28,
    footprintRadius: 46,
    id: "watchglass",
    isMiniBoss: false,
    maxHealthMultiplier: 1.38,
    moveSpeedMultiplier: 0.94,
    renderLayer: 102,
    tint: "#73d8ff",
    visualKind: "debug-watcher",
    visualScaleMultiplier: 1
  },
  "watchglass-prime": {
    behaviorKind: "pursuit",
    contactDamageMultiplier: 1.7,
    footprintRadius: 58,
    id: "watchglass-prime",
    isMiniBoss: true,
    maxHealthMultiplier: 10,
    moveSpeedMultiplier: 0.92,
    renderLayer: 106,
    tint: "#ffd074",
    visualKind: "debug-watcher",
    visualScaleMultiplier: 1.5
  }
};

const phaseCompositionWeights: Record<RunProgressionPhaseId, WeightedHostileProfileEntry[]> = {
  "ember-watch": [
    { profileId: "ash-drifter", weight: 4 },
    { profileId: "needle-wisp", weight: 1 },
    { profileId: "sentinel-husk", weight: 1 }
  ],
  "veil-break": [
    { profileId: "ash-drifter", weight: 2 },
    { profileId: "needle-wisp", weight: 1 },
    { profileId: "sentinel-husk", weight: 2 },
    { profileId: "watchglass", weight: 2 }
  ],
  "black-rain": [
    { profileId: "ash-drifter", weight: 1 },
    { profileId: "needle-wisp", weight: 2 },
    { profileId: "shock-ram", weight: 1 },
    { profileId: "sentinel-husk", weight: 2 },
    { profileId: "watchglass", weight: 4 }
  ],
  "kill-grid": [
    { profileId: "needle-wisp", weight: 2 },
    { profileId: "shock-ram", weight: 2 },
    { profileId: "sentinel-husk", weight: 1 },
    { profileId: "watchglass", weight: 6 }
  ]
};

export const isMiniBossBeatTick = (tick: number) =>
  tick > 0 && tick % hostilePressureContract.authoredMiniBossBeatIntervalTicks === 0;

export const getHostileSpawnProfile = (profileId: HostileProfileId) =>
  hostileSpawnProfiles[profileId];

export const resolveBossDefeatEscalation = (bossDefeatCount: number) => {
  const resolvedBossDefeatCount = Math.max(0, Math.floor(bossDefeatCount));

  return {
    hostileContactDamageMultiplier:
      1 +
      hostilePressureContract.bossDefeatEscalation.hostileContactDamageMultiplierStep *
        resolvedBossDefeatCount,
    hostileMaxHealthMultiplier:
      1 +
      hostilePressureContract.bossDefeatEscalation.hostileMaxHealthMultiplierStep *
        resolvedBossDefeatCount,
    localPopulationCapBonus:
      hostilePressureContract.bossDefeatEscalation.localPopulationCapBonusStep *
      resolvedBossDefeatCount,
    spawnCooldownMultiplier: Math.pow(
      hostilePressureContract.bossDefeatEscalation.spawnCooldownMultiplierStep,
      resolvedBossDefeatCount
    )
  };
};

export const resolveHostileSpawnProfile = ({
  hostileSequence,
  phaseId,
  spawnedAtTick
}: {
  hostileSequence: number;
  phaseId: RunProgressionPhaseId;
  spawnedAtTick: number;
}) => {
  if (isMiniBossBeatTick(spawnedAtTick)) {
    return hostileSpawnProfiles["watchglass-prime"];
  }

  const weightedProfiles = phaseCompositionWeights[phaseId];
  const totalWeight = weightedProfiles.reduce(
    (currentTotal, profileEntry) => currentTotal + profileEntry.weight,
    0
  );
  let remainingWeight = hostileSequence % totalWeight;

  for (const weightedProfile of weightedProfiles) {
    if (remainingWeight < weightedProfile.weight) {
      return hostileSpawnProfiles[weightedProfile.profileId];
    }

    remainingWeight -= weightedProfile.weight;
  }

  return hostileSpawnProfiles[weightedProfiles[weightedProfiles.length - 1]!.profileId];
};
