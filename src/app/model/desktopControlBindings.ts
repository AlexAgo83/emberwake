import {
  createDefaultDesktopControlBindings,
  normalizeKeyboardBindingKey
} from "../../game/input/model/singleEntityControlContract";
import type {
  DesktopControlBindings,
  DesktopControlDirection
} from "../../game/input/model/singleEntityControlContract";

export const desktopControlSlotOrder = [0, 1] as const;

export type DesktopControlSlotIndex = (typeof desktopControlSlotOrder)[number];

const unsupportedBindingKeys = new Set([
  "Alt",
  "CapsLock",
  "Control",
  "Enter",
  "Escape",
  "Meta",
  "Shift",
  "Tab"
]);

export const formatDesktopControlBindingKey = (key: string) => {
  if (key === " ") {
    return "Space";
  }

  if (key.startsWith("Arrow")) {
    return key.replace("Arrow", "Arrow ");
  }

  return key.length === 1 ? key.toUpperCase() : key;
};

export const validateDesktopControlBindingKey = (rawKey: string) => {
  const normalizedKey = normalizeKeyboardBindingKey(rawKey);

  if (unsupportedBindingKeys.has(normalizedKey)) {
    return {
      error: "Choose a movement key instead of a modifier or system key.",
      normalizedKey: null
    };
  }

  if (
    normalizedKey.startsWith("Arrow") ||
    normalizedKey === " " ||
    /^[a-z0-9]$/i.test(normalizedKey)
  ) {
    return {
      error: null,
      normalizedKey
    };
  }

  return {
    error: "Only letters, digits, Space, and arrow keys are supported for movement.",
    normalizedKey: null
  };
};

export const cloneDesktopControlBindings = (
  bindings: DesktopControlBindings
): DesktopControlBindings => ({
  down: [...bindings.down],
  left: [...bindings.left],
  right: [...bindings.right],
  up: [...bindings.up]
});

export const assignDesktopControlBinding = ({
  bindings,
  direction,
  key,
  slotIndex
}: {
  bindings: DesktopControlBindings;
  direction: DesktopControlDirection;
  key: string;
  slotIndex: DesktopControlSlotIndex;
}): DesktopControlBindings => {
  const nextBindings = cloneDesktopControlBindings(bindings);
  nextBindings[direction][slotIndex] = normalizeKeyboardBindingKey(key);
  return nextBindings;
};

export const areDesktopControlBindingsEqual = (
  left: DesktopControlBindings,
  right: DesktopControlBindings
) => JSON.stringify(left) === JSON.stringify(right);

export const getDesktopControlBindingConflicts = (bindings: DesktopControlBindings) => {
  const seenLocations = new Map<
    string,
    Array<{
      direction: DesktopControlDirection;
      slotIndex: DesktopControlSlotIndex;
    }>
  >();

  (Object.keys(bindings) as DesktopControlDirection[]).forEach((direction) => {
    desktopControlSlotOrder.forEach((slotIndex) => {
      const key = bindings[direction][slotIndex];
      const locations = seenLocations.get(key) ?? [];

      locations.push({ direction, slotIndex });
      seenLocations.set(key, locations);
    });
  });

  return Array.from(seenLocations.entries())
    .filter(([, locations]) => locations.length > 1)
    .map(([key, locations]) => ({
      key,
      locations
    }));
};

export const createDesktopControlConflictSet = (bindings: DesktopControlBindings) =>
  new Set(
    getDesktopControlBindingConflicts(bindings).flatMap(({ locations }) =>
      locations.map(({ direction, slotIndex }) => `${direction}:${slotIndex}`)
    )
  );

export const describeDesktopMovementBindings = (bindings: DesktopControlBindings) => {
  const defaultBindings = createDefaultDesktopControlBindings();

  if (areDesktopControlBindingsEqual(bindings, defaultBindings)) {
    return "WASD / arrows";
  }

  const primaryLetterCluster = [
    bindings.up[0],
    bindings.left[0],
    bindings.down[0],
    bindings.right[0]
  ]
    .map((key) => formatDesktopControlBindingKey(key))
    .join("");
  const hasArrowFallback = (
    [
      bindings.up[1],
      bindings.left[1],
      bindings.down[1],
      bindings.right[1]
    ] as const
  ).every((key) => key.startsWith("Arrow"));

  return hasArrowFallback ? `${primaryLetterCluster} / arrows` : "Custom movement";
};
