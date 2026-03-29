import { getWorldProfile, type WorldProfileId } from "./worldProfiles";

export const derivedWorldSeedDelimiter = "::runner:";

const toDeterministicSeedHash = (value: string) => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
};

export const resolveWorldSeedBase = (worldSeed: string) =>
  worldSeed.split(derivedWorldSeedDelimiter, 1)[0] ?? worldSeed;

export const deriveWorldSeed = ({
  normalizedPlayerName,
  worldProfileId
}: {
  normalizedPlayerName: string;
  worldProfileId: WorldProfileId;
}) => {
  const worldProfile = getWorldProfile(worldProfileId);
  const derivationInput = `${worldProfileId}:${normalizedPlayerName}`;

  return `${worldProfile.worldSeed}${derivedWorldSeedDelimiter}${toDeterministicSeedHash(derivationInput)}`;
};
