import { chunkWorldSize } from "@engine/world/worldContract";

export const hostileCombatContract = {
  hostile: {
    acquisitionRadiusWorldUnits: chunkWorldSize * 1.8,
    contactDamage: 10,
    contactDamageCooldownTicks: 30,
    despawnDistanceWorldUnits: chunkWorldSize * 3.5,
    localPopulationCap: 20,
    maxHealth: 40,
    moveSpeedWorldUnitsPerSecond: 168,
    safeSpawnDistanceWorldUnits: chunkWorldSize * 0.9,
    spawnAttemptCount: 8,
    spawnCooldownTicks: 36
  },
  player: {
    automaticConeAttack: {
      arcRadians: (120 * Math.PI) / 180,
      cooldownTicks: 18,
      damage: 20,
      rangeWorldUnits: 172,
      visibleTicks: 8
    },
    maxHealth: 100
  }
} as const;
