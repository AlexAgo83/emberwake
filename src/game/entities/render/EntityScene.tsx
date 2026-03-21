import { extend } from "@pixi/react";
import { Graphics, Text } from "pixi.js";

import { WorldViewportContainer, type CameraState } from "@engine-pixi";
import type { EmberwakeRenderSurfaceMode } from "@game";
import type { PresentedEntity } from "../model/entityContract";
import type { SimulatedEntity } from "../model/entitySimulation";

extend({
  Graphics,
  Text
});

type EntitySceneProps = {
  camera: CameraState;
  currentTick: number;
  entities: Array<PresentedEntity<SimulatedEntity>>;
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

const drawEntity =
  (entity: PresentedEntity<SimulatedEntity>, currentTick: number) => (graphics: Graphics) => {
  const tint = hexColorToNumber(entity.visual.tint);
  const isSelected = entity.isSelected;
  const orientationLength = entity.footprint.radius + 16;
  const automaticAttack = entity.automaticAttack;

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
    graphics.setFillStyle({ alpha: 0.34, color: tint });
    graphics.circle(entity.worldPosition.x, entity.worldPosition.y, entity.footprint.radius);
    graphics.fill();
    graphics.setStrokeStyle({
      alpha: 0.92,
      color: 0xf6eee8,
      width: 2
    });
    graphics.circle(entity.worldPosition.x, entity.worldPosition.y, entity.footprint.radius);
    graphics.stroke();
    graphics.moveTo(entity.worldPosition.x - entity.footprint.radius * 0.55, entity.worldPosition.y);
    graphics.lineTo(entity.worldPosition.x + entity.footprint.radius * 0.55, entity.worldPosition.y);
    graphics.moveTo(entity.worldPosition.x, entity.worldPosition.y - entity.footprint.radius * 0.55);
    graphics.lineTo(entity.worldPosition.x, entity.worldPosition.y + entity.footprint.radius * 0.55);
    graphics.stroke();

    return;
  }

  graphics.setFillStyle({ alpha: isSelected ? 0.38 : 0.24, color: tint });
  graphics.circle(entity.worldPosition.x, entity.worldPosition.y, entity.footprint.radius);
  graphics.fill();

  graphics.setStrokeStyle({
    alpha: 0.95,
    color: isSelected ? 0xf6eee8 : tint,
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
};

export function EntityScene({
  camera,
  currentTick,
  entities,
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
    </WorldViewportContainer>
  );
}
