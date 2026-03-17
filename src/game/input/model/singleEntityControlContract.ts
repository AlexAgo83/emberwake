export const singleEntityControlContract = {
  debugCameraModifierKey: "Shift",
  desktopMoveSpeedWorldUnitsPerSecond: 240,
  keyboardBindings: {
    down: ["ArrowDown", "s", "S"],
    left: ["ArrowLeft", "a", "A"],
    right: ["ArrowRight", "d", "D"],
    up: ["ArrowUp", "w", "W"]
  },
  ownership: {
    cameraDebug: "debug-camera",
    controlledEntity: "player-entity",
    none: "none",
    systemOverlay: "system-overlay"
  },
  primaryLoop: {
    debugSelection: "secondary",
    desktopFallback: "keyboard-steering",
    mobilePrimaryGesture: "single-touch-drag",
    primaryInteraction: "steer-controlled-entity"
  }
} as const;

export type InputOwner =
  (typeof singleEntityControlContract.ownership)[keyof typeof singleEntityControlContract.ownership];

export type MovementIntentSource = "keyboard" | "none" | "touch";

export type MovementIntent = {
  isActive: boolean;
  magnitude: number;
  source: MovementIntentSource;
  vector: {
    x: number;
    y: number;
  };
};

export type SingleEntityControlState = {
  controlledEntityId: string;
  debugCameraModifierActive: boolean;
  inputOwner: InputOwner;
  movementIntent: MovementIntent;
};

const clampMagnitude = (value: number) => Math.min(1, Math.max(0, value));

export const createIdleMovementIntent = (
  source: MovementIntentSource = "none"
): MovementIntent => ({
  isActive: false,
  magnitude: 0,
  source,
  vector: {
    x: 0,
    y: 0
  }
});

export const createMovementIntent = (
  rawX: number,
  rawY: number,
  source: MovementIntentSource
): MovementIntent => {
  const magnitude = Math.hypot(rawX, rawY);

  if (magnitude === 0) {
    return createIdleMovementIntent(source);
  }

  return {
    isActive: true,
    magnitude: clampMagnitude(magnitude),
    source,
    vector: {
      x: rawX / magnitude,
      y: rawY / magnitude
    }
  };
};

const keyboardAxis = (
  pressedKeys: ReadonlySet<string>,
  negativeKeys: readonly string[],
  positiveKeys: readonly string[]
) => {
  const negativePressed = negativeKeys.some((key) => pressedKeys.has(key));
  const positivePressed = positiveKeys.some((key) => pressedKeys.has(key));

  if (negativePressed === positivePressed) {
    return 0;
  }

  return negativePressed ? -1 : 1;
};

export const createKeyboardMovementIntent = (
  pressedKeys: ReadonlySet<string>
): MovementIntent => {
  const horizontal = keyboardAxis(
    pressedKeys,
    singleEntityControlContract.keyboardBindings.left,
    singleEntityControlContract.keyboardBindings.right
  );
  const vertical = keyboardAxis(
    pressedKeys,
    singleEntityControlContract.keyboardBindings.up,
    singleEntityControlContract.keyboardBindings.down
  );

  return createMovementIntent(horizontal, vertical, "keyboard");
};
