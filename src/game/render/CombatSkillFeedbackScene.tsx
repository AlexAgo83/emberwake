import { extend } from "@pixi/react";
import { Graphics } from "pixi.js";
import { memo, useMemo } from "react";

import { WorldViewportContainer, type CameraState } from "@engine-pixi";
import type { ActiveWeaponId, CombatSkillFeedbackEvent, FusionId } from "@game";

extend({
  Graphics
});

type CombatSkillFeedbackSceneProps = {
  camera: CameraState;
  combatSkillFeedbackEvents: CombatSkillFeedbackEvent[];
  currentTick: number;
  viewport: {
    fitScale: number;
    screenSize: {
      height: number;
      width: number;
    };
  };
};

const averageWorldPoint = (targetWorldPoints: readonly CombatSkillFeedbackEvent["targetWorldPoints"][number][]) => {
  if (targetWorldPoints.length === 0) {
    return { x: 0, y: 0 };
  }

  const total = targetWorldPoints.reduce(
    (accumulator, worldPoint) => ({
      x: accumulator.x + worldPoint.x,
      y: accumulator.y + worldPoint.y
    }),
    { x: 0, y: 0 }
  );

  return {
    x: total.x / targetWorldPoints.length,
    y: total.y / targetWorldPoints.length
  };
};

const resolveWeaponPalette = (weaponId: ActiveWeaponId, fusionId: FusionId | null) => {
  const basePalette =
    weaponId === "ash-lash"
      ? { core: 0xffb768, glow: 0xff8a4b }
      : weaponId === "boomerang-arc"
        ? { core: 0xffd68f, glow: 0xffa65e }
        : weaponId === "burning-trail"
          ? { core: 0xff9a5f, glow: 0xff5a3f }
          : weaponId === "chain-lightning"
            ? { core: 0xb7f8ff, glow: 0x74e7ff }
      : weaponId === "guided-senbon"
        ? { core: 0x8be7ff, glow: 0x5ce5ff }
        : weaponId === "halo-burst"
          ? { core: 0xfff1a2, glow: 0xffd067 }
          : weaponId === "frost-nova"
            ? { core: 0xd2f6ff, glow: 0x8cdcff }
        : weaponId === "shade-kunai"
          ? { core: 0xe6e2ff, glow: 0x9bb1ba }
          : weaponId === "cinder-arc"
            ? { core: 0xffa45e, glow: 0xff7a63 }
            : weaponId === "orbiting-blades"
              ? { core: 0xd8fbff, glow: 0x88e1ff }
            : weaponId === "orbit-sutra"
              ? { core: 0xc4f3ff, glow: 0x73d8ff }
              : weaponId === "vacuum-pulse"
                ? { core: 0xf2d6ff, glow: 0xc290ff }
                : { core: 0xb5cbd6, glow: 0x9ae5ff };

  if (fusionId === null) {
    return basePalette;
  }

  return {
    core: basePalette.core,
    glow:
      fusionId === "afterimage-pyre"
        ? 0xffd1a8
        : fusionId === "redline-ribbon"
        ? 0xffd58f
        : fusionId === "choir-of-pins"
          ? 0xd8fbff
          : fusionId === "blackfile-volley"
            ? 0xf2ddff
            : fusionId === "event-horizon"
              ? 0xe7c8ff
            : 0xb9f4ff
  };
};

const drawCombatSkillFeedback =
  ({
    combatSkillFeedbackEvent,
    currentTick
  }: {
    combatSkillFeedbackEvent: CombatSkillFeedbackEvent;
    currentTick: number;
  }) =>
  (graphics: Graphics) => {
    const ageTicks = Math.max(0, currentTick - combatSkillFeedbackEvent.spawnedAtTick);
    const progress = Math.min(1, ageTicks / combatSkillFeedbackEvent.durationTicks);
    const alpha = Math.max(0, 1 - progress);
    const { core, glow } = resolveWeaponPalette(
      combatSkillFeedbackEvent.weaponId,
      combatSkillFeedbackEvent.fusionId
    );
    const centerWorldPoint =
      combatSkillFeedbackEvent.targetWorldPoints.length > 0
        ? averageWorldPoint(combatSkillFeedbackEvent.targetWorldPoints)
        : combatSkillFeedbackEvent.originWorldPoint;
    const radius = combatSkillFeedbackEvent.radiusWorldUnits ?? 48;
    const orientation = combatSkillFeedbackEvent.orientationRadians ?? 0;
    const arcHalf = (combatSkillFeedbackEvent.arcRadians ?? Math.PI / 2) / 2;
    const fusionIntensity = combatSkillFeedbackEvent.fusionId === null ? 0 : 1;

    graphics.clear();

    switch (combatSkillFeedbackEvent.kind) {
      case "slash-ribbon": {
        const sweepRadius = radius * (0.54 + progress * 0.1);
        const startAngle = orientation - arcHalf;
        const endAngle = orientation + arcHalf;

        graphics.setStrokeStyle({
          alpha: 0.34 * alpha,
          color: glow,
          width: 10 + fusionIntensity * 2
        });
        graphics.arc(
          combatSkillFeedbackEvent.originWorldPoint.x,
          combatSkillFeedbackEvent.originWorldPoint.y,
          sweepRadius,
          startAngle,
          endAngle
        );
        graphics.stroke();

        graphics.setStrokeStyle({
          alpha: 0.88 * alpha,
          color: core,
          width: 4 + fusionIntensity
        });
        graphics.arc(
          combatSkillFeedbackEvent.originWorldPoint.x,
          combatSkillFeedbackEvent.originWorldPoint.y,
          sweepRadius,
          startAngle,
          endAngle
        );
        graphics.stroke();

        if (fusionIntensity > 0) {
          graphics.setStrokeStyle({
            alpha: 0.4 * alpha,
            color: 0xfff0c5,
            width: 2
          });
          graphics.arc(
            combatSkillFeedbackEvent.originWorldPoint.x,
            combatSkillFeedbackEvent.originWorldPoint.y,
            sweepRadius + 10,
            startAngle + 0.06,
            endAngle - 0.06
          );
          graphics.stroke();
        }
        break;
      }
      case "needle-trace":
      case "kunai-fan": {
        const lineWidth =
          combatSkillFeedbackEvent.kind === "needle-trace" ? 2 + fusionIntensity : 3.6 + fusionIntensity;
        for (const targetWorldPoint of combatSkillFeedbackEvent.targetWorldPoints) {
          graphics.setStrokeStyle({
            alpha: 0.28 * alpha,
            color: glow,
            width: lineWidth + 3
          });
          graphics.moveTo(
            combatSkillFeedbackEvent.originWorldPoint.x,
            combatSkillFeedbackEvent.originWorldPoint.y
          );
          graphics.lineTo(targetWorldPoint.x, targetWorldPoint.y);
          graphics.stroke();

          graphics.setStrokeStyle({
            alpha: 0.9 * alpha,
            color: core,
            width: lineWidth
          });
          graphics.moveTo(
            combatSkillFeedbackEvent.originWorldPoint.x,
            combatSkillFeedbackEvent.originWorldPoint.y
          );
          graphics.lineTo(targetWorldPoint.x, targetWorldPoint.y);
          graphics.stroke();

          if (combatSkillFeedbackEvent.kind === "needle-trace") {
            graphics.setStrokeStyle({
              alpha: 0.82 * alpha,
              color: core,
              width: 2
            });
            graphics.rect(
              targetWorldPoint.x - (6 + fusionIntensity),
              targetWorldPoint.y - (6 + fusionIntensity),
              12 + fusionIntensity * 2,
              12 + fusionIntensity * 2
            );
            graphics.stroke();
          } else {
            const deltaX = targetWorldPoint.x - combatSkillFeedbackEvent.originWorldPoint.x;
            const deltaY = targetWorldPoint.y - combatSkillFeedbackEvent.originWorldPoint.y;
            const bladeAngle = Math.atan2(deltaY, deltaX);
            const bladeLength = 14 + fusionIntensity * 3;
            const bladeWidth = 6 + fusionIntensity * 2;

            graphics.setFillStyle({
              alpha: 0.82 * alpha,
              color: core
            });
            graphics.moveTo(
              targetWorldPoint.x + Math.cos(bladeAngle) * bladeLength,
              targetWorldPoint.y + Math.sin(bladeAngle) * bladeLength
            );
            graphics.lineTo(
              targetWorldPoint.x + Math.cos(bladeAngle + Math.PI * 0.72) * bladeWidth,
              targetWorldPoint.y + Math.sin(bladeAngle + Math.PI * 0.72) * bladeWidth
            );
            graphics.lineTo(
              targetWorldPoint.x + Math.cos(bladeAngle - Math.PI * 0.72) * bladeWidth,
              targetWorldPoint.y + Math.sin(bladeAngle - Math.PI * 0.72) * bladeWidth
            );
            graphics.closePath();
            graphics.fill();
          }
        }
        break;
      }
      case "watchglass-laser": {
        const targetWorldPoint =
          combatSkillFeedbackEvent.targetWorldPoints[0] ?? centerWorldPoint;

        graphics.setStrokeStyle({
          alpha: 0.26 * alpha,
          color: 0xff5a55,
          width: 20
        });
        graphics.moveTo(
          combatSkillFeedbackEvent.originWorldPoint.x,
          combatSkillFeedbackEvent.originWorldPoint.y
        );
        graphics.lineTo(targetWorldPoint.x, targetWorldPoint.y);
        graphics.stroke();

        graphics.setStrokeStyle({
          alpha: 0.92 * alpha,
          color: 0xffd2c8,
          width: 6
        });
        graphics.moveTo(
          combatSkillFeedbackEvent.originWorldPoint.x,
          combatSkillFeedbackEvent.originWorldPoint.y
        );
        graphics.lineTo(targetWorldPoint.x, targetWorldPoint.y);
        graphics.stroke();
        break;
      }
      case "chain-arc":
      case "boomerang-arc": {
        const strokeWidth =
          combatSkillFeedbackEvent.kind === "chain-arc"
            ? 2.6 + fusionIntensity
            : 4 + fusionIntensity;

        for (const targetWorldPoint of combatSkillFeedbackEvent.targetWorldPoints) {
          graphics.setStrokeStyle({
            alpha: 0.28 * alpha,
            color: glow,
            width: strokeWidth + 4
          });
          graphics.moveTo(
            combatSkillFeedbackEvent.originWorldPoint.x,
            combatSkillFeedbackEvent.originWorldPoint.y
          );
          graphics.lineTo(targetWorldPoint.x, targetWorldPoint.y);
          graphics.stroke();

          graphics.setStrokeStyle({
            alpha: 0.88 * alpha,
            color: core,
            width: strokeWidth
          });
          graphics.moveTo(
            combatSkillFeedbackEvent.originWorldPoint.x,
            combatSkillFeedbackEvent.originWorldPoint.y
          );
          graphics.lineTo(targetWorldPoint.x, targetWorldPoint.y);
          graphics.stroke();
        }
        break;
      }
      case "cinder-travel": {
        const targetWorldPoint =
          combatSkillFeedbackEvent.targetWorldPoints[0] ?? combatSkillFeedbackEvent.originWorldPoint;
        const controlWorldPoint = {
          x: (combatSkillFeedbackEvent.originWorldPoint.x + targetWorldPoint.x) / 2,
          y:
            Math.min(combatSkillFeedbackEvent.originWorldPoint.y, targetWorldPoint.y) -
            radius * (0.18 + fusionIntensity * 0.04)
        };

        graphics.setStrokeStyle({
          alpha: 0.42 * alpha,
          color: glow,
          width: 4 + fusionIntensity
        });
        graphics.moveTo(
          combatSkillFeedbackEvent.originWorldPoint.x,
          combatSkillFeedbackEvent.originWorldPoint.y
        );
        graphics.quadraticCurveTo(
          controlWorldPoint.x,
          controlWorldPoint.y,
          targetWorldPoint.x,
          targetWorldPoint.y
        );
        graphics.stroke();

        graphics.setStrokeStyle({
          alpha: 0.76 * alpha,
          color: core,
          width: 2 + fusionIntensity
        });
        graphics.circle(targetWorldPoint.x, targetWorldPoint.y, 10 + fusionIntensity * 2);
        graphics.stroke();
        break;
      }
      case "cinder-burst": {
        const burstRadius = radius * (0.38 + progress * 0.52);
        graphics.setFillStyle({ alpha: 0.12 * alpha, color: glow });
        graphics.circle(centerWorldPoint.x, centerWorldPoint.y, burstRadius);
        graphics.fill();

        graphics.setStrokeStyle({
          alpha: 0.86 * alpha,
          color: core,
          width: 3 + fusionIntensity
        });
        graphics.circle(centerWorldPoint.x, centerWorldPoint.y, burstRadius);
        graphics.stroke();
        graphics.circle(centerWorldPoint.x, centerWorldPoint.y, burstRadius * 0.54);
        graphics.stroke();

        const spokeCount = 4 + fusionIntensity * 2;
        for (let spokeIndex = 0; spokeIndex < spokeCount; spokeIndex += 1) {
          const spokeAngle = (Math.PI * 2 * spokeIndex) / spokeCount + progress * 0.18;
          const innerRadius = burstRadius * 0.34;
          const outerRadius = burstRadius * 1.08;
          graphics.moveTo(
            centerWorldPoint.x + Math.cos(spokeAngle) * innerRadius,
            centerWorldPoint.y + Math.sin(spokeAngle) * innerRadius
          );
          graphics.lineTo(
            centerWorldPoint.x + Math.cos(spokeAngle) * outerRadius,
            centerWorldPoint.y + Math.sin(spokeAngle) * outerRadius
          );
          graphics.stroke();
        }
        break;
      }
      case "trail-burn": {
        const trailEndPoint =
          combatSkillFeedbackEvent.targetWorldPoints[0] ?? combatSkillFeedbackEvent.originWorldPoint;
        graphics.setStrokeStyle({
          alpha: 0.34 * alpha,
          color: glow,
          width: Math.max(8, radius * 0.28)
        });
        graphics.moveTo(
          combatSkillFeedbackEvent.originWorldPoint.x,
          combatSkillFeedbackEvent.originWorldPoint.y
        );
        graphics.lineTo(trailEndPoint.x, trailEndPoint.y);
        graphics.stroke();
        graphics.setStrokeStyle({
          alpha: 0.84 * alpha,
          color: core,
          width: Math.max(3, radius * 0.11)
        });
        graphics.moveTo(
          combatSkillFeedbackEvent.originWorldPoint.x,
          combatSkillFeedbackEvent.originWorldPoint.y
        );
        graphics.lineTo(trailEndPoint.x, trailEndPoint.y);
        graphics.stroke();
        break;
      }
      case "halo-burst":
      case "frost-nova":
      case "vacuum-pulse": {
        const burstRadius = radius * (0.32 + progress * 0.58);
        graphics.setFillStyle({ alpha: 0.12 * alpha, color: glow });
        graphics.circle(
          combatSkillFeedbackEvent.originWorldPoint.x,
          combatSkillFeedbackEvent.originWorldPoint.y,
          burstRadius
        );
        graphics.fill();
        graphics.setStrokeStyle({
          alpha: 0.88 * alpha,
          color: core,
          width: 3 + fusionIntensity
        });
        graphics.circle(
          combatSkillFeedbackEvent.originWorldPoint.x,
          combatSkillFeedbackEvent.originWorldPoint.y,
          burstRadius
        );
        graphics.stroke();

        if (combatSkillFeedbackEvent.kind !== "vacuum-pulse") {
          graphics.circle(
            combatSkillFeedbackEvent.originWorldPoint.x,
            combatSkillFeedbackEvent.originWorldPoint.y,
            burstRadius * 0.6
          );
          graphics.stroke();
        }
        break;
      }
      case "orbit-pulse": {
        const orbitRadius = radius * (0.88 + progress * 0.1);
        graphics.setStrokeStyle({
          alpha: 0.28 * alpha,
          color: glow,
          width: 10 + fusionIntensity * 2
        });
        graphics.circle(
          combatSkillFeedbackEvent.originWorldPoint.x,
          combatSkillFeedbackEvent.originWorldPoint.y,
          orbitRadius
        );
        graphics.stroke();

        graphics.setStrokeStyle({
          alpha: 0.9 * alpha,
          color: core,
          width: 3 + fusionIntensity
        });
        graphics.circle(
          combatSkillFeedbackEvent.originWorldPoint.x,
          combatSkillFeedbackEvent.originWorldPoint.y,
          orbitRadius
        );
        graphics.stroke();

        for (let markerIndex = 0; markerIndex < 3 + fusionIntensity; markerIndex += 1) {
          const markerAngle =
            progress * Math.PI * 2 + (Math.PI * 2 * markerIndex) / (3 + fusionIntensity);
          graphics.setFillStyle({
            alpha: 0.65 * alpha,
            color: core
          });
          graphics.circle(
            combatSkillFeedbackEvent.originWorldPoint.x + Math.cos(markerAngle) * orbitRadius,
            combatSkillFeedbackEvent.originWorldPoint.y + Math.sin(markerAngle) * orbitRadius,
            5 + fusionIntensity
          );
          graphics.fill();
        }

        if (fusionIntensity > 0) {
          graphics.circle(
            combatSkillFeedbackEvent.originWorldPoint.x,
            combatSkillFeedbackEvent.originWorldPoint.y,
            orbitRadius + 16
          );
          graphics.stroke();
        }
        break;
      }
      case "zone-seal": {
        const sealRadius = radius;
        graphics.setFillStyle({ alpha: 0.08 * alpha, color: glow });
        graphics.circle(centerWorldPoint.x, centerWorldPoint.y, sealRadius);
        graphics.fill();
        graphics.setStrokeStyle({
          alpha: 0.84 * alpha,
          color: core,
          width: 3 + fusionIntensity
        });
        graphics.circle(centerWorldPoint.x, centerWorldPoint.y, sealRadius);
        graphics.stroke();
        graphics.moveTo(centerWorldPoint.x - sealRadius * 0.72, centerWorldPoint.y);
        graphics.lineTo(centerWorldPoint.x + sealRadius * 0.72, centerWorldPoint.y);
        graphics.moveTo(centerWorldPoint.x, centerWorldPoint.y - sealRadius * 0.72);
        graphics.lineTo(centerWorldPoint.x, centerWorldPoint.y + sealRadius * 0.72);
        graphics.moveTo(
          centerWorldPoint.x - sealRadius * 0.44,
          centerWorldPoint.y - sealRadius * 0.44
        );
        graphics.lineTo(
          centerWorldPoint.x + sealRadius * 0.44,
          centerWorldPoint.y + sealRadius * 0.44
        );
        graphics.moveTo(
          centerWorldPoint.x + sealRadius * 0.44,
          centerWorldPoint.y - sealRadius * 0.44
        );
        graphics.lineTo(
          centerWorldPoint.x - sealRadius * 0.44,
          centerWorldPoint.y + sealRadius * 0.44
        );
        graphics.stroke();

        if (fusionIntensity > 0) {
          graphics.circle(centerWorldPoint.x, centerWorldPoint.y, sealRadius * 0.62);
          graphics.stroke();
        }
        break;
      }
    }
  };

const CombatSkillFeedbackGraphic = memo(function CombatSkillFeedbackGraphic({
  combatSkillFeedbackEvent,
  currentTick
}: {
  combatSkillFeedbackEvent: CombatSkillFeedbackEvent;
  currentTick: number;
}) {
  const draw = useMemo(
    () => drawCombatSkillFeedback({ combatSkillFeedbackEvent, currentTick }),
    [combatSkillFeedbackEvent, currentTick]
  );

  return <pixiGraphics draw={draw} />;
});

export function CombatSkillFeedbackScene({
  camera,
  combatSkillFeedbackEvents,
  currentTick,
  viewport
}: CombatSkillFeedbackSceneProps) {
  return (
    <WorldViewportContainer camera={camera} viewport={viewport}>
      {combatSkillFeedbackEvents.map((combatSkillFeedbackEvent) => (
        <CombatSkillFeedbackGraphic
          combatSkillFeedbackEvent={combatSkillFeedbackEvent}
          currentTick={currentTick}
          key={combatSkillFeedbackEvent.id}
        />
      ))}
    </WorldViewportContainer>
  );
}
