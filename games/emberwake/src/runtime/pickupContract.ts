import { gameplayTuning } from "@game/config/gameplayTuning";

export const pickupContract = {
  crystal: gameplayTuning.pickup.crystal,
  gold: gameplayTuning.pickup.gold,
  healingKit: gameplayTuning.pickup.healingKit,
  pickup: gameplayTuning.pickup.spawn,
  progression: gameplayTuning.progression
};

export const resolveXpRequiredForLevel = (level: number) =>
  pickupContract.progression.baseLevelXpRequired +
  Math.max(0, level - 1) * pickupContract.progression.levelXpStep;
