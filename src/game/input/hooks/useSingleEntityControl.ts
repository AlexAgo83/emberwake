import { useEffect, useMemo, useState } from "react";

import { createIdleMovementIntent } from "../model/singleEntityControlContract";
import {
  createKeyboardMovementIntent,
  singleEntityControlContract
} from "../model/singleEntityControlContract";
import type {
  MovementIntent,
  SingleEntityControlState
} from "../model/singleEntityControlContract";

type UseSingleEntityControlOptions = {
  controlledEntityId: string;
  touchMovementIntent?: MovementIntent;
};

export function useSingleEntityControl({
  controlledEntityId,
  touchMovementIntent = createIdleMovementIntent("touch")
}: UseSingleEntityControlOptions): SingleEntityControlState {
  const [debugCameraModifierActive, setDebugCameraModifierActive] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setPressedKeys((currentKeys) => {
        if (currentKeys.has(event.key)) {
          return currentKeys;
        }

        return new Set(currentKeys).add(event.key);
      });

      if (event.key === singleEntityControlContract.debugCameraModifierKey) {
        setDebugCameraModifierActive(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setPressedKeys((currentKeys) => {
        if (!currentKeys.has(event.key)) {
          return currentKeys;
        }

        const nextKeys = new Set(currentKeys);
        nextKeys.delete(event.key);
        return nextKeys;
      });

      if (event.key === singleEntityControlContract.debugCameraModifierKey) {
        setDebugCameraModifierActive(false);
      }
    };

    const handleWindowBlur = () => {
      setPressedKeys(new Set());
      setDebugCameraModifierActive(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  return useMemo(() => {
    const keyboardMovementIntent = createKeyboardMovementIntent(pressedKeys);
    const movementIntent = touchMovementIntent.isActive
      ? touchMovementIntent
      : keyboardMovementIntent;
    const inputOwner = movementIntent.isActive
      ? singleEntityControlContract.ownership.controlledEntity
      : debugCameraModifierActive
        ? singleEntityControlContract.ownership.cameraDebug
        : singleEntityControlContract.ownership.none;

    return {
      controlledEntityId,
      debugCameraModifierActive,
      inputOwner,
      movementIntent
    };
  }, [controlledEntityId, debugCameraModifierActive, pressedKeys, touchMovementIntent]);
}
