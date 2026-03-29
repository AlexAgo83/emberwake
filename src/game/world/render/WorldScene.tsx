import { extend } from "@pixi/react";
import { memo, useMemo } from "react";
import { Container, Graphics, Sprite, Text } from "pixi.js";

import {
  chunkCoordinateToId,
  chunkCoordinateToWorldOrigin,
  chunkWorldSize,
  worldContract
} from "@engine";
import { WorldViewportContainer, type CameraState } from "@engine-pixi";
import { createChunkDebugData } from "@game/content/world/chunkDebugData";
import type { EmberwakeRenderSurfaceMode } from "@game";
import { useResolvedAssetTexture } from "@src/assets/useResolvedAssetTexture";
import type { ChunkCoordinate } from "../types";

extend({
  Container,
  Graphics,
  Sprite,
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

const backgroundExtent = 500_000;

const drawWorldBackground = (graphics: Graphics) => {
  graphics.clear();
  graphics.setFillStyle({ alpha: 1, color: 0x09070f });
  graphics.rect(-backgroundExtent, -backgroundExtent, backgroundExtent * 2, backgroundExtent * 2);
  graphics.fill();
};

const drawChunkBase =
  ({
    debugData,
    terrainBacked
  }: {
    debugData: ReturnType<typeof createChunkDebugData>;
    terrainBacked: boolean;
  }) =>
  (graphics: Graphics) => {
  graphics.clear();
  graphics.setFillStyle({ alpha: terrainBacked ? 0.16 : 0.92, color: debugData.baseColor });
  graphics.roundRect(0, 0, chunkWorldSize, chunkWorldSize, 26);
  graphics.fill();

  for (const tile of debugData.tiles) {
    const tileAlpha =
      tile.layer === "obstacle" ? 0.92 : tile.layer === "surface-modifier" ? 0.52 : 0.28;

    graphics.setFillStyle({ alpha: tileAlpha, color: tile.color });
    graphics.rect(tile.x * tileSize, tile.y * tileSize, tileSize - 2, tileSize - 2);
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

const RetainedChunkBase = memo(function RetainedChunkBase({
  debugData,
  isVisible,
  origin
}: {
  debugData: ReturnType<typeof createChunkDebugData>;
  isVisible: boolean;
  origin: { x: number; y: number };
}) {
  const { assetUrl: terrainAssetUrl, texture: terrainTexture } = useResolvedAssetTexture(
    debugData.primaryTerrainAssetId
  );
  const draw = useMemo(
    () =>
      drawChunkBase({
        debugData,
        terrainBacked: Boolean(terrainAssetUrl)
      }),
    [debugData, terrainAssetUrl]
  );

  return (
    <pixiContainer visible={isVisible} x={origin.x} y={origin.y}>
      {terrainTexture ? (
        <pixiSprite
          alpha={0.92}
          eventMode="none"
          height={chunkWorldSize}
          texture={terrainTexture}
          width={chunkWorldSize}
          x={0}
          y={0}
        />
      ) : null}
      <pixiGraphics draw={draw} />
    </pixiContainer>
  );
});

export function WorldScene({
  camera,
  renderSurfaceMode,
  visibleChunks,
  viewport,
  worldSeed
}: WorldSceneProps) {
  const scale = viewport.fitScale * camera.zoom;
  const visibleChunkIdSet = useMemo(
    () =>
      new Set(
        visibleChunks.map((chunkCoordinate) => chunkCoordinateToId(chunkCoordinate, worldSeed))
      ),
    [visibleChunks, worldSeed]
  );
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
      <pixiGraphics draw={drawWorldBackground} />

      {chunkDebugData.map(({ chunkCoordinate, debugData, origin }) => {
        const chunkId = chunkCoordinateToId(chunkCoordinate, worldSeed);
        const isVisible = visibleChunkIdSet.has(chunkId);

        return (
          <pixiContainer key={chunkCoordinateToId(chunkCoordinate, worldSeed)}>
            <RetainedChunkBase debugData={debugData} isVisible={isVisible} origin={origin} />
            {debugVisualsEnabled && isVisible ? (
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
