type NumericConstraint = {
  integer?: boolean;
  minExclusive?: number;
  minInclusive?: number;
  path: string;
  value: unknown;
};

export const readFiniteNumber = ({
  integer = false,
  minExclusive,
  minInclusive,
  path,
  value
}: NumericConstraint) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Invalid tuning number at ${path}.`);
  }

  if (integer && !Number.isInteger(value)) {
    throw new Error(`Expected integer tuning number at ${path}.`);
  }

  if (minInclusive !== undefined && value < minInclusive) {
    throw new Error(`Expected tuning number >= ${minInclusive} at ${path}.`);
  }

  if (minExclusive !== undefined && value <= minExclusive) {
    throw new Error(`Expected tuning number > ${minExclusive} at ${path}.`);
  }

  return value;
};

export const readObject = (value: unknown, path: string) => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Invalid tuning object at ${path}.`);
  }

  return value as Record<string, unknown>;
};

export const readArray = (value: unknown, path: string) => {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid tuning array at ${path}.`);
  }

  return value;
};
