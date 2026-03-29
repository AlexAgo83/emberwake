import { Texture } from "pixi.js";
import { useEffect, useState } from "react";

import { resolveAssetUrl } from "./assetResolver";

const textureCache = new Map<string, Texture>();
const pendingTextureLoads = new Map<string, Promise<Texture>>();

export const getResolvedAssetTextureCacheMetrics = () => ({
  loadedTextureCount: textureCache.size,
  pendingLoadCount: pendingTextureLoads.size
});

export const clearResolvedAssetTextureCache = ({
  retainAssetIds = []
}: {
  retainAssetIds?: readonly string[];
} = {}) => {
  const retainedUrls = new Set(
    retainAssetIds
      .map((assetId) => resolveAssetUrl(assetId))
      .filter((assetUrl): assetUrl is string => assetUrl !== null)
  );

  for (const [assetUrl, texture] of textureCache.entries()) {
    if (retainedUrls.has(assetUrl)) {
      continue;
    }

    textureCache.delete(assetUrl);

    try {
      texture.destroy(true);
    } catch {
      // Ignore partially disposed textures during shell teardown.
    }
  }

  for (const assetUrl of pendingTextureLoads.keys()) {
    if (retainedUrls.has(assetUrl)) {
      continue;
    }

    pendingTextureLoads.delete(assetUrl);
  }
};

const loadTexture = (assetUrl: string) => {
  const cachedTexture = textureCache.get(assetUrl);

  if (cachedTexture) {
    return Promise.resolve(cachedTexture);
  }

  const pendingLoad = pendingTextureLoads.get(assetUrl);

  if (pendingLoad) {
    return pendingLoad;
  }

  const nextLoad = new Promise<Texture>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      resolve(Texture.from(image));
    };
    image.onerror = () => {
      reject(new Error(`Failed to load asset texture: ${assetUrl}`));
    };
    image.src = assetUrl;
  })
    .then((texture) => {
      textureCache.set(assetUrl, texture);
      return texture;
    })
    .finally(() => {
      pendingTextureLoads.delete(assetUrl);
    });

  pendingTextureLoads.set(assetUrl, nextLoad);
  return nextLoad;
};

export const useResolvedAssetTexture = (assetId: string) => {
  const assetUrl = resolveAssetUrl(assetId);
  const [texture, setTexture] = useState<Texture | null>(() =>
    assetUrl ? textureCache.get(assetUrl) ?? null : null
  );

  useEffect(() => {
    let cancelled = false;

    if (!assetUrl) {
      setTexture(null);
      return () => {
        cancelled = true;
      };
    }

    const cachedTexture = textureCache.get(assetUrl);

    if (cachedTexture) {
      setTexture(cachedTexture);

      return () => {
        cancelled = true;
      };
    }

    setTexture(null);

    void loadTexture(assetUrl)
      .then((loadedTexture) => {
        if (!cancelled) {
          setTexture(loadedTexture);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTexture(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [assetUrl]);

  return {
    assetUrl,
    texture
  };
};
