import { chunkCoordinateToWorldOrigin, chunkWorldSize, worldPointToChunkCoordinate } from "./worldContract";
import type { ChunkCoordinate, ScreenPoint, WorldPoint } from "../types";
import type { CameraState } from "../../camera/model/cameraMath";

type ViewportLike = {
  fitScale: number;
  screenSize: {
    height: number;
    width: number;
  };
};

export type WorldPickingSample = {
  chunkCoordinate: ChunkCoordinate;
  worldPoint: WorldPoint;
};

const rotatePoint = (point: WorldPoint, radians: number): WorldPoint => {
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);

  return {
    x: point.x * cosine - point.y * sine,
    y: point.x * sine + point.y * cosine
  };
};

const buildChunkRange = (minimum: number, maximum: number) => {
  const values: number[] = [];

  for (let value = minimum; value <= maximum; value += 1) {
    values.push(value);
  }

  return values;
};

export const getWorldScale = (camera: CameraState, viewport: ViewportLike) =>
  viewport.fitScale * camera.zoom;

export const worldPointToScreenPointWithCamera = (
  worldPoint: WorldPoint,
  camera: CameraState,
  viewport: ViewportLike
): ScreenPoint => {
  const translatedPoint = {
    x: worldPoint.x - camera.worldPosition.x,
    y: worldPoint.y - camera.worldPosition.y
  };
  const rotatedPoint = rotatePoint(translatedPoint, -camera.rotation);
  const scale = getWorldScale(camera, viewport);

  return {
    x: rotatedPoint.x * scale + viewport.screenSize.width / 2,
    y: rotatedPoint.y * scale + viewport.screenSize.height / 2
  };
};

export const screenPointToWorldPointWithCamera = (
  screenPoint: ScreenPoint,
  camera: CameraState,
  viewport: ViewportLike
): WorldPoint => {
  const scale = Math.max(getWorldScale(camera, viewport), 0.0001);
  const centeredPoint = {
    x: (screenPoint.x - viewport.screenSize.width / 2) / scale,
    y: (screenPoint.y - viewport.screenSize.height / 2) / scale
  };
  const rotatedPoint = rotatePoint(centeredPoint, camera.rotation);

  return {
    x: rotatedPoint.x + camera.worldPosition.x,
    y: rotatedPoint.y + camera.worldPosition.y
  };
};

export const getVisibleWorldCorners = (
  camera: CameraState,
  viewport: ViewportLike
): [WorldPoint, WorldPoint, WorldPoint, WorldPoint] => [
  screenPointToWorldPointWithCamera({ x: 0, y: 0 }, camera, viewport),
  screenPointToWorldPointWithCamera({ x: viewport.screenSize.width, y: 0 }, camera, viewport),
  screenPointToWorldPointWithCamera(
    { x: viewport.screenSize.width, y: viewport.screenSize.height },
    camera,
    viewport
  ),
  screenPointToWorldPointWithCamera({ x: 0, y: viewport.screenSize.height }, camera, viewport)
];

export const getVisibleChunkCoordinates = (
  camera: CameraState,
  viewport: ViewportLike,
  preloadMargin = 1
): ChunkCoordinate[] => {
  const visibleCorners = getVisibleWorldCorners(camera, viewport);
  const chunkCoordinates = visibleCorners.map(worldPointToChunkCoordinate);
  const minChunkX = Math.min(...chunkCoordinates.map((coordinate) => coordinate.x)) - preloadMargin;
  const maxChunkX = Math.max(...chunkCoordinates.map((coordinate) => coordinate.x)) + preloadMargin;
  const minChunkY = Math.min(...chunkCoordinates.map((coordinate) => coordinate.y)) - preloadMargin;
  const maxChunkY = Math.max(...chunkCoordinates.map((coordinate) => coordinate.y)) + preloadMargin;
  const visibleChunks: ChunkCoordinate[] = [];

  for (const chunkX of buildChunkRange(minChunkX, maxChunkX)) {
    for (const chunkY of buildChunkRange(minChunkY, maxChunkY)) {
      visibleChunks.push({
        x: chunkX,
        y: chunkY
      });
    }
  }

  return visibleChunks;
};

export const getChunkScreenBounds = (
  chunkCoordinate: ChunkCoordinate,
  camera: CameraState,
  viewport: ViewportLike
) => {
  const chunkOrigin = chunkCoordinateToWorldOrigin(chunkCoordinate);
  const screenPoints = [
    worldPointToScreenPointWithCamera(chunkOrigin, camera, viewport),
    worldPointToScreenPointWithCamera(
      {
        x: chunkOrigin.x + chunkWorldSize,
        y: chunkOrigin.y
      },
      camera,
      viewport
    ),
    worldPointToScreenPointWithCamera(
      {
        x: chunkOrigin.x + chunkWorldSize,
        y: chunkOrigin.y + chunkWorldSize
      },
      camera,
      viewport
    ),
    worldPointToScreenPointWithCamera(
      {
        x: chunkOrigin.x,
        y: chunkOrigin.y + chunkWorldSize
      },
      camera,
      viewport
    )
  ];

  return {
    height: Math.max(...screenPoints.map((point) => point.y)) - Math.min(...screenPoints.map((point) => point.y)),
    width: Math.max(...screenPoints.map((point) => point.x)) - Math.min(...screenPoints.map((point) => point.x))
  };
};

export const createWorldPickingSample = (
  screenPoint: ScreenPoint,
  camera: CameraState,
  viewport: ViewportLike
): WorldPickingSample => {
  const worldPoint = screenPointToWorldPointWithCamera(screenPoint, camera, viewport);

  return {
    chunkCoordinate: worldPointToChunkCoordinate(worldPoint),
    worldPoint
  };
};
