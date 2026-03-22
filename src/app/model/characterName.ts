export const defaultCharacterName = "Wanderer";
export const characterNameMinLength = 3;
export const characterNameMaxLength = 20;
export const characterNameSuggestions = [
  "Ash Voss",
  "Cinder Vale",
  "Ember Rook",
  "Lena Voss",
  "Kael Rune",
  "Nyra Flint",
  "Orin Vale",
  "Sable Drift",
  "Tarin Ash",
  "Veya Rune",
  "Iris Coal",
  "Marek Dusk"
] as const;

const allowedCharacterPattern = /^[\p{L}\d' -]+$/u;
const numericOnlyPattern = /^\d+$/u;
const repeatedWhitespacePattern = /\s+/g;

export const normalizeCharacterName = (value: string) =>
  value
    .trim()
    .replace(repeatedWhitespacePattern, " ");

export const validateCharacterName = (rawValue: string) => {
  const normalizedValue = normalizeCharacterName(rawValue);

  if (!normalizedValue) {
    return {
      error: "Enter a character name.",
      isValid: false,
      normalizedValue
    } as const;
  }

  if (normalizedValue.length < characterNameMinLength) {
    return {
      error: `Use at least ${characterNameMinLength} characters.`,
      isValid: false,
      normalizedValue
    } as const;
  }

  if (normalizedValue.length > characterNameMaxLength) {
    return {
      error: `Use at most ${characterNameMaxLength} characters.`,
      isValid: false,
      normalizedValue
    } as const;
  }

  if (!allowedCharacterPattern.test(normalizedValue)) {
    return {
      error: "Use letters, numbers, spaces, apostrophes, or hyphens only.",
      isValid: false,
      normalizedValue
    } as const;
  }

  if (numericOnlyPattern.test(normalizedValue)) {
    return {
      error: "Name cannot be numbers only.",
      isValid: false,
      normalizedValue
    } as const;
  }

  return {
    error: null,
    isValid: true,
    normalizedValue
  } as const;
};

export const pickRandomCharacterName = (
  randomValue: number = Math.random(),
  previousName?: string
) => {
  if (characterNameSuggestions.length === 0) {
    return defaultCharacterName;
  }

  const boundedRandomValue = Math.max(0, Math.min(0.999999, randomValue));
  const initialIndex = Math.floor(boundedRandomValue * characterNameSuggestions.length);
  const initialSuggestion = characterNameSuggestions[initialIndex] ?? defaultCharacterName;

  if (
    characterNameSuggestions.length === 1 ||
    previousName === undefined ||
    initialSuggestion !== previousName
  ) {
    return initialSuggestion;
  }

  return (
    characterNameSuggestions[(initialIndex + 1) % characterNameSuggestions.length] ??
    defaultCharacterName
  );
};
