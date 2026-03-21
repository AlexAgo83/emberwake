import type { CameraMode } from "../../game/camera/model/cameraMode";
import type { CameraState } from "../../game/camera/model/cameraMath";
import {
  createDefaultEmberwakeRuntimeSessionState,
  emberwakeRuntimeSessionSeedOptions
} from "@game/runtime/emberwakeSession";
import { persistenceDomainCatalog } from "./persistence/storageDomainCatalog";
import {
  readVersionedStorageDomain,
  writeVersionedStorageDomain
} from "./persistence/storageDomain";

export type RuntimeSessionState = {
  cameraState: CameraState;
  cameraMode: CameraMode;
  worldSeed: string;
};

export const runtimeSessionContract = {
  invalidationPolicy: "drop-on-version-mismatch",
  reconstructionBoundary: "world-regenerated-from-seed",
  seedOptions: emberwakeRuntimeSessionSeedOptions,
  ...persistenceDomainCatalog.runtimeSession
} as const;

export const createDefaultRuntimeSessionState = (): RuntimeSessionState =>
  createDefaultEmberwakeRuntimeSessionState();

export const readRuntimeSessionState = (
  fallbackState: RuntimeSessionState
): RuntimeSessionState =>
  readVersionedStorageDomain({
    contract: persistenceDomainCatalog.runtimeSession,
    fallbackValue: fallbackState,
    merge: (fallbackValue, persistedValue) => ({
      ...fallbackValue,
      ...persistedValue,
      cameraState: {
        ...fallbackValue.cameraState,
        ...persistedValue.cameraState
      }
    }),
    payloadKey: "runtimeSession"
  });

export const writeRuntimeSessionState = (runtimeSession: RuntimeSessionState) => {
  writeVersionedStorageDomain({
    contract: persistenceDomainCatalog.runtimeSession,
    payload: runtimeSession,
    payloadKey: "runtimeSession"
  });
};
