import { resolveAssetUrl } from "./assetResolver";

export const entityDirectionalFacings = ["right", "left"] as const;

export type EntityDirectionalFacing = (typeof entityDirectionalFacings)[number];
export type EntityFacingMode = "lateral-mirror-left" | "single-rotating" | "static";

const fullTurnRadians = Math.PI * 2;
const strictVerticalOrientationEpsilon = 1e-6;

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

export const resolveFacingFromOrientation = (
  orientation: number,
  previousFacing: EntityDirectionalFacing = "right"
): EntityDirectionalFacing => {
  const normalized = normalizeAngle(orientation);

  if (
    Math.abs(normalized - Math.PI / 2) <= strictVerticalOrientationEpsilon ||
    Math.abs(normalized + Math.PI / 2) <= strictVerticalOrientationEpsilon
  ) {
    return previousFacing;
  }

  if (normalized > -Math.PI / 2 && normalized < Math.PI / 2) {
    return "right";
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
  previousFacing?: EntityDirectionalFacing;
  resolveAsset?: (candidateAssetId: string) => string | null;
};

export type ResolvedEntitySpritePresentation = {
  facing: EntityDirectionalFacing | null;
  mirrorX: boolean;
  resolvedAssetId: string;
  rotation: number;
  strategy:
    | "lateral-directional"
    | "lateral-mirrored-right"
    | "lateral-mirrored-base-right"
    | "lateral-base-right"
    | "fallback-rotating-base"
    | "single-rotating"
    | "static";
};

export const resolveEntitySpritePresentation = ({
  assetId,
  facingMode,
  orientation,
  previousFacing,
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

  const facing = resolveFacingFromOrientation(orientation, previousFacing);
  const directionalAssetId = deriveDirectionalAssetId(assetId, facing);

  if (resolveAsset(directionalAssetId)) {
    return {
      facing,
      mirrorX: false,
      resolvedAssetId: directionalAssetId,
      rotation: 0,
      strategy: "lateral-directional"
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
        strategy: "lateral-mirrored-right"
      };
    }

    if (resolveAsset(assetId)) {
      return {
        facing,
        mirrorX: true,
        resolvedAssetId: assetId,
        rotation: 0,
        strategy: "lateral-mirrored-base-right"
      };
    }
  }

  if (facing === "right" && resolveAsset(assetId)) {
    return {
      facing,
      mirrorX: false,
      resolvedAssetId: assetId,
      rotation: 0,
      strategy: "lateral-base-right"
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
