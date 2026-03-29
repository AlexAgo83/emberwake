import { chunkWorldSize } from "@engine";
import type { ChunkCoordinate } from "../types";

type ChunkSeamPresentationInput = {
  chunkCoordinate: ChunkCoordinate;
  debugData: {
    baseColor: number;
    overlayColor: number;
    primaryTerrainAssetId: string;
  };
  origin: {
    x: number;
    y: number;
  };
};

export type BiomeSeamSegment = {
  accentTint: number;
  baseTint: number;
  boundaryWorldCoordinate: number;
  endWorldCoordinate: number;
  key: string;
  orientation: "horizontal" | "vertical";
  startWorldCoordinate: number;
};

const mixTint = (leftTint: number, rightTint: number) => {
  const leftRed = (leftTint >> 16) & 0xff;
  const leftGreen = (leftTint >> 8) & 0xff;
  const leftBlue = leftTint & 0xff;
  const rightRed = (rightTint >> 16) & 0xff;
  const rightGreen = (rightTint >> 8) & 0xff;
  const rightBlue = rightTint & 0xff;

  return (
    (Math.round((leftRed + rightRed) / 2) << 16) |
    (Math.round((leftGreen + rightGreen) / 2) << 8) |
    Math.round((leftBlue + rightBlue) / 2)
  );
};

const sampleSignedNoise = (key: string, amplitude: number) => {
  let signature = 0;

  for (let index = 0; index < key.length; index += 1) {
    signature = (signature * 33 + key.charCodeAt(index)) >>> 0;
  }

  const bucketSize = amplitude * 2 + 1;

  return (signature % bucketSize) - amplitude;
};

export const deriveBiomeSeamSegments = (
  chunks: ChunkSeamPresentationInput[]
): BiomeSeamSegment[] => {
  const chunkByCoordinate = new Map(
    chunks.map((chunk) => [`${chunk.chunkCoordinate.x}:${chunk.chunkCoordinate.y}`, chunk])
  );
  const segments: BiomeSeamSegment[] = [];

  for (const chunk of chunks) {
    const rightNeighbor = chunkByCoordinate.get(
      `${chunk.chunkCoordinate.x + 1}:${chunk.chunkCoordinate.y}`
    );

    if (
      rightNeighbor &&
      rightNeighbor.debugData.primaryTerrainAssetId !== chunk.debugData.primaryTerrainAssetId
    ) {
      segments.push({
        accentTint: mixTint(chunk.debugData.overlayColor, rightNeighbor.debugData.overlayColor),
        baseTint: mixTint(chunk.debugData.baseColor, rightNeighbor.debugData.baseColor),
        boundaryWorldCoordinate: chunk.origin.x + chunkWorldSize,
        endWorldCoordinate: chunk.origin.y + chunkWorldSize,
        key: `${chunk.chunkCoordinate.x}:${chunk.chunkCoordinate.y}->${rightNeighbor.chunkCoordinate.x}:${rightNeighbor.chunkCoordinate.y}`,
        orientation: "vertical",
        startWorldCoordinate: chunk.origin.y
      });
    }

    const lowerNeighbor = chunkByCoordinate.get(
      `${chunk.chunkCoordinate.x}:${chunk.chunkCoordinate.y + 1}`
    );

    if (
      lowerNeighbor &&
      lowerNeighbor.debugData.primaryTerrainAssetId !== chunk.debugData.primaryTerrainAssetId
    ) {
      segments.push({
        accentTint: mixTint(chunk.debugData.overlayColor, lowerNeighbor.debugData.overlayColor),
        baseTint: mixTint(chunk.debugData.baseColor, lowerNeighbor.debugData.baseColor),
        boundaryWorldCoordinate: chunk.origin.y + chunkWorldSize,
        endWorldCoordinate: chunk.origin.x + chunkWorldSize,
        key: `${chunk.chunkCoordinate.x}:${chunk.chunkCoordinate.y}=>${lowerNeighbor.chunkCoordinate.x}:${lowerNeighbor.chunkCoordinate.y}`,
        orientation: "horizontal",
        startWorldCoordinate: chunk.origin.x
      });
    }
  }

  return segments;
};

const seamProfileStepCount = 6;
const seamJitterAmplitude = 12;
const seamHalfWidth = 26;
const seamNarrowHalfWidth = 12;

const buildBiomeSeamProfile = (segment: BiomeSeamSegment) => {
  const outerLeadingEdge: Array<{ x: number; y: number }> = [];
  const outerTrailingEdge: Array<{ x: number; y: number }> = [];
  const innerCenterLine: Array<{ x: number; y: number }> = [];
  const seamLength = segment.endWorldCoordinate - segment.startWorldCoordinate;

  for (let stepIndex = 0; stepIndex <= seamProfileStepCount; stepIndex += 1) {
    const progress = stepIndex / seamProfileStepCount;
    const travelCoordinate = segment.startWorldCoordinate + seamLength * progress;
    const jitter = sampleSignedNoise(`${segment.key}:${stepIndex}`, seamJitterAmplitude);

    if (segment.orientation === "vertical") {
      outerLeadingEdge.push({
        x: segment.boundaryWorldCoordinate - seamHalfWidth + Math.min(jitter, 0),
        y: travelCoordinate
      });
      outerTrailingEdge.push({
        x: segment.boundaryWorldCoordinate + seamHalfWidth + Math.max(jitter, 0),
        y: travelCoordinate
      });
      innerCenterLine.push({
        x: segment.boundaryWorldCoordinate + jitter * 0.35,
        y: travelCoordinate
      });
    } else {
      outerLeadingEdge.push({
        x: travelCoordinate,
        y: segment.boundaryWorldCoordinate - seamHalfWidth + Math.min(jitter, 0)
      });
      outerTrailingEdge.push({
        x: travelCoordinate,
        y: segment.boundaryWorldCoordinate + seamHalfWidth + Math.max(jitter, 0)
      });
      innerCenterLine.push({
        x: travelCoordinate,
        y: segment.boundaryWorldCoordinate + jitter * 0.35
      });
    }
  }

  return {
    innerCenterLine,
    innerHalfWidth: seamNarrowHalfWidth,
    outerLeadingEdge,
    outerTrailingEdge
  };
};

export const drawBiomeSeamSegment =
  (segment: BiomeSeamSegment) =>
  (graphics: import("pixi.js").Graphics) => {
    const seamProfile = buildBiomeSeamProfile(segment);

    graphics.clear();
    graphics.setFillStyle({ alpha: 0.16, color: segment.baseTint });
    graphics.moveTo(
      seamProfile.outerLeadingEdge[0]!.x,
      seamProfile.outerLeadingEdge[0]!.y
    );

    for (const point of seamProfile.outerLeadingEdge.slice(1)) {
      graphics.lineTo(point.x, point.y);
    }

    for (const point of [...seamProfile.outerTrailingEdge].reverse()) {
      graphics.lineTo(point.x, point.y);
    }

    graphics.closePath();
    graphics.fill();

    graphics.setStrokeStyle({
      alpha: 0.18,
      color: 0xf6eee8,
      width: seamProfile.innerHalfWidth * 1.1
    });
    graphics.moveTo(
      seamProfile.innerCenterLine[0]!.x,
      seamProfile.innerCenterLine[0]!.y
    );

    for (const point of seamProfile.innerCenterLine.slice(1)) {
      graphics.lineTo(point.x, point.y);
    }

    graphics.stroke();

    graphics.setStrokeStyle({
      alpha: 0.34,
      color: segment.accentTint,
      width: 3
    });
    graphics.moveTo(
      seamProfile.innerCenterLine[0]!.x,
      seamProfile.innerCenterLine[0]!.y
    );

    for (const point of seamProfile.innerCenterLine.slice(1)) {
      graphics.lineTo(point.x, point.y);
    }

    graphics.stroke();
  };
