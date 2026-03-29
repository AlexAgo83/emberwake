import type { MetaProfile } from "../../app/model/metaProgression";
import { persistenceDomainCatalog } from "./persistence/storageDomainCatalog";
import {
  readVersionedStorageDomain,
  writeVersionedStorageDomain
} from "./persistence/storageDomain";

export const metaProfileContract = {
  invalidationPolicy: "drop-on-version-mismatch",
  ...persistenceDomainCatalog.metaProfile
} as const;

export const readMetaProfile = (fallbackProfile: MetaProfile): MetaProfile =>
  readVersionedStorageDomain({
    contract: persistenceDomainCatalog.metaProfile,
    fallbackValue: fallbackProfile,
    merge: (currentFallbackProfile, persistedProfile) => ({
      ...currentFallbackProfile,
      ...persistedProfile,
      archive: {
        ...currentFallbackProfile.archive,
        ...persistedProfile.archive,
        creatureDefeatCounts:
          persistedProfile.archive?.creatureDefeatCounts ??
          currentFallbackProfile.archive.creatureDefeatCounts,
        discoveredActiveWeaponIds:
          persistedProfile.archive?.discoveredActiveWeaponIds ??
          currentFallbackProfile.archive.discoveredActiveWeaponIds,
        discoveredCreatureIds:
          persistedProfile.archive?.discoveredCreatureIds ??
          currentFallbackProfile.archive.discoveredCreatureIds,
        discoveredFusionIds:
          persistedProfile.archive?.discoveredFusionIds ??
          currentFallbackProfile.archive.discoveredFusionIds,
        discoveredLootIds:
          persistedProfile.archive?.discoveredLootIds ??
          currentFallbackProfile.archive.discoveredLootIds,
        discoveredPassiveItemIds:
          persistedProfile.archive?.discoveredPassiveItemIds ??
          currentFallbackProfile.archive.discoveredPassiveItemIds
      },
      purchasedShopUnlockIds:
        persistedProfile.purchasedShopUnlockIds ?? currentFallbackProfile.purchasedShopUnlockIds,
      talentRanks: {
        ...currentFallbackProfile.talentRanks,
        ...persistedProfile.talentRanks
      },
      worldProgress: {
        ...currentFallbackProfile.worldProgress,
        ...persistedProfile.worldProgress
      }
    }),
    payloadKey: "metaProfile"
  });

export const writeMetaProfile = (metaProfile: MetaProfile) => {
  writeVersionedStorageDomain({
    contract: persistenceDomainCatalog.metaProfile,
    payload: metaProfile,
    payloadKey: "metaProfile"
  });
};
