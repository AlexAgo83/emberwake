import { chunkWorldSize } from "@engine/world/worldContract";

import gameplayTuningJson from "./gameplayTuning.json";
import { readArray, readFiniteNumber, readObject } from "./tuningValidation";

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

const resolveGameplayTuning = (rawValue: unknown) => {
  const root = readObject(rawValue, "gameplayTuning");
  const hostile = readObject(root.hostile, "gameplayTuning.hostile");
  const player = readObject(root.player, "gameplayTuning.player");
  const attack = readObject(
    player.automaticConeAttack,
    "gameplayTuning.player.automaticConeAttack"
  );
  const pickup = readObject(root.pickup, "gameplayTuning.pickup");
  const crystal = readObject(pickup.crystal, "gameplayTuning.pickup.crystal");
  const gold = readObject(pickup.gold, "gameplayTuning.pickup.gold");
  const healingKit = readObject(pickup.healingKit, "gameplayTuning.pickup.healingKit");
  const pickupSpawn = readObject(pickup.spawn, "gameplayTuning.pickup.spawn");
  const progression = readObject(root.progression, "gameplayTuning.progression");
  const hostileSpawn = readObject(root.hostileSpawn, "gameplayTuning.hostileSpawn");
  const hostileSpawnSectors = readArray(
    hostileSpawn.sectors,
    "gameplayTuning.hostileSpawn.sectors"
  ).map((sector, index) => {
    const sectorObject = readObject(
      sector,
      `gameplayTuning.hostileSpawn.sectors[${index}]`
    );

    return {
      centerOffsetDegrees: readFiniteNumber({
        path: `gameplayTuning.hostileSpawn.sectors[${index}].centerOffsetDegrees`,
        value: sectorObject.centerOffsetDegrees
      }),
      widthDegrees: readFiniteNumber({
        minExclusive: 0,
        path: `gameplayTuning.hostileSpawn.sectors[${index}].widthDegrees`,
        value: sectorObject.widthDegrees
      })
    };
  });

  if (hostileSpawnSectors.length === 0) {
    throw new Error("gameplayTuning.hostileSpawn.sectors must contain at least one sector.");
  }

  const distanceRatioMin = readFiniteNumber({
    minInclusive: 1,
    path: "gameplayTuning.hostileSpawn.distanceRatioMin",
    value: hostileSpawn.distanceRatioMin
  });
  const distanceRatioMax = readFiniteNumber({
    minInclusive: distanceRatioMin,
    path: "gameplayTuning.hostileSpawn.distanceRatioMax",
    value: hostileSpawn.distanceRatioMax
  });

  return {
    hostile: {
      acquisitionRadiusChunks: readFiniteNumber({
        minExclusive: 0,
        path: "gameplayTuning.hostile.acquisitionRadiusChunks",
        value: hostile.acquisitionRadiusChunks
      }),
      acquisitionRadiusWorldUnits:
        readFiniteNumber({
          minExclusive: 0,
          path: "gameplayTuning.hostile.acquisitionRadiusChunks",
          value: hostile.acquisitionRadiusChunks
        }) * chunkWorldSize,
      contactDamage: readFiniteNumber({
        integer: true,
        minInclusive: 1,
        path: "gameplayTuning.hostile.contactDamage",
        value: hostile.contactDamage
      }),
      contactDamageCooldownTicks: readFiniteNumber({
        integer: true,
        minInclusive: 1,
        path: "gameplayTuning.hostile.contactDamageCooldownTicks",
        value: hostile.contactDamageCooldownTicks
      }),
      despawnDistanceChunks: readFiniteNumber({
        minExclusive: 0,
        path: "gameplayTuning.hostile.despawnDistanceChunks",
        value: hostile.despawnDistanceChunks
      }),
      despawnDistanceWorldUnits:
        readFiniteNumber({
          minExclusive: 0,
          path: "gameplayTuning.hostile.despawnDistanceChunks",
          value: hostile.despawnDistanceChunks
        }) * chunkWorldSize,
      localPopulationCap: readFiniteNumber({
        integer: true,
        minInclusive: 1,
        path: "gameplayTuning.hostile.localPopulationCap",
        value: hostile.localPopulationCap
      }),
      maxHealth: readFiniteNumber({
        integer: true,
        minInclusive: 1,
        path: "gameplayTuning.hostile.maxHealth",
        value: hostile.maxHealth
      }),
      moveSpeedWorldUnitsPerSecond: readFiniteNumber({
        minExclusive: 0,
        path: "gameplayTuning.hostile.moveSpeedWorldUnitsPerSecond",
        value: hostile.moveSpeedWorldUnitsPerSecond
      }),
      safeSpawnDistanceChunks: readFiniteNumber({
        minExclusive: 0,
        path: "gameplayTuning.hostile.safeSpawnDistanceChunks",
        value: hostile.safeSpawnDistanceChunks
      }),
      safeSpawnDistanceWorldUnits:
        readFiniteNumber({
          minExclusive: 0,
          path: "gameplayTuning.hostile.safeSpawnDistanceChunks",
          value: hostile.safeSpawnDistanceChunks
        }) * chunkWorldSize,
      spawnAttemptCount: readFiniteNumber({
        integer: true,
        minInclusive: 1,
        path: "gameplayTuning.hostile.spawnAttemptCount",
        value: hostile.spawnAttemptCount
      }),
      spawnCooldownTicks: readFiniteNumber({
        integer: true,
        minInclusive: 1,
        path: "gameplayTuning.hostile.spawnCooldownTicks",
        value: hostile.spawnCooldownTicks
      })
    },
    hostileSpawn: {
      distanceRatioMax,
      distanceRatioMin,
      sectors: hostileSpawnSectors.map((sector) => ({
        centerOffsetDegrees: sector.centerOffsetDegrees,
        centerOffsetRadians: degreesToRadians(sector.centerOffsetDegrees),
        widthDegrees: sector.widthDegrees,
        widthRadians: degreesToRadians(sector.widthDegrees)
      }))
    },
    pickup: {
      crystal: {
        enemyDropCount: readFiniteNumber({
          integer: true,
          minInclusive: 1,
          path: "gameplayTuning.pickup.crystal.enemyDropCount",
          value: crystal.enemyDropCount
        }),
        xpValue: readFiniteNumber({
          integer: true,
          minInclusive: 1,
          path: "gameplayTuning.pickup.crystal.xpValue",
          value: crystal.xpValue
        })
      },
      gold: {
        value: readFiniteNumber({
          integer: true,
          minInclusive: 1,
          path: "gameplayTuning.pickup.gold.value",
          value: gold.value
        })
      },
      healingKit: {
        healRatio: readFiniteNumber({
          minExclusive: 0,
          path: "gameplayTuning.pickup.healingKit.healRatio",
          value: healingKit.healRatio
        }),
        spawnChancePercent: readFiniteNumber({
          integer: true,
          minInclusive: 0,
          path: "gameplayTuning.pickup.healingKit.spawnChancePercent",
          value: healingKit.spawnChancePercent
        })
      },
      spawn: {
        despawnDistanceChunks: readFiniteNumber({
          minExclusive: 0,
          path: "gameplayTuning.pickup.spawn.despawnDistanceChunks",
          value: pickupSpawn.despawnDistanceChunks
        }),
        despawnDistanceWorldUnits:
          readFiniteNumber({
            minExclusive: 0,
            path: "gameplayTuning.pickup.spawn.despawnDistanceChunks",
            value: pickupSpawn.despawnDistanceChunks
          }) * chunkWorldSize,
        localPopulationCap: readFiniteNumber({
          integer: true,
          minInclusive: 1,
          path: "gameplayTuning.pickup.spawn.localPopulationCap",
          value: pickupSpawn.localPopulationCap
        }),
        pickupRadiusWorldUnits: readFiniteNumber({
          minExclusive: 0,
          path: "gameplayTuning.pickup.spawn.pickupRadiusWorldUnits",
          value: pickupSpawn.pickupRadiusWorldUnits
        }),
        safeSpawnDistanceChunks: readFiniteNumber({
          minExclusive: 0,
          path: "gameplayTuning.pickup.spawn.safeSpawnDistanceChunks",
          value: pickupSpawn.safeSpawnDistanceChunks
        }),
        safeSpawnDistanceWorldUnits:
          readFiniteNumber({
            minExclusive: 0,
            path: "gameplayTuning.pickup.spawn.safeSpawnDistanceChunks",
            value: pickupSpawn.safeSpawnDistanceChunks
          }) * chunkWorldSize,
        spawnAttemptCount: readFiniteNumber({
          integer: true,
          minInclusive: 1,
          path: "gameplayTuning.pickup.spawn.spawnAttemptCount",
          value: pickupSpawn.spawnAttemptCount
        }),
        spawnCooldownTicks: readFiniteNumber({
          integer: true,
          minInclusive: 1,
          path: "gameplayTuning.pickup.spawn.spawnCooldownTicks",
          value: pickupSpawn.spawnCooldownTicks
        })
      }
    },
    player: {
      automaticConeAttack: {
        arcDegrees: readFiniteNumber({
          minExclusive: 0,
          path: "gameplayTuning.player.automaticConeAttack.arcDegrees",
          value: attack.arcDegrees
        }),
        arcRadians: degreesToRadians(
          readFiniteNumber({
            minExclusive: 0,
            path: "gameplayTuning.player.automaticConeAttack.arcDegrees",
            value: attack.arcDegrees
          })
        ),
        cooldownTicks: readFiniteNumber({
          integer: true,
          minInclusive: 1,
          path: "gameplayTuning.player.automaticConeAttack.cooldownTicks",
          value: attack.cooldownTicks
        }),
        damage: readFiniteNumber({
          integer: true,
          minInclusive: 1,
          path: "gameplayTuning.player.automaticConeAttack.damage",
          value: attack.damage
        }),
        rangeWorldUnits: readFiniteNumber({
          minExclusive: 0,
          path: "gameplayTuning.player.automaticConeAttack.rangeWorldUnits",
          value: attack.rangeWorldUnits
        }),
        visibleTicks: readFiniteNumber({
          integer: true,
          minInclusive: 1,
          path: "gameplayTuning.player.automaticConeAttack.visibleTicks",
          value: attack.visibleTicks
        })
      },
      maxHealth: readFiniteNumber({
        integer: true,
        minInclusive: 1,
        path: "gameplayTuning.player.maxHealth",
        value: player.maxHealth
      })
    },
    progression: {
      baseLevelXpRequired: readFiniteNumber({
        integer: true,
        minInclusive: 1,
        path: "gameplayTuning.progression.baseLevelXpRequired",
        value: progression.baseLevelXpRequired
      }),
      levelXpStep: readFiniteNumber({
        integer: true,
        minInclusive: 0,
        path: "gameplayTuning.progression.levelXpStep",
        value: progression.levelXpStep
      })
    }
  };
};

export const gameplayTuning = resolveGameplayTuning(gameplayTuningJson);
