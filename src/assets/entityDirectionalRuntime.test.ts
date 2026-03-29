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
    expect(deriveDirectionalAssetId("entity.hostile.anchor.runtime", "left")).toBe(
      "entity.hostile.anchor.runtime.left"
    );
  });

  it("maps entity orientation into stable lateral facings", () => {
    expect(resolveFacingFromOrientation(0)).toBe("right");
    expect(resolveFacingFromOrientation(Math.PI)).toBe("left");
    expect(resolveFacingFromOrientation(Math.PI / 2 - 0.01)).toBe("right");
    expect(resolveFacingFromOrientation(Math.PI / 2 + 0.01)).toBe("left");
    expect(resolveFacingFromOrientation(-Math.PI / 2 + 0.01)).toBe("right");
    expect(resolveFacingFromOrientation(-Math.PI / 2 - 0.01)).toBe("left");
  });

  it("keeps the previous lateral facing when the orientation is strictly vertical", () => {
    expect(resolveFacingFromOrientation(Math.PI / 2, "right")).toBe("right");
    expect(resolveFacingFromOrientation(Math.PI / 2, "left")).toBe("left");
    expect(resolveFacingFromOrientation(-Math.PI / 2, "right")).toBe("right");
    expect(resolveFacingFromOrientation(-Math.PI / 2, "left")).toBe("left");
  });

  it("uses explicit directional variants when they exist", () => {
    const resolveAsset = (assetId: string) =>
      assetId === "entity.player.primary.runtime.right" ? `/assets/${assetId}.png` : null;

    expect(
      resolveEntitySpritePresentation({
        assetId: "entity.player.primary.runtime",
        facingMode: "lateral-mirror-left",
        orientation: 0,
        previousFacing: "left",
        resolveAsset
      })
    ).toMatchObject({
      facing: "right",
      mirrorX: false,
      resolvedAssetId: "entity.player.primary.runtime.right",
      rotation: 0,
      strategy: "lateral-directional"
    });
  });

  it("mirrors the right-facing asset for left when reviewed reuse is allowed", () => {
    const resolveAsset = (assetId: string) =>
      assetId === "entity.hostile.anchor.runtime.right" ? `/assets/${assetId}.png` : null;

    expect(
      resolveEntitySpritePresentation({
        assetId: "entity.hostile.anchor.runtime",
        facingMode: "lateral-mirror-left",
        orientation: Math.PI,
        previousFacing: "right",
        resolveAsset
      })
    ).toMatchObject({
      facing: "left",
      mirrorX: true,
      resolvedAssetId: "entity.hostile.anchor.runtime.right",
      rotation: 0,
      strategy: "lateral-mirrored-right"
    });
  });

  it("mirrors the base runtime asset for left when only the default right-facing base exists", () => {
    const resolveAsset = (assetId: string) =>
      assetId === "entity.hostile.sentinel.runtime" ? `/assets/${assetId}.png` : null;

    expect(
      resolveEntitySpritePresentation({
        assetId: "entity.hostile.sentinel.runtime",
        facingMode: "lateral-mirror-left",
        orientation: -Math.PI / 2,
        previousFacing: "left",
        resolveAsset
      })
    ).toMatchObject({
      facing: "left",
      mirrorX: true,
      resolvedAssetId: "entity.hostile.sentinel.runtime",
      rotation: 0,
      strategy: "lateral-mirrored-base-right"
    });
  });

  it("keeps rotation-safe families on the single-face rotating posture", () => {
    expect(
      resolveEntitySpritePresentation({
        assetId: "entity.hostile.needle.runtime",
        facingMode: "single-rotating",
        orientation: -Math.PI / 3,
        previousFacing: "right",
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
