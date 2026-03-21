import { useTick } from "@pixi/react";
import { UPDATE_PRIORITY } from "pixi.js";
import { useCallback } from "react";

type RuntimeFrameLoopBridgeProps = {
  onVisualFrame?: (timestampMs: number) => void;
};

export function RuntimeFrameLoopBridge({
  onVisualFrame
}: RuntimeFrameLoopBridgeProps) {
  const handleTick = useCallback(
    (ticker: { lastTime: number }) => {
      onVisualFrame?.(ticker.lastTime);
    },
    [onVisualFrame]
  );

  useTick({
    callback: handleTick,
    isEnabled: onVisualFrame !== undefined,
    priority: UPDATE_PRIORITY.HIGH
  });

  return null;
}
