import type { CameraMode } from "../../game/camera/model/cameraMode";
import type { CameraState } from "../../game/camera/model/cameraMath";
import {
  createDefaultEmberwakeRuntimeSessionState,
  emberwakeRuntimeSessionSeedOptions
} from "@game/runtime/emberwakeSession";
import type { WorldProfileId } from "../model/worldProfiles";
import { persistenceDomainCatalog } from "./persistence/storageDomainCatalog";
import {
  readVersionedStorageDomain,
  writeVersionedStorageDomain
} from "./persistence/storageDomain";

export type RuntimeSessionState = {
  hasActiveSession: boolean;
  playerName: string;
  cameraState: CameraState;
  cameraMode: CameraMode;
  sessionRevision: number;
  worldProfileId: WorldProfileId;
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
        ...persistedValue.cameraState,
        rotation: fallbackValue.cameraState.rotation
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
