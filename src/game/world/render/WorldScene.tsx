import { extend } from "@pixi/react";
import { useMemo } from "react";
import { Container, Graphics, Text } from "pixi.js";

import {
  chunkCoordinateToId,
  chunkCoordinateToWorldOrigin,
  chunkWorldSize,
  worldContract
} from "@engine";
import { WorldViewportContainer, type CameraState } from "@engine-pixi";
import { createChunkDebugData } from "@game/content/world/chunkDebugData";
import type { EmberwakeRenderSurfaceMode } from "@game";
import type { ChunkCoordinate } from "../types";

extend({
  Container,
  Graphics,
  Text
});

type ViewportForWorldScene = {
  fitScale: number;
  screenSize: {
    height: number;
    width: number;
  };
};

type WorldSceneProps = {
  camera: CameraState;
  renderSurfaceMode: EmberwakeRenderSurfaceMode;
  visibleChunks: ChunkCoordinate[];
  viewport: ViewportForWorldScene;
  worldSeed: string;
};

const tileSize = worldContract.tileSizeInWorldUnits;

const drawChunkBase = (
  origin: { x: number; y: number },
  debugData: ReturnType<typeof createChunkDebugData>
) => (graphics: Graphics) => {
  graphics.clear();
  graphics.setFillStyle({ alpha: 0.96, color: debugData.baseColor });
  graphics.rect(origin.x, origin.y, chunkWorldSize, chunkWorldSize);
  graphics.fill();

  for (const tile of debugData.tiles) {
    graphics.setFillStyle({ alpha: 0.82, color: tile.color });
    graphics.rect(origin.x + tile.x * tileSize, origin.y + tile.y * tileSize, tileSize - 2, tileSize - 2);
    graphics.fill();
  }
};

const drawChunkOverlay = (
  origin: { x: number; y: number },
  debugData: ReturnType<typeof createChunkDebugData>
) => (graphics: Graphics) => {
  graphics.clear();
  graphics.setStrokeStyle({ alpha: 0.35, color: 0xf6eee8, width: 3 });
  graphics.rect(origin.x, origin.y, chunkWorldSize, chunkWorldSize);
  graphics.stroke();

  graphics.setStrokeStyle({ alpha: 0.18, color: debugData.overlayColor, width: 1 });

  for (let tileIndex = 1; tileIndex < worldContract.chunkSizeInTiles; tileIndex += 1) {
    const offset = tileIndex * tileSize;

    graphics.moveTo(origin.x + offset, origin.y);
    graphics.lineTo(origin.x + offset, origin.y + chunkWorldSize);
    graphics.moveTo(origin.x, origin.y + offset);
    graphics.lineTo(origin.x + chunkWorldSize, origin.y + offset);
  }

  graphics.stroke();
};

export function WorldScene({
  camera,
  renderSurfaceMode,
  visibleChunks,
  viewport,
  worldSeed
}: WorldSceneProps) {
  const scale = viewport.fitScale * camera.zoom;
  const chunkDebugData = useMemo(
    () =>
      visibleChunks.map((chunkCoordinate) => ({
        chunkCoordinate,
        debugData: createChunkDebugData(chunkCoordinate, worldSeed),
        origin: chunkCoordinateToWorldOrigin(chunkCoordinate)
      })),
    [visibleChunks, worldSeed]
  );
  const debugVisualsEnabled = renderSurfaceMode === "diagnostics";

  return (
    <WorldViewportContainer camera={camera} viewport={viewport}>
      <pixiGraphics draw={(graphics) => {
        graphics.clear();
        graphics.setFillStyle({ alpha: 1, color: 0x09070f });
        graphics.rect(camera.worldPosition.x - 10000, camera.worldPosition.y - 10000, 20000, 20000);
        graphics.fill();
      }} />

      {chunkDebugData.map(({ chunkCoordinate, debugData, origin }) => {
        return (
          <pixiContainer key={chunkCoordinateToId(chunkCoordinate, worldSeed)}>
            <pixiGraphics draw={drawChunkBase(origin, debugData)} />
            {debugVisualsEnabled ? (
              <>
                <pixiGraphics draw={drawChunkOverlay(origin, debugData)} />
                <pixiText
                  anchor={0.5}
                  eventMode="none"
                  resolution={2}
                  scale={1 / scale}
                  style={{
                    align: "center",
                    dropShadow: {
                      alpha: 0.6,
                      blur: 2,
                      color: "#09070f",
                      distance: 1
                    },
                    fill: "#f6eee8",
                    fontFamily: "monospace",
                    fontSize: 18,
                    fontWeight: "700",
                    letterSpacing: 1.5
                  }}
                  text={debugData.label}
                  x={origin.x + chunkWorldSize / 2}
                  y={origin.y + 34}
                />
              </>
            ) : null}
          </pixiContainer>
        );
      })}
    </WorldViewportContainer>
  );
}
