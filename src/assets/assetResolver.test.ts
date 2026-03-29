import { describe, expect, it } from "vitest";

import { derivePlaceholderAssetId, resolveAssetCandidateIds } from "./assetResolver";

describe("assetResolver", () => {
  it("derives a placeholder asset id from a runtime asset id", () => {
    expect(derivePlaceholderAssetId("entity.player.primary.runtime")).toBe(
      "entity.player.primary.placeholder"
    );
    expect(derivePlaceholderAssetId("shell.scene.codex.header.runtime")).toBe(
      "shell.scene.codex.header.placeholder"
    );
  });

  it("returns null when the asset id does not expose a lifecycle suffix", () => {
    expect(derivePlaceholderAssetId("entity.player.primary")).toBeNull();
  });

  it("resolves candidates through explicit catalog fallback before derived placeholder fallback", () => {
    expect(resolveAssetCandidateIds("entity.hostile.anchor.runtime")).toEqual([
      "entity.hostile.anchor.runtime",
      "entity.debug.anchor.placeholder",
      "entity.hostile.anchor.placeholder"
    ]);
  });

  it("keeps the candidate list stable for runtime asset ids without an explicit fallback", () => {
    expect(resolveAssetCandidateIds("shell.scene.codex.header.runtime")).toEqual([
      "shell.scene.codex.header.runtime",
      "shell.scene.codex.header.placeholder"
    ]);
  });
});
