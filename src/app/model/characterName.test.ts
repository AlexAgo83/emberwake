import { describe, expect, it } from "vitest";

import {
  characterNameMaxLength,
  characterNameMinLength,
  defaultCharacterName,
  normalizeCharacterName,
  validateCharacterName
} from "./characterName";

describe("characterName", () => {
  it("keeps one stable default name for first entry", () => {
    expect(defaultCharacterName).toBe("Wanderer");
  });

  it("trims and collapses repeated whitespace", () => {
    expect(normalizeCharacterName("  Lena   Voss  ")).toBe("Lena Voss");
  });

  it("accepts player-friendly names within the first-slice contract", () => {
    expect(validateCharacterName("Ash").isValid).toBe(true);
    expect(validateCharacterName("Lena Voss").isValid).toBe(true);
    expect(validateCharacterName("Kael-7").isValid).toBe(true);
  });

  it("rejects empty or too-short names", () => {
    expect(validateCharacterName(" ").error).toBe("Enter a character name.");
    expect(validateCharacterName("AB").error).toBe(
      `Use at least ${characterNameMinLength} characters.`
    );
  });

  it("rejects names above the first-slice length ceiling", () => {
    expect(validateCharacterName("A".repeat(characterNameMaxLength + 1)).error).toBe(
      `Use at most ${characterNameMaxLength} characters.`
    );
  });

  it("rejects unsupported punctuation and numeric-only names", () => {
    expect(validateCharacterName("@@@").error).toBe(
      "Use letters, numbers, spaces, apostrophes, or hyphens only."
    );
    expect(validateCharacterName("12345").error).toBe("Name cannot be numbers only.");
  });
});
