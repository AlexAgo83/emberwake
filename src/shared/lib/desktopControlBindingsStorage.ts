import {
  createDefaultDesktopControlBindings
} from "../../game/input/model/singleEntityControlContract";
import type { DesktopControlBindings } from "../../game/input/model/singleEntityControlContract";
import { persistenceDomainCatalog } from "./persistence/storageDomainCatalog";
import {
  readVersionedStorageDomain,
  writeVersionedStorageDomain
} from "./persistence/storageDomain";

export const desktopControlBindingsContract = {
  invalidationPolicy: "drop-on-version-mismatch",
  ...persistenceDomainCatalog.desktopControlBindings
} as const;

export const readDesktopControlBindings = (
  fallbackBindings: DesktopControlBindings = createDefaultDesktopControlBindings()
): DesktopControlBindings =>
  readVersionedStorageDomain({
    contract: persistenceDomainCatalog.desktopControlBindings,
    fallbackValue: fallbackBindings,
    merge: (currentFallbackBindings, persistedBindings) => ({
      down: [...(persistedBindings.down ?? currentFallbackBindings.down)] as [string, string],
      left: [...(persistedBindings.left ?? currentFallbackBindings.left)] as [string, string],
      right: [...(persistedBindings.right ?? currentFallbackBindings.right)] as [string, string],
      up: [...(persistedBindings.up ?? currentFallbackBindings.up)] as [string, string]
    }),
    payloadKey: "desktopControlBindings"
  });

export const writeDesktopControlBindings = (desktopControlBindings: DesktopControlBindings) => {
  writeVersionedStorageDomain({
    contract: persistenceDomainCatalog.desktopControlBindings,
    payload: desktopControlBindings,
    payloadKey: "desktopControlBindings"
  });
};
