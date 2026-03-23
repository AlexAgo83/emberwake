import { useEffect, useMemo, useState } from "react";

import { chunkCoordinateToId } from "@engine/world/worldContract";
import { getVisibleChunkCoordinates } from "@engine/world/worldViewMath";
import type { CameraState } from "../../camera/model/cameraMath";
import type { ChunkCoordinate } from "../types";

type ViewportForChunkVisibility = {
  fitScale: number;
  screenSize: {
    height: number;
    width: number;
  };
};

type VisibleChunkSet = {
  cachedChunks: ChunkCoordinate[];
  cachedChunkIds: string[];
  preloadMargin: number;
  visibleChunks: ChunkCoordinate[];
};

const chunkVisibilityContract = {
  cacheLimit: 96,
  preloadMargin: 1
} as const;

export function useVisibleChunkSet(
  camera: CameraState,
  viewport: ViewportForChunkVisibility
): VisibleChunkSet {
  const visibleChunks = useMemo(
    () => getVisibleChunkCoordinates(camera, viewport, chunkVisibilityContract.preloadMargin),
    [camera, viewport]
  );
  const [cachedChunks, setCachedChunks] = useState<ChunkCoordinate[]>([]);

  useEffect(() => {
    setCachedChunks((currentCache) => {
      const nextCache = [...currentCache];

      for (const chunkCoordinate of visibleChunks) {
        const existingIndex = nextCache.findIndex(
          (cachedChunk) =>
            cachedChunk.x === chunkCoordinate.x && cachedChunk.y === chunkCoordinate.y
        );

        if (existingIndex >= 0) {
          nextCache.splice(existingIndex, 1);
        }

        nextCache.unshift(chunkCoordinate);
      }

      const trimmedCache = nextCache.slice(0, chunkVisibilityContract.cacheLimit);

      if (
        trimmedCache.length === currentCache.length &&
        trimmedCache.every(
          (chunkCoordinate, index) =>
            chunkCoordinate.x === currentCache[index]?.x &&
            chunkCoordinate.y === currentCache[index]?.y
        )
      ) {
        return currentCache;
      }

      return trimmedCache;
    });
  }, [visibleChunks]);

  return {
    cachedChunks,
    cachedChunkIds: cachedChunks.map((chunkCoordinate) => chunkCoordinateToId(chunkCoordinate)),
    preloadMargin: chunkVisibilityContract.preloadMargin,
    visibleChunks
  };
}
