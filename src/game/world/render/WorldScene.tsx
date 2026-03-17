import { extend } from "@pixi/react";
import { Container, Graphics, Text } from "pixi.js";

import { chunkCoordinateToId, chunkCoordinateToWorldOrigin, chunkWorldSize, worldContract } from "../model/worldContract";
import { createChunkDebugData } from "../model/chunkDebugData";
import type { CameraState } from "../../camera/model/cameraMath";
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
  visibleChunks: ChunkCoordinate[];
  viewport: ViewportForWorldScene;
  worldSeed: string;
};

const tileSize = worldContract.tileSizeInWorldUnits;

const drawChunkBase = (chunkCoordinate: ChunkCoordinate, worldSeed: string) => (graphics: Graphics) => {
  const debugData = createChunkDebugData(chunkCoordinate, worldSeed);
  const origin = chunkCoordinateToWorldOrigin(chunkCoordinate);

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

const drawChunkOverlay = (chunkCoordinate: ChunkCoordinate, worldSeed: string) => (graphics: Graphics) => {
  const debugData = createChunkDebugData(chunkCoordinate, worldSeed);
  const origin = chunkCoordinateToWorldOrigin(chunkCoordinate);

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

export function WorldScene({ camera, visibleChunks, viewport, worldSeed }: WorldSceneProps) {
  const scale = viewport.fitScale * camera.zoom;

  return (
    <pixiContainer
      pivot={camera.worldPosition}
      rotation={-camera.rotation}
      scale={scale}
      sortableChildren
      x={viewport.screenSize.width / 2}
      y={viewport.screenSize.height / 2}
    >
      <pixiGraphics draw={(graphics) => {
        graphics.clear();
        graphics.setFillStyle({ alpha: 1, color: 0x09070f });
        graphics.rect(camera.worldPosition.x - 10000, camera.worldPosition.y - 10000, 20000, 20000);
        graphics.fill();
      }} />

      {visibleChunks.map((chunkCoordinate) => {
        const origin = chunkCoordinateToWorldOrigin(chunkCoordinate);
        const debugData = createChunkDebugData(chunkCoordinate, worldSeed);

        return (
          <pixiContainer key={chunkCoordinateToId(chunkCoordinate, worldSeed)}>
            <pixiGraphics draw={drawChunkBase(chunkCoordinate, worldSeed)} />
            <pixiGraphics draw={drawChunkOverlay(chunkCoordinate, worldSeed)} />
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
          </pixiContainer>
        );
      })}
    </pixiContainer>
  );
}
