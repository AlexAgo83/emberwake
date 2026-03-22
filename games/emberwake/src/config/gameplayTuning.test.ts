import { describe, expect, it } from "vitest";

import { gameplayTuning } from "./gameplayTuning";

describe("gameplayTuning", () => {
  it("derives world-unit and radian values from authored gameplay JSON", () => {
    expect(gameplayTuning.hostile.acquisitionRadiusWorldUnits).toBeGreaterThan(0);
    expect(gameplayTuning.player.automaticConeAttack.arcRadians).toBeCloseTo(
      (120 * Math.PI) / 180
    );
    expect(gameplayTuning.hostileSpawn.sectors).toHaveLength(8);
  });
});
