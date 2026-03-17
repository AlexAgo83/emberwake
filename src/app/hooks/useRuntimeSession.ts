import { useCallback, useEffect, useState } from "react";

import {
  createDefaultRuntimeSessionState,
  readRuntimeSessionState,
  runtimeSessionContract,
  writeRuntimeSessionState
} from "../../shared/lib/runtimeSessionStorage";
import type { RuntimeSessionState } from "../../shared/lib/runtimeSessionStorage";
import type { CameraMode } from "../../game/camera/model/cameraMode";
import type { CameraState } from "../../game/camera/model/cameraMath";

export function useRuntimeSession() {
  const [runtimeSession, setRuntimeSession] = useState<RuntimeSessionState>(() =>
    readRuntimeSessionState(createDefaultRuntimeSessionState())
  );

  useEffect(() => {
    writeRuntimeSessionState(runtimeSession);
  }, [runtimeSession]);

  const cycleWorldSeed = useCallback(() => {
    setRuntimeSession((currentSession) => {
      const currentSeedIndex = runtimeSessionContract.seedOptions.indexOf(currentSession.worldSeed);
      const nextSeedIndex =
        currentSeedIndex === -1
          ? 0
          : (currentSeedIndex + 1) % runtimeSessionContract.seedOptions.length;

      return {
        ...currentSession,
        worldSeed: runtimeSessionContract.seedOptions[nextSeedIndex]
      };
    });
  }, []);

  const setCameraState = useCallback((cameraState: CameraState) => {
    setRuntimeSession((currentSession) => ({
      ...currentSession,
      cameraState
    }));
  }, []);

  const setCameraMode = useCallback((cameraMode: CameraMode) => {
    setRuntimeSession((currentSession) => ({
      ...currentSession,
      cameraMode
    }));
  }, []);

  return {
    cycleWorldSeed,
    runtimeSession,
    setCameraMode,
    setCameraState
  };
}
