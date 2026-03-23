import { extend } from "@pixi/react";
import { Graphics, Text } from "pixi.js";
import { memo, useMemo } from "react";

import { WorldViewportContainer, type CameraState } from "@engine-pixi";
import type { EmberwakeRenderSurfaceMode } from "@game";
import type { PresentedEntity } from "../model/entityContract";
import {
  entityCombatPresentationContract,
  type FloatingDamageNumber,
  type SimulatedEntity
} from "../model/entitySimulation";

extend({
  Graphics,
  Text
});

type EntitySceneProps = {
  camera: CameraState;
  currentTick: number;
  entities: Array<PresentedEntity<SimulatedEntity>>;
  floatingDamageNumbers: FloatingDamageNumber[];
  renderSurfaceMode: EmberwakeRenderSurfaceMode;
  viewport: {
    fitScale: number;
    screenSize: {
      height: number;
      width: number;
    };
  };
};

type PickupKind = PresentedEntity<SimulatedEntity>["pickupProfile"] extends infer PickupProfile
  ? PickupProfile extends { kind: infer Kind }
    ? Kind
    : never
  : never;

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

const getAttackChargeProgress = (
  entity: PresentedEntity<SimulatedEntity>,
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
    tint
  }: {
    attackArcRadians: number | null;
    attackRangeWorldUnits: number | null;
    hitReactionProgress: number;
    isSelected: boolean;
    radius: number;
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

    graphics.setFillStyle({
      alpha: isSelected ? 0.38 : 0.24,
      color: tint
    });
    graphics.circle(0, 0, radius);
    graphics.fill();

    graphics.setStrokeStyle({
      alpha: 0.95,
      color: isSelected ? 0xf6eee8 : tint,
      width: isSelected ? 5 : 3
    });
    graphics.circle(0, 0, radius);
    graphics.stroke();

    graphics.moveTo(0, 0);
    graphics.lineTo(Math.cos(0) * orientationLength, Math.sin(0) * orientationLength);
    graphics.stroke();
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
    role: PresentedEntity<SimulatedEntity>["role"];
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
  tint
}: {
  attackArcRadians: number | null;
  attackRangeWorldUnits: number | null;
  hitReactionProgress: number;
  isSelected: boolean;
  radius: number;
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
        tint
      }),
    [
      attackArcRadians,
      attackRangeWorldUnits,
      hitReactionProgress,
      isSelected,
      radius,
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
  role: PresentedEntity<SimulatedEntity>["role"];
}) {
  const draw = useMemo(
    () => drawCombatEntityBars({ attackChargeProgress, healthRatio, radius, role }),
    [attackChargeProgress, healthRatio, radius, role]
  );

  return <pixiGraphics draw={draw} />;
});

export function EntityScene({
  camera,
  currentTick,
  entities,
  floatingDamageNumbers,
  renderSurfaceMode,
  viewport
}: EntitySceneProps) {
  const scale = viewport.fitScale * camera.zoom;
  const debugLabelsVisible = renderSurfaceMode === "diagnostics";

  return (
    <WorldViewportContainer camera={camera} viewport={viewport}>
      {entities.map((entity) => {
        const tint = hexColorToNumber(entity.visual.tint);
        const pickupKind = entity.pickupProfile?.kind ?? null;
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
            x={entity.worldPosition.x}
            y={entity.worldPosition.y}
          >
            {entity.role === "pickup" ? (
              <PickupEntityGraphic
                pickupKind={pickupKind}
                radius={entity.footprint.radius}
                tint={tint}
              />
            ) : (
              <>
                <pixiContainer rotation={entity.orientation}>
                  <CombatEntityGraphic
                    attackArcRadians={attackArcVisible ? entity.automaticAttack?.arcRadians ?? null : null}
                    attackRangeWorldUnits={
                      attackArcVisible ? entity.automaticAttack?.rangeWorldUnits ?? null : null
                    }
                    hitReactionProgress={hitReactionProgress}
                    isSelected={entity.isSelected}
                    radius={entity.footprint.radius}
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
                  radius={entity.footprint.radius}
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
                  fill: entity.isSelected ? "#f6eee8" : entity.visual.tint,
                  fontFamily: "monospace",
                  fontSize: 15,
                  fontWeight: "700",
                  letterSpacing: 1
                }}
                text={`${entity.id.split(":").at(-1)} · ${entity.state}${entity.isSelected ? " · selected" : ""}`}
                x={0}
                y={-entity.footprint.radius - 20}
              />
            ) : null}
          </pixiContainer>
        );
      })}
      {floatingDamageNumbers.map((floatingDamageNumber) => {
        const lifetimeProgress =
          (currentTick - floatingDamageNumber.spawnedAtTick) /
          entityCombatPresentationContract.floatingDamageNumberLifetimeTicks;

        if (lifetimeProgress >= 1) {
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
