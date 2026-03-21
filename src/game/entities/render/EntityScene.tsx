import { extend } from "@pixi/react";
import { Graphics, Text } from "pixi.js";

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
  playerLevel: number;
  playerName: string;
  renderSurfaceMode: EmberwakeRenderSurfaceMode;
  viewport: {
    fitScale: number;
    screenSize: {
      height: number;
      width: number;
    };
  };
};

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

const playerIdentityTextStyle = {
  align: "center" as const,
  dropShadow: {
    alpha: 0.52,
    blur: 2,
    color: "#09070f",
    distance: 1
  },
  fill: "#f6eee8",
  fontFamily: "monospace",
  fontSize: 14,
  fontWeight: "700" as const,
  letterSpacing: 1
};

const isCombatant = (entity: PresentedEntity<SimulatedEntity>) =>
  entity.role === "player" || entity.role === "hostile";

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

const drawEntity =
  (entity: PresentedEntity<SimulatedEntity>, currentTick: number) => (graphics: Graphics) => {
  const tint = hexColorToNumber(entity.visual.tint);
  const isSelected = entity.isSelected;
  const orientationLength = entity.footprint.radius + 16;
  const automaticAttack = entity.automaticAttack;
  const recentDamageTick = entity.damageReactionState?.lastDamageTick ?? null;
  const hitReactionProgress =
    recentDamageTick === null
      ? 0
      : Math.max(
          0,
          1 -
            (currentTick - recentDamageTick) /
              entityCombatPresentationContract.hitReactionVisibleTicks
        );

  graphics.clear();

  if (
    entity.role === "player" &&
    automaticAttack &&
    automaticAttack.lastAttackTick !== null &&
    currentTick - automaticAttack.lastAttackTick <= automaticAttack.visibleTicks
  ) {
    const arcHalfRadians = automaticAttack.arcRadians / 2;

    graphics.setFillStyle({ alpha: 0.14, color: tint });
    graphics.moveTo(entity.worldPosition.x, entity.worldPosition.y);
    graphics.arc(
      entity.worldPosition.x,
      entity.worldPosition.y,
      automaticAttack.rangeWorldUnits,
      entity.orientation - arcHalfRadians,
      entity.orientation + arcHalfRadians
    );
    graphics.lineTo(entity.worldPosition.x, entity.worldPosition.y);
    graphics.fill();

    graphics.setStrokeStyle({
      alpha: 0.36,
      color: tint,
      width: 2
    });
    graphics.moveTo(entity.worldPosition.x, entity.worldPosition.y);
    graphics.arc(
      entity.worldPosition.x,
      entity.worldPosition.y,
      automaticAttack.rangeWorldUnits,
      entity.orientation - arcHalfRadians,
      entity.orientation + arcHalfRadians
    );
    graphics.lineTo(entity.worldPosition.x, entity.worldPosition.y);
    graphics.stroke();
  }

  if (entity.role === "pickup") {
    const pickupRadius = entity.footprint.radius;

    graphics.setFillStyle({ alpha: 0.34, color: tint });

    if (entity.pickupProfile?.kind === "crystal") {
      graphics.moveTo(entity.worldPosition.x, entity.worldPosition.y - pickupRadius);
      graphics.lineTo(entity.worldPosition.x + pickupRadius * 0.72, entity.worldPosition.y);
      graphics.lineTo(entity.worldPosition.x, entity.worldPosition.y + pickupRadius);
      graphics.lineTo(entity.worldPosition.x - pickupRadius * 0.72, entity.worldPosition.y);
      graphics.closePath();
      graphics.fill();
      graphics.setStrokeStyle({
        alpha: 0.92,
        color: 0xf6eee8,
        width: 2
      });
      graphics.moveTo(entity.worldPosition.x, entity.worldPosition.y - pickupRadius);
      graphics.lineTo(entity.worldPosition.x + pickupRadius * 0.72, entity.worldPosition.y);
      graphics.lineTo(entity.worldPosition.x, entity.worldPosition.y + pickupRadius);
      graphics.lineTo(entity.worldPosition.x - pickupRadius * 0.72, entity.worldPosition.y);
      graphics.closePath();
      graphics.stroke();
      graphics.moveTo(entity.worldPosition.x, entity.worldPosition.y - pickupRadius * 0.38);
      graphics.lineTo(entity.worldPosition.x, entity.worldPosition.y + pickupRadius * 0.38);
      graphics.moveTo(entity.worldPosition.x - pickupRadius * 0.26, entity.worldPosition.y);
      graphics.lineTo(entity.worldPosition.x + pickupRadius * 0.26, entity.worldPosition.y);
      graphics.stroke();

      return;
    }

    graphics.circle(entity.worldPosition.x, entity.worldPosition.y, pickupRadius);
    graphics.fill();
    graphics.setStrokeStyle({
      alpha: 0.92,
      color: 0xf6eee8,
      width: 2
    });
    graphics.circle(entity.worldPosition.x, entity.worldPosition.y, pickupRadius);
    graphics.stroke();
    graphics.moveTo(entity.worldPosition.x - pickupRadius * 0.55, entity.worldPosition.y);
    graphics.lineTo(entity.worldPosition.x + pickupRadius * 0.55, entity.worldPosition.y);
    graphics.moveTo(entity.worldPosition.x, entity.worldPosition.y - pickupRadius * 0.55);
    graphics.lineTo(entity.worldPosition.x, entity.worldPosition.y + pickupRadius * 0.55);
    graphics.stroke();

    return;
  }

  if (hitReactionProgress > 0) {
    graphics.setFillStyle({
      alpha: 0.12 + hitReactionProgress * 0.18,
      color: 0xf6eee8
    });
    graphics.circle(
      entity.worldPosition.x,
      entity.worldPosition.y,
      entity.footprint.radius + 6 + hitReactionProgress * 6
    );
    graphics.fill();
  }

  graphics.setFillStyle({
    alpha: isSelected ? 0.38 : hitReactionProgress > 0 ? 0.34 : 0.24,
    color: hitReactionProgress > 0 ? 0xfff1dc : tint
  });
  graphics.circle(entity.worldPosition.x, entity.worldPosition.y, entity.footprint.radius);
  graphics.fill();

  graphics.setStrokeStyle({
    alpha: 0.95,
    color: hitReactionProgress > 0 ? 0xfff1dc : isSelected ? 0xf6eee8 : tint,
    width: isSelected ? 5 : 3
  });
  graphics.circle(entity.worldPosition.x, entity.worldPosition.y, entity.footprint.radius);
  graphics.stroke();

  graphics.moveTo(entity.worldPosition.x, entity.worldPosition.y);
  graphics.lineTo(
    entity.worldPosition.x + Math.cos(entity.orientation) * orientationLength,
    entity.worldPosition.y + Math.sin(entity.orientation) * orientationLength
  );
  graphics.stroke();

  if (!isCombatant(entity) || entity.combat.maxHealth <= 0) {
    return;
  }

  const barWidth = Math.max(36, entity.footprint.radius * 2.35);
  const barHeight = 5;
  const barRadius = 2;
  const healthRatio = Math.max(0, entity.combat.currentHealth / entity.combat.maxHealth);
  const attackChargeProgress = getAttackChargeProgress(entity, currentTick);
  const baseX = entity.worldPosition.x - barWidth / 2;
  const healthBarY = entity.worldPosition.y - entity.footprint.radius - 18;
  const chargeBarY = healthBarY + 7;
  const healthColor = entity.role === "player" ? 0x7dff9b : 0xff7a88;
  const chargeColor = entity.role === "player" ? 0x5ce5ff : 0xffd76c;

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

export function EntityScene({
  camera,
  currentTick,
  entities,
  floatingDamageNumbers,
  playerLevel,
  playerName,
  renderSurfaceMode,
  viewport
}: EntitySceneProps) {
  const scale = viewport.fitScale * camera.zoom;
  const debugLabelsVisible = renderSurfaceMode === "diagnostics";

  return (
    <WorldViewportContainer camera={camera} viewport={viewport}>
      {entities.map((entity) => (
        <pixiContainer key={entity.id}>
          <pixiGraphics draw={drawEntity(entity, currentTick)} />
          {entity.role === "player" ? (
            <pixiText
              anchor={0.5}
              eventMode="none"
              resolution={2}
              scale={1 / scale}
              style={playerIdentityTextStyle}
              text={`${playerName} · Lv ${playerLevel}`}
              x={entity.worldPosition.x}
              y={entity.worldPosition.y - entity.footprint.radius - 38}
            />
          ) : null}
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
              x={entity.worldPosition.x}
              y={entity.worldPosition.y - entity.footprint.radius - 20}
            />
          ) : null}
        </pixiContainer>
      ))}
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
