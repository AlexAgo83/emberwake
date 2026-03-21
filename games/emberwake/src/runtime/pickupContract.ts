import { chunkWorldSize } from "@engine/world/worldContract";

export const pickupContract = {
  gold: {
    value: 1
  },
  healingKit: {
    healRatio: 0.25,
    spawnChancePercent: 20
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
