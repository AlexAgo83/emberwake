import type { EntityVisualKind } from "@game/content/entities/entityData";
import type { RunProgressionPhaseId } from "@game/runtime/runProgressionPhases";

export type HostileProfileId =
  | "ash-drifter"
  | "sentinel-husk"
  | "watchglass"
  | "watchglass-prime";

type WeightedHostileProfileEntry = {
  profileId: HostileProfileId;
  weight: number;
};

export type HostileSpawnProfile = {
  contactDamageMultiplier: number;
  footprintRadius: number;
  id: HostileProfileId;
  isMiniBoss: boolean;
  maxHealthMultiplier: number;
  moveSpeedMultiplier: number;
  renderLayer: number;
  tint: string;
  visualKind: EntityVisualKind;
};

const secondsToTicks = (seconds: number) => Math.round(seconds * 60);

export const hostilePressureContract = {
  authoredMiniBossBeatIntervalTicks: secondsToTicks(300)
} as const;

const hostileSpawnProfiles: Record<HostileProfileId, HostileSpawnProfile> = {
  "ash-drifter": {
    contactDamageMultiplier: 0.84,
    footprintRadius: 32,
    id: "ash-drifter",
    isMiniBoss: false,
    maxHealthMultiplier: 0.78,
    moveSpeedMultiplier: 1.08,
    renderLayer: 100,
    tint: "#ff8d66",
    visualKind: "debug-drifter"
  },
  "sentinel-husk": {
    contactDamageMultiplier: 1,
    footprintRadius: 40,
    id: "sentinel-husk",
    isMiniBoss: false,
    maxHealthMultiplier: 1,
    moveSpeedMultiplier: 1,
    renderLayer: 100,
    tint: "#ff6d78",
    visualKind: "debug-sentinel"
  },
  watchglass: {
    contactDamageMultiplier: 1.28,
    footprintRadius: 46,
    id: "watchglass",
    isMiniBoss: false,
    maxHealthMultiplier: 1.38,
    moveSpeedMultiplier: 0.94,
    renderLayer: 102,
    tint: "#73d8ff",
    visualKind: "debug-watcher"
  },
  "watchglass-prime": {
    contactDamageMultiplier: 1.7,
    footprintRadius: 58,
    id: "watchglass-prime",
    isMiniBoss: true,
    maxHealthMultiplier: 3.25,
    moveSpeedMultiplier: 0.92,
    renderLayer: 106,
    tint: "#ffd074",
    visualKind: "debug-watcher"
  }
};

const phaseCompositionWeights: Record<RunProgressionPhaseId, WeightedHostileProfileEntry[]> = {
  "ember-watch": [
    { profileId: "ash-drifter", weight: 4 },
    { profileId: "sentinel-husk", weight: 1 }
  ],
  "veil-break": [
    { profileId: "ash-drifter", weight: 2 },
    { profileId: "sentinel-husk", weight: 2 },
    { profileId: "watchglass", weight: 2 }
  ],
  "black-rain": [
    { profileId: "ash-drifter", weight: 1 },
    { profileId: "sentinel-husk", weight: 2 },
    { profileId: "watchglass", weight: 4 }
  ],
  "kill-grid": [
    { profileId: "ash-drifter", weight: 1 },
    { profileId: "sentinel-husk", weight: 1 },
    { profileId: "watchglass", weight: 6 }
  ]
};

export const isMiniBossBeatTick = (tick: number) =>
  tick > 0 && tick % hostilePressureContract.authoredMiniBossBeatIntervalTicks === 0;

export const getHostileSpawnProfile = (profileId: HostileProfileId) =>
  hostileSpawnProfiles[profileId];

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
