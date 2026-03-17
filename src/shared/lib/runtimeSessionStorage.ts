import { createDefaultCameraState } from "../../game/camera/model/cameraMath";
import type { CameraState } from "../../game/camera/model/cameraMath";
import { worldContract } from "../../game/world/model/worldContract";

export type RuntimeSessionState = {
  cameraState: CameraState;
  worldSeed: string;
};

type PersistedRuntimeSession = {
  runtimeSession: RuntimeSessionState;
  version: number;
};

const STORAGE_KEY = "emberwake.runtime-session";
const STORAGE_VERSION = 1;

export const runtimeSessionContract = {
  invalidationPolicy: "drop-on-version-mismatch",
  reconstructionBoundary: "world-regenerated-from-seed",
  seedOptions: [
    worldContract.defaultSeed,
    "emberwake-ash-seed",
    "emberwake-glow-seed"
  ] as const,
  storageBackend: "localStorage",
  storageKey: STORAGE_KEY,
  storageVersion: STORAGE_VERSION
} as const;

export const createDefaultRuntimeSessionState = (): RuntimeSessionState => ({
  cameraState: createDefaultCameraState(),
  worldSeed: worldContract.defaultSeed
});

export const readRuntimeSessionState = (
  fallbackState: RuntimeSessionState
): RuntimeSessionState => {
  if (typeof window === "undefined") {
    return fallbackState;
  }

  const rawSession = window.localStorage.getItem(STORAGE_KEY);
  if (!rawSession) {
    return fallbackState;
  }

  try {
    const parsedSession = JSON.parse(rawSession) as Partial<PersistedRuntimeSession>;

    if (parsedSession.version !== STORAGE_VERSION || !parsedSession.runtimeSession) {
      return fallbackState;
    }

    return {
      ...fallbackState,
      ...parsedSession.runtimeSession,
      cameraState: {
        ...fallbackState.cameraState,
        ...parsedSession.runtimeSession.cameraState
      }
    };
  } catch {
    return fallbackState;
  }
};

export const writeRuntimeSessionState = (runtimeSession: RuntimeSessionState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      runtimeSession,
      version: STORAGE_VERSION
    } satisfies PersistedRuntimeSession)
  );
};
