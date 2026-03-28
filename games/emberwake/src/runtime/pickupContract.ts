import { gameplayTuning } from "@game/config/gameplayTuning";

export const pickupContract = {
  crystal: gameplayTuning.pickup.crystal,
  crystalFlow: {
    attractionRadiusMultiplier: 3.4,
    magnetAttractionSpeedWorldUnitsPerSecond: 1320,
    proximityAttractionSpeedWorldUnitsPerSecond: 620
  },
  gold: gameplayTuning.pickup.gold,
  healingKit: gameplayTuning.pickup.healingKit,
  hourglass: {
    durationTicks: 60 * 3,
    spawnChancePercent: 3
  },
  magnet: {
    spawnChancePercent: 9
  },
  pickup: gameplayTuning.pickup.spawn,
  progression: gameplayTuning.progression
};

export const resolveXpRequiredForLevel = (level: number) =>
  (() => {
    const levelIndex = Math.max(0, level - 1);

    return (
      pickupContract.progression.baseLevelXpRequired +
      levelIndex * pickupContract.progression.levelXpStep +
      levelIndex * levelIndex * 12 +
      Math.floor(levelIndex / 3) * 35
    );
  })();
