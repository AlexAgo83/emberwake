import { useEffect, useState } from "react";
import type { RefObject } from "react";

import { logicalViewport } from "../../shared/constants/logicalViewport";
import { shellPerformanceBudget } from "../../shared/constants/performanceBudget";
import { runtimeContract } from "../../shared/constants/runtimeContract";
import type { LayoutMode } from "../../shared/types/layout";

export type LogicalViewportModel = {
  fitScale: number;
  layoutMode: LayoutMode;
  logicalSize: {
    height: number;
    width: number;
  };
  performanceBudget: typeof shellPerformanceBudget;
  screenSize: {
    height: number;
    width: number;
  };
  spaces: typeof runtimeContract.coordinateSpaces;
  visibleWorldSize: {
    height: number;
    width: number;
  };
  worldOrigin: {
    x: number;
    y: number;
  };
};

const buildViewportModel = (width: number, height: number): LogicalViewportModel => {
  const safeWidth = Math.max(width, 1);
  const safeHeight = Math.max(height, 1);
  const fitScale = Math.min(
    safeWidth / logicalViewport.mobileWidth,
    safeHeight / logicalViewport.mobileHeight
  );

  return {
    fitScale,
    layoutMode: safeWidth <= logicalViewport.breakpoint ? "mobile" : "large-screen",
    logicalSize: {
      height: logicalViewport.mobileHeight,
      width: logicalViewport.mobileWidth
    },
    performanceBudget: shellPerformanceBudget,
    screenSize: {
      height: safeHeight,
      width: safeWidth
    },
    spaces: runtimeContract.coordinateSpaces,
    visibleWorldSize: {
      height: safeHeight / fitScale,
      width: safeWidth / fitScale
    },
    worldOrigin: {
      x: 0,
      y: 0
    }
  };
};

const getFallbackSize = () => ({
  height: window.innerHeight,
  width: window.innerWidth
});

export function useLogicalViewportModel(
  shellRef: RefObject<HTMLElement | null>
): LogicalViewportModel {
  const [viewportModel, setViewportModel] = useState<LogicalViewportModel>(() =>
    buildViewportModel(logicalViewport.mobileWidth, logicalViewport.mobileHeight)
  );

  useEffect(() => {
    const shellElement = shellRef.current;
    if (!shellElement) {
      return;
    }

    const updateFromRect = (width: number, height: number) => {
      setViewportModel(buildViewportModel(width, height));
    };

    const updateFromElement = () => {
      const rect = shellElement.getBoundingClientRect();
      updateFromRect(rect.width, rect.height);
    };

    updateFromElement();

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }

        updateFromRect(entry.contentRect.width, entry.contentRect.height);
      });

      resizeObserver.observe(shellElement);

      return () => {
        resizeObserver.disconnect();
      };
    }

    const handleResize = () => {
      const fallbackSize = getFallbackSize();
      updateFromRect(fallbackSize.width, fallbackSize.height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [shellRef]);

  return viewportModel;
}
