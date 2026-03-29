import type { SimulatedEntity } from "../model/entitySimulation";

export const defaultEntityRingsVisible = false;

export type PickupSpriteAccent = {
  colorWashAlpha: number;
  colorWashTint: number;
  scaleMultiplier: number;
};

const crystalPickupAccents: Record<"high" | "low" | "mid", PickupSpriteAccent> = {
  high: {
    colorWashAlpha: 0.32,
    colorWashTint: 0xff6a78,
    scaleMultiplier: 1.12
  },
  low: {
    colorWashAlpha: 0.22,
    colorWashTint: 0x73f2ff,
    scaleMultiplier: 1
  },
  mid: {
    colorWashAlpha: 0.28,
    colorWashTint: 0x7dff9b,
    scaleMultiplier: 1.06
  }
};

export const resolvePickupSpriteSizeWorldUnits = ({
  pickupKind,
  renderedRadius,
  visualScale = 1
}: {
  pickupKind: SimulatedEntity["pickupProfile"] extends infer PickupProfile
    ? PickupProfile extends { kind: infer Kind }
      ? Kind | null
      : null
    : null;
  renderedRadius: number;
  visualScale?: number;
}) => {
  const basePickupSpriteSize = Math.max(renderedRadius * 2.3, 76 * visualScale);

  if (pickupKind === "crystal" || pickupKind === "gold") {
    return basePickupSpriteSize * 0.5;
  }

  return basePickupSpriteSize;
};

export const resolvePickupSpriteAccent = ({
  pickupKind,
  stackCount
}: {
  pickupKind: SimulatedEntity["pickupProfile"] extends infer PickupProfile
    ? PickupProfile extends { kind: infer Kind }
      ? Kind | null
      : null
    : null;
  stackCount?: number;
}) => {
  if (pickupKind !== "crystal") {
    return null;
  }

  const resolvedStackCount = Math.max(1, Math.floor(stackCount ?? 1));

  if (resolvedStackCount > 50) {
    return crystalPickupAccents.high;
  }

  if (resolvedStackCount > 10) {
    return crystalPickupAccents.mid;
  }

  return crystalPickupAccents.low;
};

export const resolveEntitySpriteSeparationCategory = <TCategory extends string>({
  entityRingsVisible,
  spriteSeparationCategory
}: {
  entityRingsVisible: boolean;
  spriteSeparationCategory: TCategory | null;
}) => (entityRingsVisible ? spriteSeparationCategory : null);

export const shouldRenderSpriteBackedEntityRing = ({
  entityRingsVisible,
  spriteBacked
}: {
  entityRingsVisible: boolean;
  spriteBacked: boolean;
}) => entityRingsVisible && spriteBacked;
