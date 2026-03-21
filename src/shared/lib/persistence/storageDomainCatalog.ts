import type { VersionedStorageDomainContract } from "./storageDomain";

export const persistenceDomainCatalog = {
  runtimeSession: {
    domainId: "runtime-session",
    storageBackend: "localStorage",
    storageKey: "emberwake.runtime-session",
    storageVersion: 1
  },
  shellPreferences: {
    domainId: "shell-preferences",
    storageBackend: "localStorage",
    storageKey: "emberwake.shell-preferences",
    storageVersion: 1
  }
} as const satisfies Record<string, VersionedStorageDomainContract>;
