import { resolveAssetUrl } from "./assetResolver";

export const entityDirectionalFacings = ["right", "up", "left", "down"] as const;

export type EntityDirectionalFacing = (typeof entityDirectionalFacings)[number];
export type EntityFacingMode = "cardinal-mirror-left" | "single-rotating" | "static";

const fullTurnRadians = Math.PI * 2;

const normalizeAngle = (orientation: number) => {
  let normalized = orientation % fullTurnRadians;

  if (normalized <= -Math.PI) {
    normalized += fullTurnRadians;
  }

  if (normalized > Math.PI) {
    normalized -= fullTurnRadians;
  }

  return normalized;
};

export const resolveFacingFromOrientation = (orientation: number): EntityDirectionalFacing => {
  const normalized = normalizeAngle(orientation);

  if (normalized >= -Math.PI / 4 && normalized < Math.PI / 4) {
    return "right";
  }

  if (normalized >= Math.PI / 4 && normalized < (3 * Math.PI) / 4) {
    return "up";
  }

  if (normalized >= (-3 * Math.PI) / 4 && normalized < -Math.PI / 4) {
    return "down";
  }

  return "left";
};

export const deriveDirectionalAssetId = (
  assetId: string,
  facing: EntityDirectionalFacing
) => `${assetId}.${facing}`;

type ResolveEntitySpritePresentationArgs = {
  assetId: string;
  facingMode: EntityFacingMode;
  orientation: number;
  resolveAsset?: (candidateAssetId: string) => string | null;
};

export type ResolvedEntitySpritePresentation = {
  facing: EntityDirectionalFacing | null;
  mirrorX: boolean;
  resolvedAssetId: string;
  rotation: number;
  strategy:
    | "cardinal-directional"
    | "cardinal-mirrored-right"
    | "cardinal-base-right"
    | "fallback-rotating-base"
    | "single-rotating"
    | "static";
};

export const resolveEntitySpritePresentation = ({
  assetId,
  facingMode,
  orientation,
  resolveAsset = resolveAssetUrl
}: ResolveEntitySpritePresentationArgs): ResolvedEntitySpritePresentation => {
  if (facingMode === "static") {
    return {
      facing: null,
      mirrorX: false,
      resolvedAssetId: assetId,
      rotation: 0,
      strategy: "static"
    };
  }

  if (facingMode === "single-rotating") {
    return {
      facing: null,
      mirrorX: false,
      resolvedAssetId: assetId,
      rotation: orientation,
      strategy: "single-rotating"
    };
  }

  const facing = resolveFacingFromOrientation(orientation);
  const directionalAssetId = deriveDirectionalAssetId(assetId, facing);

  if (resolveAsset(directionalAssetId)) {
    return {
      facing,
      mirrorX: false,
      resolvedAssetId: directionalAssetId,
      rotation: 0,
      strategy: "cardinal-directional"
    };
  }

  if (facing === "left") {
    const rightDirectionalAssetId = deriveDirectionalAssetId(assetId, "right");

    if (resolveAsset(rightDirectionalAssetId)) {
      return {
        facing,
        mirrorX: true,
        resolvedAssetId: rightDirectionalAssetId,
        rotation: 0,
        strategy: "cardinal-mirrored-right"
      };
    }
  }

  if (facing === "right" && resolveAsset(assetId)) {
    return {
      facing,
      mirrorX: false,
      resolvedAssetId: assetId,
      rotation: 0,
      strategy: "cardinal-base-right"
    };
  }

  return {
    facing,
    mirrorX: false,
    resolvedAssetId: assetId,
    rotation: orientation,
    strategy: "fallback-rotating-base"
  };
};
