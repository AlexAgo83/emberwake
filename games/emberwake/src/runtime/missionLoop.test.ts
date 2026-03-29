import { describe, expect, it } from "vitest";

import { deriveWorldSeed } from "@shared/model/worldSeed";
import { worldProfiles } from "@shared/model/worldProfiles";

import { getMissionStages, missionLoopContract } from "./missionLoop";

const distanceBetween = (
  left: { x: number; y: number },
  right: { x: number; y: number }
) => Math.hypot(right.x - left.x, right.y - left.y);

describe("missionLoop", () => {
  it("provides a distinct authored objective trio for every world profile", () => {
    const serializedMissionMaps = worldProfiles.map((worldProfile) =>
      JSON.stringify(getMissionStages(worldProfile.worldSeed))
    );

    expect(new Set(serializedMissionMaps).size).toBe(worldProfiles.length);
  });

  it("keeps mission reward items unique across the full world ladder", () => {
    const rewardItemIds = worldProfiles.flatMap((worldProfile) =>
      getMissionStages(worldProfile.worldSeed).map((stage) => stage.rewardItemId)
    );

    expect(new Set(rewardItemIds).size).toBe(rewardItemIds.length);
  });

  it("keeps minimum spacing between every objective zone in each world", () => {
    for (const worldProfile of worldProfiles) {
      const missionStages = getMissionStages(worldProfile.worldSeed);

      expect(missionStages).toHaveLength(3);

      for (let stageIndex = 0; stageIndex < missionStages.length; stageIndex += 1) {
        expect(missionStages[stageIndex]?.label.length).toBeGreaterThan(3);
        expect(missionStages[stageIndex]?.rewardLabel.length).toBeGreaterThan(3);

        for (
          let comparisonStageIndex = stageIndex + 1;
          comparisonStageIndex < missionStages.length;
          comparisonStageIndex += 1
        ) {
          expect(
            distanceBetween(
              missionStages[stageIndex]!.zoneWorldPosition,
              missionStages[comparisonStageIndex]!.zoneWorldPosition
            )
          ).toBeGreaterThanOrEqual(missionLoopContract.minimumStageSpacingWorldUnits);
        }
      }
    }
  });

  it("derives deterministic but seed-sensitive stage placement inside a world", () => {
    const firstSeed = deriveWorldSeed({
      normalizedPlayerName: "Ash",
      worldProfileId: "glowfen-basin"
    });
    const secondSeed = deriveWorldSeed({
      normalizedPlayerName: "Glass",
      worldProfileId: "glowfen-basin"
    });

    expect(getMissionStages(firstSeed)).toEqual(getMissionStages(firstSeed));
    expect(getMissionStages(firstSeed).map((stage) => stage.zoneWorldPosition)).not.toEqual(
      getMissionStages(secondSeed).map((stage) => stage.zoneWorldPosition)
    );
  });
});
