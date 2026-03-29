import { extend } from "@pixi/react";
import { Graphics, Sprite, Text } from "pixi.js";
import { memo, useEffect, useMemo, useRef } from "react";

import { WorldViewportContainer, type CameraState } from "@engine-pixi";
import { entityVisualDefinitions, type EmberwakeRenderSurfaceMode } from "@game";
import { resolveAssetUrl } from "@src/assets/assetResolver";
import { resolveEntitySpritePresentation } from "@src/assets/entityDirectionalRuntime";
import { useResolvedAssetTexture } from "@src/assets/useResolvedAssetTexture";
import { assetPipeline } from "@src/shared/config/assetPipeline";
import {
  entityCombatPresentationContract,
  type FloatingDamageNumber,
  type SimulatedEntity
} from "../model/entitySimulation";
import {
  resolveEntitySpriteSeparationCategory,
  resolvePickupSpriteAccent,
  resolvePickupSpriteSizeWorldUnits,
  shouldRenderSpriteBackedEntityRing
} from "./entityPresentation";

extend({
  Graphics,
  Sprite,
  Text
});

type EntitySceneProps = {
  camera: CameraState;
  currentTick: number;
  entityRingsVisible: boolean;
  entities: SimulatedEntity[];
  floatingDamageNumbers: FloatingDamageNumber[];
  renderSurfaceMode: EmberwakeRenderSurfaceMode;
  selectedEntityId: string | null;
  viewport: {
    fitScale: number;
    screenSize: {
      height: number;
      width: number;
    };
  };
};

type PickupKind = SimulatedEntity["pickupProfile"] extends infer PickupProfile
  ? PickupProfile extends { kind: infer Kind }
    ? Kind
    : never
  : never;

type SpriteSeparationCategory = "hostile" | "pickup" | "player";

const hexColorToNumber = (color: string) => Number.parseInt(color.replace("#", ""), 16);

const floatingDamageTextStyle = {
  align: "center" as const,
  dropShadow: {
    alpha: 0.52,
    blur: 2,
    color: "#09070f",
    distance: 1
  },
  fill: "#fff1dc",
  fontFamily: "monospace",
  fontSize: 18,
  fontWeight: "700" as const,
  letterSpacing: 1
};

const spriteSeparationOffsets = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-0.78, -0.78],
  [0.78, -0.78],
  [-0.78, 0.78],
  [0.78, 0.78]
] as const;

const spriteSeparationStyles: Record<
  SpriteSeparationCategory,
  {
    haloAlpha: number;
    haloScale: number;
    offsetWorldUnits: number;
    tint: number;
    tintAlpha: number;
  }
> = {
  hostile: {
    haloAlpha: 0.2,
    haloScale: 1.1,
    offsetWorldUnits: 5.4,
    tint: 0xffc3a5,
    tintAlpha: 0.28
  },
  pickup: {
    haloAlpha: 0.24,
    haloScale: 1.14,
    offsetWorldUnits: 4.2,
    tint: 0xf7f2dc,
    tintAlpha: 0.34
  },
  player: {
    haloAlpha: 0.24,
    haloScale: 1.12,
    offsetWorldUnits: 6.2,
    tint: 0xe8f3ff,
    tintAlpha: 0.32
  }
};

const getAttackChargeProgress = (
  entity: SimulatedEntity,
  currentTick: number
) => {
  if (entity.role === "player" && entity.automaticAttack) {
    if (entity.automaticAttack.lastAttackTick === null) {
      return 1;
    }

    return Math.min(
      1,
      Math.max(
        0,
        (currentTick - entity.automaticAttack.lastAttackTick) / entity.automaticAttack.cooldownTicks
      )
    );
  }

  if (entity.role === "hostile" && entity.contactDamageProfile) {
    if (entity.contactDamageProfile.lastDamageTick === null) {
      return 1;
    }

    return Math.min(
      1,
      Math.max(
        0,
        (currentTick - entity.contactDamageProfile.lastDamageTick) /
          entity.contactDamageProfile.cooldownTicks
      )
    );
  }

  return 0;
};

const drawPickupEntity =
  ({
    pickupKind,
    radius,
    tint
  }: {
    pickupKind: PickupKind | null;
    radius: number;
    tint: number;
  }) =>
  (graphics: Graphics) => {
    graphics.clear();
    graphics.setFillStyle({ alpha: 0.34, color: tint });

    if (pickupKind === "crystal") {
      graphics.moveTo(0, -radius);
      graphics.lineTo(radius * 0.72, 0);
      graphics.lineTo(0, radius);
      graphics.lineTo(-radius * 0.72, 0);
      graphics.closePath();
      graphics.fill();
      graphics.setStrokeStyle({
        alpha: 0.92,
        color: 0xf6eee8,
        width: 2
      });
      graphics.moveTo(0, -radius);
      graphics.lineTo(radius * 0.72, 0);
      graphics.lineTo(0, radius);
      graphics.lineTo(-radius * 0.72, 0);
      graphics.closePath();
      graphics.stroke();
      graphics.moveTo(0, -radius * 0.38);
      graphics.lineTo(0, radius * 0.38);
      graphics.moveTo(-radius * 0.26, 0);
      graphics.lineTo(radius * 0.26, 0);
      graphics.stroke();

      return;
    }

    if (pickupKind === "magnet") {
      graphics.circle(0, 0, radius);
      graphics.fill();
      graphics.setStrokeStyle({
        alpha: 0.92,
        color: 0xf6eee8,
        width: 2
      });
      graphics.circle(0, 0, radius);
      graphics.stroke();
      graphics.moveTo(-radius * 0.55, -radius * 0.1);
      graphics.lineTo(-radius * 0.12, -radius * 0.1);
      graphics.lineTo(-radius * 0.12, radius * 0.52);
      graphics.moveTo(radius * 0.55, -radius * 0.1);
      graphics.lineTo(radius * 0.12, -radius * 0.1);
      graphics.lineTo(radius * 0.12, radius * 0.52);
      graphics.stroke();

      return;
    }

    if (pickupKind === "hourglass") {
      graphics.circle(0, 0, radius);
      graphics.fill();
      graphics.setStrokeStyle({
        alpha: 0.92,
        color: 0xf6eee8,
        width: 2
      });
      graphics.circle(0, 0, radius);
      graphics.stroke();
      graphics.moveTo(-radius * 0.34, -radius * 0.52);
      graphics.lineTo(radius * 0.34, -radius * 0.52);
      graphics.moveTo(-radius * 0.34, radius * 0.52);
      graphics.lineTo(radius * 0.34, radius * 0.52);
      graphics.moveTo(-radius * 0.34, -radius * 0.52);
      graphics.lineTo(radius * 0.22, -radius * 0.08);
      graphics.lineTo(-radius * 0.22, radius * 0.08);
      graphics.lineTo(radius * 0.34, radius * 0.52);
      graphics.stroke();

      return;
    }

    graphics.circle(0, 0, radius);
    graphics.fill();
    graphics.setStrokeStyle({
      alpha: 0.92,
      color: 0xf6eee8,
      width: 2
    });
    graphics.circle(0, 0, radius);
    graphics.stroke();
    graphics.moveTo(-radius * 0.55, 0);
    graphics.lineTo(radius * 0.55, 0);
    graphics.moveTo(0, -radius * 0.55);
    graphics.lineTo(0, radius * 0.55);
    graphics.stroke();
  };

const drawCombatEntity =
  ({
    attackArcRadians,
    attackRangeWorldUnits,
    hitReactionProgress,
    isSelected,
    radius,
    spriteRingVisible,
    spriteBacked,
    tint
  }: {
    attackArcRadians: number | null;
    attackRangeWorldUnits: number | null;
    hitReactionProgress: number;
    isSelected: boolean;
    radius: number;
    spriteRingVisible: boolean;
    spriteBacked: boolean;
    tint: number;
  }) =>
  (graphics: Graphics) => {
    const orientationLength = radius + 16;

    graphics.clear();

    if (attackArcRadians !== null && attackRangeWorldUnits !== null) {
      const arcHalfRadians = attackArcRadians / 2;

      graphics.setFillStyle({ alpha: 0.14, color: tint });
      graphics.moveTo(0, 0);
      graphics.arc(0, 0, attackRangeWorldUnits, -arcHalfRadians, arcHalfRadians);
      graphics.lineTo(0, 0);
      graphics.fill();

      graphics.setStrokeStyle({
        alpha: 0.36,
        color: tint,
        width: 2
      });
      graphics.moveTo(0, 0);
      graphics.arc(0, 0, attackRangeWorldUnits, -arcHalfRadians, arcHalfRadians);
      graphics.lineTo(0, 0);
      graphics.stroke();
    }

    if (hitReactionProgress > 0) {
      graphics.setFillStyle({
        alpha: 0.12 + hitReactionProgress * 0.18,
        color: 0xf6eee8
      });
      graphics.circle(0, 0, radius + 6 + hitReactionProgress * 6);
      graphics.fill();
    }

    if (!spriteBacked) {
      graphics.setFillStyle({
        alpha: isSelected ? 0.38 : 0.24,
        color: tint
      });
      graphics.circle(0, 0, radius);
      graphics.fill();
    }

    if (spriteRingVisible || !spriteBacked) {
      graphics.setStrokeStyle({
        alpha: spriteBacked ? 0.82 : 0.95,
        color: isSelected ? 0xf6eee8 : tint,
        width: isSelected ? 5 : spriteBacked ? 2.5 : 3
      });
      graphics.circle(0, 0, spriteBacked ? radius + 2 : radius);
      graphics.stroke();
    }

    if (!spriteBacked) {
      graphics.moveTo(0, 0);
      graphics.lineTo(Math.cos(0) * orientationLength, Math.sin(0) * orientationLength);
      graphics.stroke();
    }
  };

const drawCombatEntityBars =
  ({
    attackChargeProgress,
    healthRatio,
    radius,
    role
  }: {
    attackChargeProgress: number;
    healthRatio: number;
    radius: number;
    role: SimulatedEntity["role"];
  }) =>
  (graphics: Graphics) => {
    const barWidth = Math.max(36, radius * 2.35);
    const barHeight = 5;
    const barRadius = 2;
    const healthBarY = -radius - 18;
    const chargeBarY = healthBarY + 7;
    const healthColor = role === "player" ? 0x7dff9b : 0xff7a88;
    const chargeColor = role === "player" ? 0x5ce5ff : 0xffd76c;
    const baseX = -barWidth / 2;

    graphics.clear();
    graphics.setFillStyle({ alpha: 0.82, color: 0x05070c });
    graphics.roundRect(baseX, healthBarY, barWidth, barHeight, barRadius);
    graphics.roundRect(baseX, chargeBarY, barWidth, barHeight, barRadius);
    graphics.fill();

    graphics.setFillStyle({ alpha: 0.94, color: healthColor });
    graphics.roundRect(baseX, healthBarY, barWidth * healthRatio, barHeight, barRadius);
    graphics.fill();

    graphics.setFillStyle({ alpha: 0.9, color: chargeColor });
    graphics.roundRect(baseX, chargeBarY, barWidth * attackChargeProgress, barHeight, barRadius);
    graphics.fill();

    graphics.setStrokeStyle({
      alpha: 0.55,
      color: 0xf6eee8,
      width: 1
    });
    graphics.roundRect(baseX, healthBarY, barWidth, barHeight, barRadius);
    graphics.roundRect(baseX, chargeBarY, barWidth, barHeight, barRadius);
    graphics.stroke();
  };

const PickupEntityGraphic = memo(function PickupEntityGraphic({
  pickupKind,
  radius,
  tint
}: {
  pickupKind: PickupKind | null;
  radius: number;
  tint: number;
}) {
  const draw = useMemo(() => drawPickupEntity({ pickupKind, radius, tint }), [pickupKind, radius, tint]);

  return <pixiGraphics draw={draw} />;
});

function CombatEntityGraphic({
  attackArcRadians,
  attackRangeWorldUnits,
  hitReactionProgress,
  isSelected,
  radius,
  spriteRingVisible,
  spriteBacked,
  tint
}: {
  attackArcRadians: number | null;
  attackRangeWorldUnits: number | null;
  hitReactionProgress: number;
  isSelected: boolean;
  radius: number;
  spriteRingVisible: boolean;
  spriteBacked: boolean;
  tint: number;
}) {
  const draw = useMemo(
    () =>
      drawCombatEntity({
        attackArcRadians,
        attackRangeWorldUnits,
        hitReactionProgress,
        isSelected,
        radius,
        spriteRingVisible,
        spriteBacked,
        tint
      }),
    [
      attackArcRadians,
      attackRangeWorldUnits,
      hitReactionProgress,
      isSelected,
      radius,
      spriteRingVisible,
      spriteBacked,
      tint
    ]
  );

  return <pixiGraphics draw={draw} />;
}

const CombatEntityBars = memo(function CombatEntityBars({
  attackChargeProgress,
  healthRatio,
  radius,
  role
}: {
  attackChargeProgress: number;
  healthRatio: number;
  radius: number;
  role: SimulatedEntity["role"];
}) {
  const draw = useMemo(
    () => drawCombatEntityBars({ attackChargeProgress, healthRatio, radius, role }),
    [attackChargeProgress, healthRatio, radius, role]
  );

  return <pixiGraphics draw={draw} />;
});

const EntitySprite = memo(function EntitySprite({
  alpha = 1,
  assetId,
  colorWashAlpha = 0,
  colorWashTint,
  mirrorX = false,
  rotation = 0,
  separationCategory = null,
  sizeWorldUnits,
  tint
}: {
  alpha?: number;
  assetId: string;
  colorWashAlpha?: number;
  colorWashTint?: number;
  mirrorX?: boolean;
  rotation?: number;
  separationCategory?: SpriteSeparationCategory | null;
  sizeWorldUnits: number;
  tint?: number;
}) {
  const { assetUrl, texture } = useResolvedAssetTexture(assetId);
  const separationStyle =
    separationCategory === null ? null : spriteSeparationStyles[separationCategory];
  const tintValue = assetUrl?.endsWith(".svg") ? tint : undefined;

  if (!texture) {
    return null;
  }

  return (
    <pixiContainer
      rotation={rotation}
      scale={{
        x: mirrorX ? -1 : 1,
        y: 1
      }}
    >
      {separationStyle
        ? spriteSeparationOffsets.map(([offsetX, offsetY], index) => (
            <pixiSprite
              key={`${assetId}-outline-${index}`}
              alpha={separationStyle.tintAlpha}
              anchor={0.5}
              blendMode="add"
              eventMode="none"
              height={sizeWorldUnits}
              texture={texture}
              tint={separationStyle.tint}
              width={sizeWorldUnits}
              x={offsetX * separationStyle.offsetWorldUnits}
              y={offsetY * separationStyle.offsetWorldUnits}
            />
          ))
        : null}
      {separationStyle ? (
        <pixiSprite
          alpha={separationStyle.haloAlpha}
          anchor={0.5}
          blendMode="add"
          eventMode="none"
          height={sizeWorldUnits * separationStyle.haloScale}
          texture={texture}
          tint={separationStyle.tint}
          width={sizeWorldUnits * separationStyle.haloScale}
          x={0}
          y={0}
        />
      ) : null}
      <pixiSprite
        alpha={alpha}
        anchor={0.5}
        eventMode="none"
        height={sizeWorldUnits}
        texture={texture}
        tint={tintValue}
        width={sizeWorldUnits}
        x={0}
        y={0}
      />
      {colorWashTint !== undefined && colorWashAlpha > 0 ? (
        <pixiSprite
          alpha={colorWashAlpha}
          anchor={0.5}
          blendMode="add"
          eventMode="none"
          height={sizeWorldUnits}
          texture={texture}
          tint={colorWashTint}
          width={sizeWorldUnits}
          x={0}
          y={0}
        />
      ) : null}
    </pixiContainer>
  );
});

export function EntityScene({
  camera,
  currentTick,
  entityRingsVisible,
  entities,
  floatingDamageNumbers,
  renderSurfaceMode,
  selectedEntityId,
  viewport
}: EntitySceneProps) {
  const scale = viewport.fitScale * camera.zoom;
  const debugLabelsVisible = renderSurfaceMode === "diagnostics";
  const lastLateralFacingByEntityRef = useRef<Map<string, "left" | "right">>(new Map());

  useEffect(() => {
    const activeEntityIds = new Set(entities.map((entity) => entity.id));

    for (const entityId of Array.from(lastLateralFacingByEntityRef.current.keys())) {
      if (!activeEntityIds.has(entityId)) {
        lastLateralFacingByEntityRef.current.delete(entityId);
      }
    }
  }, [entities]);

  return (
    <WorldViewportContainer camera={camera} viewport={viewport}>
      {entities.map((entity) => {
        const isSelected = entity.id === selectedEntityId;
        const tint = hexColorToNumber(entity.visual.tint);
        const pickupKind = entity.pickupProfile?.kind ?? null;
        const renderedRadius = entity.footprint.radius * (entity.visualScale ?? 1);
        const entityVisualDefinition = entityVisualDefinitions[entity.visual.kind];
        const previousFacing = lastLateralFacingByEntityRef.current.get(entity.id);
        const entitySpritePresentation = resolveEntitySpritePresentation({
          assetId: entityVisualDefinition.assetId,
          facingMode: entityVisualDefinition.runtimePresentation.facingMode,
          orientation: entity.orientation,
          previousFacing
        });

        if (entitySpritePresentation.facing !== null) {
          lastLateralFacingByEntityRef.current.set(entity.id, entitySpritePresentation.facing);
        }

        const entityAssetId = entitySpritePresentation.resolvedAssetId;
        const entityAssetUrl = resolveAssetUrl(entityAssetId);
        const entitySpriteSize =
          assetPipeline.logicalSizing.entity.spriteLogicalSizeWorldUnits * (entity.visualScale ?? 1);
        const pickupSpriteSize = resolvePickupSpriteSizeWorldUnits({
          pickupKind,
          renderedRadius,
          visualScale: entity.visualScale ?? 1
        });
        const pickupSpriteAccent = resolvePickupSpriteAccent({
          pickupKind,
          stackCount: entity.pickupProfile?.stackCount
        });
        const telegraphShakeOffset =
          entity.role === "hostile" && entity.hostileBehaviorState?.phase === "telegraph"
            ? {
                x: Math.sin(currentTick * 1.9 + renderedRadius) * 3,
                y: Math.cos(currentTick * 2.4 + renderedRadius) * 1.5
              }
            : { x: 0, y: 0 };
        const attackArcVisible =
          entity.role === "player" &&
          entity.automaticAttack &&
          entity.automaticAttack.lastAttackTick !== null &&
          currentTick - entity.automaticAttack.lastAttackTick <= entity.automaticAttack.visibleTicks;
        const hitReactionProgress =
          entity.damageReactionState?.lastDamageTick === null ||
          entity.damageReactionState?.lastDamageTick === undefined
            ? 0
            : Math.max(
                0,
                1 -
                  (currentTick - entity.damageReactionState.lastDamageTick) /
                    entityCombatPresentationContract.hitReactionVisibleTicks
              );

        return (
          <pixiContainer
            key={entity.id}
            x={entity.worldPosition.x + telegraphShakeOffset.x}
            y={entity.worldPosition.y + telegraphShakeOffset.y}
          >
            {entity.role === "pickup" ? (
              entityAssetUrl ? (
                <>
                  <EntitySprite
                    alpha={0.98}
                    assetId={entityAssetId}
                    mirrorX={entitySpritePresentation.mirrorX}
                    rotation={entitySpritePresentation.rotation}
                    separationCategory={resolveEntitySpriteSeparationCategory({
                      entityRingsVisible,
                      spriteSeparationCategory:
                        entityVisualDefinition.runtimePresentation.spriteSeparationCategory
                    })}
                    colorWashAlpha={pickupSpriteAccent?.colorWashAlpha ?? 0}
                    colorWashTint={pickupSpriteAccent?.colorWashTint}
                    sizeWorldUnits={
                      pickupSpriteSize * (pickupSpriteAccent?.scaleMultiplier ?? 1)
                    }
                    tint={tint}
                  />
                  {entityRingsVisible ? (
                    <pixiGraphics
                      draw={(graphics) => {
                        graphics.clear();
                        graphics.setStrokeStyle({
                          alpha: 0.18,
                          color: 0xf6eee8,
                          width: 1.5
                        });
                        graphics.circle(0, 0, renderedRadius + 4);
                        graphics.stroke();
                      }}
                    />
                  ) : null}
                </>
              ) : (
                <PickupEntityGraphic
                  pickupKind={pickupKind}
                  radius={renderedRadius}
                  tint={tint}
                />
              )
            ) : (
              <>
                <EntitySprite
                  assetId={entityAssetId}
                  mirrorX={entitySpritePresentation.mirrorX}
                  rotation={entitySpritePresentation.rotation}
                  separationCategory={resolveEntitySpriteSeparationCategory({
                    entityRingsVisible,
                    spriteSeparationCategory:
                      entityVisualDefinition.runtimePresentation.spriteSeparationCategory
                  })}
                  sizeWorldUnits={entitySpriteSize}
                  tint={tint}
                />
                <pixiContainer rotation={entity.orientation}>
                  <CombatEntityGraphic
                    attackArcRadians={attackArcVisible ? entity.automaticAttack?.arcRadians ?? null : null}
                    attackRangeWorldUnits={
                      attackArcVisible ? entity.automaticAttack?.rangeWorldUnits ?? null : null
                    }
                    hitReactionProgress={hitReactionProgress}
                    isSelected={isSelected}
                    radius={renderedRadius}
                    spriteRingVisible={shouldRenderSpriteBackedEntityRing({
                      entityRingsVisible,
                      spriteBacked: Boolean(entityAssetUrl)
                    })}
                    spriteBacked={Boolean(entityAssetUrl)}
                    tint={tint}
                  />
                </pixiContainer>
                <CombatEntityBars
                  attackChargeProgress={getAttackChargeProgress(entity, currentTick)}
                  healthRatio={
                    entity.combat.maxHealth > 0
                      ? Math.max(0, entity.combat.currentHealth / entity.combat.maxHealth)
                      : 0
                  }
                  radius={renderedRadius}
                  role={entity.role}
                />
              </>
            )}
            {debugLabelsVisible ? (
              <pixiText
                anchor={0.5}
                eventMode="none"
                resolution={2}
                scale={1 / scale}
                style={{
                  align: "center",
                  dropShadow: {
                    alpha: 0.55,
                    blur: 2,
                    color: "#09070f",
                    distance: 1
                  },
                  fill: isSelected ? "#f6eee8" : entity.visual.tint,
                  fontFamily: "monospace",
                  fontSize: 15,
                  fontWeight: "700",
                  letterSpacing: 1
                }}
                text={`${entity.id.split(":").at(-1)} · ${entity.state}${isSelected ? " · selected" : ""}`}
                x={0}
                y={-renderedRadius - 20}
              />
            ) : null}
          </pixiContainer>
        );
      })}
      {floatingDamageNumbers.map((floatingDamageNumber) => {
        const lifetimeProgress =
          (currentTick - floatingDamageNumber.spawnedAtTick) /
          entityCombatPresentationContract.floatingDamageNumberLifetimeTicks;

        if (!Number.isFinite(lifetimeProgress) || lifetimeProgress < 0 || lifetimeProgress >= 1) {
          return null;
        }

        return (
          <pixiText
            anchor={0.5}
            eventMode="none"
            key={floatingDamageNumber.id}
            resolution={2}
            scale={1 / scale}
            style={floatingDamageTextStyle}
            text={`${floatingDamageNumber.amount}`}
            x={floatingDamageNumber.worldPosition.x + floatingDamageNumber.driftX * lifetimeProgress}
            y={floatingDamageNumber.worldPosition.y - lifetimeProgress * 26}
            alpha={1 - lifetimeProgress}
          />
        );
      })}
    </WorldViewportContainer>
  );
}
