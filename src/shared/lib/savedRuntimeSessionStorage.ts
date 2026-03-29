import type { EmberwakeGameState } from "@game/runtime/emberwakeGameModule";
import type { RuntimeSessionState } from "./runtimeSessionStorage";
import { persistenceDomainCatalog } from "./persistence/storageDomainCatalog";
import { writeVersionedStorageDomain } from "./persistence/storageDomain";

export type SavedRuntimeSessionMetadata = {
  playerName: string;
  savedAtIso: string;
  sessionRevision: number;
  worldProfileId: RuntimeSessionState["worldProfileId"];
  worldSeed: string;
};

export type SavedRuntimeSessionSlot = {
  gameState: EmberwakeGameState;
  metadata: SavedRuntimeSessionMetadata;
  runtimeSession: RuntimeSessionState;
};

export const readSavedRuntimeSessionSlot = (): SavedRuntimeSessionSlot | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(
    persistenceDomainCatalog.savedRuntimeSessionSlot.storageKey
  );

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as {
      savedRuntimeSessionSlot?: SavedRuntimeSessionSlot;
      version?: number;
    };

    if (
      parsedValue.version !== persistenceDomainCatalog.savedRuntimeSessionSlot.storageVersion ||
      !parsedValue.savedRuntimeSessionSlot
    ) {
      return null;
    }

    return parsedValue.savedRuntimeSessionSlot;
  } catch {
    return null;
  }
};

export const writeSavedRuntimeSessionSlot = (savedSlot: SavedRuntimeSessionSlot) => {
  writeVersionedStorageDomain({
    contract: persistenceDomainCatalog.savedRuntimeSessionSlot,
    payload: savedSlot,
    payloadKey: "savedRuntimeSessionSlot"
  });
};

export const clearSavedRuntimeSessionSlot = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(persistenceDomainCatalog.savedRuntimeSessionSlot.storageKey);
};
