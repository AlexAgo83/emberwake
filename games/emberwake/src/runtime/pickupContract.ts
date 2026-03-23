import { gameplayTuning } from "@game/config/gameplayTuning";

export const pickupContract = {
  crystal: gameplayTuning.pickup.crystal,
  gold: gameplayTuning.pickup.gold,
  healingKit: gameplayTuning.pickup.healingKit,
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
