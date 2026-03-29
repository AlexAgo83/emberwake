import { describe, expect, it } from "vitest";

import {
  resolveEntitySpriteSeparationCategory,
  resolvePickupSpriteAccent,
  resolvePickupSpriteSizeWorldUnits,
  shouldRenderSpriteBackedEntityRing
} from "./entityPresentation";

describe("entityPresentation", () => {
  it("reduces gold and crystal pickup sprite size by half", () => {
    expect(
      resolvePickupSpriteSizeWorldUnits({
        pickupKind: "gold",
        renderedRadius: 20,
        visualScale: 1
      })
    ).toBe(38);
    expect(
      resolvePickupSpriteSizeWorldUnits({
        pickupKind: "crystal",
        renderedRadius: 24,
        visualScale: 1
      })
    ).toBe(38);
  });

  it("keeps other pickup families at the baseline sprite size", () => {
    expect(
      resolvePickupSpriteSizeWorldUnits({
        pickupKind: "magnet",
        renderedRadius: 20,
        visualScale: 1
      })
    ).toBe(76);
  });

  it("exposes three crystal pickup accent tiers", () => {
    expect(
      resolvePickupSpriteAccent({
        pickupKind: "crystal",
        stackCount: 1
      })
    ).toEqual({
      colorWashAlpha: 0.22,
      colorWashTint: 0x73f2ff,
      scaleMultiplier: 1
    });
    expect(
      resolvePickupSpriteAccent({
        pickupKind: "crystal",
        stackCount: 12
      })
    ).toEqual({
      colorWashAlpha: 0.28,
      colorWashTint: 0x7dff9b,
      scaleMultiplier: 1.06
    });
    expect(
      resolvePickupSpriteAccent({
        pickupKind: "crystal",
        stackCount: 55
      })
    ).toEqual({
      colorWashAlpha: 0.32,
      colorWashTint: 0xff6a78,
      scaleMultiplier: 1.12
    });
  });

  it("disables sprite separation when entity rings are hidden", () => {
    expect(
      resolveEntitySpriteSeparationCategory({
        entityRingsVisible: false,
        spriteSeparationCategory: "pickup"
      })
    ).toBeNull();
    expect(
      resolveEntitySpriteSeparationCategory({
        entityRingsVisible: true,
        spriteSeparationCategory: "pickup"
      })
    ).toBe("pickup");
  });

  it("only renders sprite-backed rings when the preference is enabled", () => {
    expect(
      shouldRenderSpriteBackedEntityRing({
        entityRingsVisible: true,
        spriteBacked: true
      })
    ).toBe(true);
    expect(
      shouldRenderSpriteBackedEntityRing({
        entityRingsVisible: false,
        spriteBacked: true
      })
    ).toBe(false);
    expect(
      shouldRenderSpriteBackedEntityRing({
        entityRingsVisible: true,
        spriteBacked: false
      })
    ).toBe(false);
  });
});
