import { useCallback, useEffect, useState } from "react";

import type { EmberwakeGameState } from "@game";
import {
  createDefaultRuntimeSessionState,
  readRuntimeSessionState,
  runtimeSessionContract,
  writeRuntimeSessionState
} from "../../shared/lib/runtimeSessionStorage";
import type { RuntimeSessionState } from "../../shared/lib/runtimeSessionStorage";
import type { CameraMode } from "../../game/camera/model/cameraMode";
import type { CameraState } from "../../game/camera/model/cameraMath";
import {
  clearSavedRuntimeSessionSlot
} from "../../shared/lib/savedRuntimeSessionStorage";
import { normalizeCharacterName } from "../model/characterName";
import { getWorldProfile, getWorldProfileBySeed, type WorldProfileId } from "../../shared/model/worldProfiles";

export function useRuntimeSession() {
  const [runtimeSession, setRuntimeSession] = useState<RuntimeSessionState>(() => {
    const persistedSession = readRuntimeSessionState(createDefaultRuntimeSessionState());
    const resolvedWorldProfile =
      getWorldProfileBySeed(persistedSession.worldSeed) ??
      getWorldProfile(persistedSession.worldProfileId);

    return persistedSession.hasActiveSession
      ? {
          ...persistedSession,
          hasActiveSession: false,
          worldProfileId: resolvedWorldProfile.id,
          worldSeed: resolvedWorldProfile.worldSeed
        }
      : {
          ...persistedSession,
          worldProfileId: resolvedWorldProfile.id,
          worldSeed: resolvedWorldProfile.worldSeed
        };
  });
  const [sessionInitState, setSessionInitState] = useState<EmberwakeGameState | undefined>();

  useEffect(() => {
    writeRuntimeSessionState(runtimeSession);
  }, [runtimeSession]);

  useEffect(() => {
    clearSavedRuntimeSessionSlot();
  }, []);

  const cycleWorldSeed = useCallback(() => {
    setRuntimeSession((currentSession) => {
      const currentSeedIndex = runtimeSessionContract.seedOptions.indexOf(currentSession.worldSeed);
      const nextSeedIndex =
        currentSeedIndex === -1
          ? 0
          : (currentSeedIndex + 1) % runtimeSessionContract.seedOptions.length;
      const nextWorldProfile =
        getWorldProfileBySeed(runtimeSessionContract.seedOptions[nextSeedIndex]) ??
        getWorldProfile(createDefaultRuntimeSessionState().worldProfileId);

      return {
        ...currentSession,
        worldProfileId: nextWorldProfile.id,
        worldSeed: nextWorldProfile.worldSeed
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

  const setWorldProfileId = useCallback((worldProfileId: WorldProfileId) => {
    const worldProfile = getWorldProfile(worldProfileId);

    setRuntimeSession((currentSession) => ({
      ...currentSession,
      worldProfileId,
      worldSeed: worldProfile.worldSeed
    }));
  }, []);

  const createNewSession = useCallback((playerName: string, worldProfileId?: WorldProfileId) => {
    const normalizedPlayerName = normalizeCharacterName(playerName);
    setSessionInitState(undefined);

    setRuntimeSession((currentSession) => {
      const defaultSession = createDefaultRuntimeSessionState();
      const selectedWorldProfile = getWorldProfile(
        worldProfileId ?? currentSession.worldProfileId ?? defaultSession.worldProfileId
      );

      return {
        ...defaultSession,
        hasActiveSession: true,
        playerName: normalizedPlayerName,
        sessionRevision: currentSession.sessionRevision + 1,
        worldProfileId: selectedWorldProfile.id,
        worldSeed: selectedWorldProfile.worldSeed
      };
    });
  }, []);

  const endActiveSession = useCallback(() => {
    setSessionInitState(undefined);
    setRuntimeSession((currentSession) => ({
      ...currentSession,
      hasActiveSession: false
    }));
  }, []);

  return {
    createNewSession,
    cycleWorldSeed,
    endActiveSession,
    runtimeSession,
    sessionInitState,
    setCameraMode,
    setCameraState,
    setWorldProfileId
  };
}
