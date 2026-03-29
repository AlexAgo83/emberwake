import { describe, expect, it } from "vitest";

import {
  deriveDirectionalAssetId,
  resolveEntitySpritePresentation,
  resolveFacingFromOrientation
} from "./entityDirectionalRuntime";

describe("entityDirectionalRuntime", () => {
  it("derives directional asset ids from the base runtime asset id", () => {
    expect(deriveDirectionalAssetId("entity.player.primary.runtime", "right")).toBe(
      "entity.player.primary.runtime.right"
    );
    expect(deriveDirectionalAssetId("entity.hostile.anchor.runtime", "up")).toBe(
      "entity.hostile.anchor.runtime.up"
    );
  });

  it("maps entity orientation into stable cardinal facings", () => {
    expect(resolveFacingFromOrientation(0)).toBe("right");
    expect(resolveFacingFromOrientation(Math.PI / 2)).toBe("up");
    expect(resolveFacingFromOrientation(Math.PI)).toBe("left");
    expect(resolveFacingFromOrientation(-Math.PI / 2)).toBe("down");
  });

  it("uses explicit directional variants when they exist", () => {
    const resolveAsset = (assetId: string) =>
      assetId === "entity.player.primary.runtime.up" ? `/assets/${assetId}.png` : null;

    expect(
      resolveEntitySpritePresentation({
        assetId: "entity.player.primary.runtime",
        facingMode: "cardinal-mirror-left",
        orientation: Math.PI / 2,
        resolveAsset
      })
    ).toMatchObject({
      facing: "up",
      mirrorX: false,
      resolvedAssetId: "entity.player.primary.runtime.up",
      rotation: 0,
      strategy: "cardinal-directional"
    });
  });

  it("mirrors the right-facing asset for left when reviewed reuse is allowed", () => {
    const resolveAsset = (assetId: string) =>
      assetId === "entity.hostile.anchor.runtime.right" ? `/assets/${assetId}.png` : null;

    expect(
      resolveEntitySpritePresentation({
        assetId: "entity.hostile.anchor.runtime",
        facingMode: "cardinal-mirror-left",
        orientation: Math.PI,
        resolveAsset
      })
    ).toMatchObject({
      facing: "left",
      mirrorX: true,
      resolvedAssetId: "entity.hostile.anchor.runtime.right",
      rotation: 0,
      strategy: "cardinal-mirrored-right"
    });
  });

  it("falls back to the base runtime asset with live rotation when directional art is missing", () => {
    const resolveAsset = (assetId: string) =>
      assetId === "entity.hostile.sentinel.runtime" ? `/assets/${assetId}.png` : null;

    expect(
      resolveEntitySpritePresentation({
        assetId: "entity.hostile.sentinel.runtime",
        facingMode: "cardinal-mirror-left",
        orientation: -Math.PI / 2,
        resolveAsset
      })
    ).toMatchObject({
      facing: "down",
      mirrorX: false,
      resolvedAssetId: "entity.hostile.sentinel.runtime",
      rotation: -Math.PI / 2,
      strategy: "fallback-rotating-base"
    });
  });

  it("keeps rotation-safe families on the single-face rotating posture", () => {
    expect(
      resolveEntitySpritePresentation({
        assetId: "entity.hostile.needle.runtime",
        facingMode: "single-rotating",
        orientation: -Math.PI / 3,
        resolveAsset: () => null
      })
    ).toMatchObject({
      facing: null,
      mirrorX: false,
      resolvedAssetId: "entity.hostile.needle.runtime",
      rotation: -Math.PI / 3,
      strategy: "single-rotating"
    });
  });
});
