import { createDefaultCameraState } from "../../game/camera/model/cameraMath";
import type { CameraMode } from "../../game/camera/model/cameraMode";
import type { CameraState } from "../../game/camera/model/cameraMath";
import { officialDebugScenario } from "../../game/debug/data/officialDebugScenario";

export type RuntimeSessionState = {
  cameraState: CameraState;
  cameraMode: CameraMode;
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
    officialDebugScenario.worldSeed,
    "emberwake-ash-seed",
    "emberwake-glow-seed"
  ] as const,
  storageBackend: "localStorage",
  storageKey: STORAGE_KEY,
  storageVersion: STORAGE_VERSION
} as const;

export const createDefaultRuntimeSessionState = (): RuntimeSessionState => ({
  cameraState: officialDebugScenario.cameraState ?? createDefaultCameraState(),
  cameraMode: "free",
  worldSeed: officialDebugScenario.worldSeed
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
