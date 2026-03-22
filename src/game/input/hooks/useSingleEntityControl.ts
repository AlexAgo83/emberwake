import { useEffect, useMemo, useState } from "react";

import { createIdleMovementIntent } from "../model/singleEntityControlContract";
import {
  createKeyboardMovementIntent,
  normalizeKeyboardBindingKey,
  singleEntityControlContract
} from "../model/singleEntityControlContract";
import type {
  DesktopControlBindings,
  MovementIntent,
  SingleEntityControlState
} from "../model/singleEntityControlContract";

type UseSingleEntityControlOptions = {
  controlledEntityId: string;
  keyboardBindings?: DesktopControlBindings;
  viewRotationRadians?: number;
  touchMovementIntent?: MovementIntent;
};

export function useSingleEntityControl({
  controlledEntityId,
  keyboardBindings = singleEntityControlContract.keyboardBindings,
  viewRotationRadians = 0,
  touchMovementIntent = createIdleMovementIntent("touch")
}: UseSingleEntityControlOptions): SingleEntityControlState {
  const [debugCameraModifierActive, setDebugCameraModifierActive] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const normalizedKey = normalizeKeyboardBindingKey(event.key);

      setPressedKeys((currentKeys) => {
        if (currentKeys.has(normalizedKey)) {
          return currentKeys;
        }

        return new Set(currentKeys).add(normalizedKey);
      });

      if (normalizedKey === singleEntityControlContract.debugCameraModifierKey) {
        setDebugCameraModifierActive(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const normalizedKey = normalizeKeyboardBindingKey(event.key);

      setPressedKeys((currentKeys) => {
        if (!currentKeys.has(normalizedKey)) {
          return currentKeys;
        }

        const nextKeys = new Set(currentKeys);
        nextKeys.delete(normalizedKey);
        return nextKeys;
      });

      if (normalizedKey === singleEntityControlContract.debugCameraModifierKey) {
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
    const keyboardMovementIntent = createKeyboardMovementIntent(
      pressedKeys,
      keyboardBindings,
      viewRotationRadians
    );
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
  }, [
    controlledEntityId,
    debugCameraModifierActive,
    keyboardBindings,
    pressedKeys,
    touchMovementIntent,
    viewRotationRadians
  ]);
}
