import { describe, expect, it } from "vitest";

import { deriveWorldSeed, resolveWorldSeedBase } from "./worldSeed";
import { getWorldProfileBySeed } from "./worldProfiles";

describe("worldSeed", () => {
  it("derives a deterministic seed from normalized player name and world profile id", () => {
    const leftSeed = deriveWorldSeed({
      normalizedPlayerName: "Lena Voss",
      worldProfileId: "glowfen-basin"
    });
    const rightSeed = deriveWorldSeed({
      normalizedPlayerName: "Lena Voss",
      worldProfileId: "glowfen-basin"
    });

    expect(leftSeed).toBe(rightSeed);
    expect(leftSeed).toContain("emberwake-world-glowfen-basin");
  });

  it("changes the derived seed when the player name changes", () => {
    const leftSeed = deriveWorldSeed({
      normalizedPlayerName: "Lena Voss",
      worldProfileId: "glowfen-basin"
    });
    const rightSeed = deriveWorldSeed({
      normalizedPlayerName: "Kael Rune",
      worldProfileId: "glowfen-basin"
    });

    expect(leftSeed).not.toBe(rightSeed);
  });

  it("resolves a world profile from a derived seed using the authored base seed", () => {
    const derivedSeed = deriveWorldSeed({
      normalizedPlayerName: "Lena Voss",
      worldProfileId: "obsidian-vault"
    });

    expect(resolveWorldSeedBase(derivedSeed)).toBe("emberwake-world-obsidian-vault");
    expect(getWorldProfileBySeed(derivedSeed)?.id).toBe("obsidian-vault");
  });
});
