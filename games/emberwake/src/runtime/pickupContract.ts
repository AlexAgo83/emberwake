import { chunkWorldSize } from "@engine/world/worldContract";

export const pickupContract = {
  crystal: {
    enemyDropCount: 1,
    xpValue: 25
  },
  gold: {
    value: 1
  },
  healingKit: {
    healRatio: 0.25,
    spawnChancePercent: 20
  },
  progression: {
    baseLevelXpRequired: 100,
    levelXpStep: 50
  },
  pickup: {
    despawnDistanceWorldUnits: chunkWorldSize * 2.8,
    localPopulationCap: 4,
    pickupRadiusWorldUnits: 22,
    safeSpawnDistanceWorldUnits: chunkWorldSize * 0.45,
    spawnAttemptCount: 8,
    spawnCooldownTicks: 24
  }
} as const;

export const resolveXpRequiredForLevel = (level: number) =>
  pickupContract.progression.baseLevelXpRequired +
  Math.max(0, level - 1) * pickupContract.progression.levelXpStep;
