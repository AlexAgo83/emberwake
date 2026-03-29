import type { SimulatedEntity } from "../model/entitySimulation";

export const defaultEntityRingsVisible = true;

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
