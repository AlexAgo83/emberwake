import { useEffect, useMemo, useState } from "react";

import { chunkCoordinateToId } from "../model/worldContract";
import { getVisibleChunkCoordinates } from "../model/worldViewMath";
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
  const [cachedChunkIds, setCachedChunkIds] = useState<string[]>([]);

  useEffect(() => {
    setCachedChunkIds((currentCache) => {
      const nextCache = [...currentCache];

      for (const chunkCoordinate of visibleChunks) {
        const chunkId = chunkCoordinateToId(chunkCoordinate);
        const existingIndex = nextCache.indexOf(chunkId);

        if (existingIndex >= 0) {
          nextCache.splice(existingIndex, 1);
        }

        nextCache.unshift(chunkId);
      }

      const trimmedCache = nextCache.slice(0, chunkVisibilityContract.cacheLimit);

      if (
        trimmedCache.length === currentCache.length &&
        trimmedCache.every((chunkId, index) => chunkId === currentCache[index])
      ) {
        return currentCache;
      }

      return trimmedCache;
    });
  }, [visibleChunks]);

  return {
    cachedChunkIds,
    preloadMargin: chunkVisibilityContract.preloadMargin,
    visibleChunks
  };
}
