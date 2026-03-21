export const desktopControlDirections = ["up", "left", "down", "right"] as const;
export const desktopCameraControlDirections = ["rotateLeft", "rotateRight"] as const;

export type DesktopControlDirection = (typeof desktopControlDirections)[number];
export type DesktopCameraControlDirection = (typeof desktopCameraControlDirections)[number];
export type DesktopControlBindingDirection =
  | DesktopControlDirection
  | DesktopCameraControlDirection;

export type DesktopControlBindings = Record<DesktopControlDirection, [string, string]> &
  Record<DesktopCameraControlDirection, [string]>;

const defaultDesktopControlBindings: DesktopControlBindings = {
  down: ["s", "ArrowDown"],
  left: ["a", "ArrowLeft"],
  rotateLeft: ["q"],
  rotateRight: ["e"],
  right: ["d", "ArrowRight"],
  up: ["w", "ArrowUp"]
};

export const createDefaultDesktopControlBindings = (): DesktopControlBindings => ({
  down: [...defaultDesktopControlBindings.down],
  left: [...defaultDesktopControlBindings.left],
  rotateLeft: [...defaultDesktopControlBindings.rotateLeft],
  rotateRight: [...defaultDesktopControlBindings.rotateRight],
  right: [...defaultDesktopControlBindings.right],
  up: [...defaultDesktopControlBindings.up]
});

export const normalizeKeyboardBindingKey = (key: string) =>
  key.length === 1 ? key.toLowerCase() : key;

export const singleEntityControlContract = {
  debugCameraModifierKey: "Shift",
  desktopMoveSpeedWorldUnitsPerSecond: 240,
  keyboardBindings: defaultDesktopControlBindings,
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
  },
  virtualStick: {
    deadZonePixels: 20,
    maxRadiusPixels: 88
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
  pressedKeys: ReadonlySet<string>,
  keyboardBindings: DesktopControlBindings = singleEntityControlContract.keyboardBindings
): MovementIntent => {
  const horizontal = keyboardAxis(
    pressedKeys,
    keyboardBindings.left,
    keyboardBindings.right
  );
  const vertical = keyboardAxis(
    pressedKeys,
    keyboardBindings.up,
    keyboardBindings.down
  );

  return createMovementIntent(horizontal, vertical, "keyboard");
};
