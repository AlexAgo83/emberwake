import type { VersionedStorageDomainContract } from "./storageDomain";

export const persistenceDomainCatalog = {
  savedRuntimeSessionSlot: {
    domainId: "saved-runtime-session-slot",
    storageBackend: "localStorage",
    storageKey: "emberwake.saved-runtime-session-slot",
    storageVersion: 1
  },
  runtimeSession: {
    domainId: "runtime-session",
    storageBackend: "localStorage",
    storageKey: "emberwake.runtime-session",
    storageVersion: 1
  },
  desktopControlBindings: {
    domainId: "desktop-control-bindings",
    storageBackend: "localStorage",
    storageKey: "emberwake.desktop-control-bindings",
    storageVersion: 1
  },
  shellPreferences: {
    domainId: "shell-preferences",
    storageBackend: "localStorage",
    storageKey: "emberwake.shell-preferences",
    storageVersion: 1
  }
} as const satisfies Record<string, VersionedStorageDomainContract>;
