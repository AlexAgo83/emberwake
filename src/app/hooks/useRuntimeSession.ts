import { useCallback, useEffect, useState } from "react";

import { createInitialEmberwakeGameState } from "@game";
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
  readSavedRuntimeSessionSlot,
  writeSavedRuntimeSessionSlot
} from "../../shared/lib/savedRuntimeSessionStorage";
import { normalizeCharacterName } from "../model/characterName";

export function useRuntimeSession() {
  const [savedSessionSlot, setSavedSessionSlot] = useState(() => readSavedRuntimeSessionSlot());
  const [runtimeSession, setRuntimeSession] = useState<RuntimeSessionState>(() => {
    const persistedSession = readRuntimeSessionState(createDefaultRuntimeSessionState());

    return persistedSession.hasActiveSession
      ? {
          ...persistedSession,
          hasActiveSession: false
        }
      : persistedSession;
  });
  const [sessionInitState, setSessionInitState] = useState<EmberwakeGameState | undefined>();

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

  const createNewSession = useCallback((playerName: string) => {
    const normalizedPlayerName = normalizeCharacterName(playerName);
    setSessionInitState(createInitialEmberwakeGameState(runtimeSession.worldSeed));

    setRuntimeSession((currentSession) => {
      const defaultSession = createDefaultRuntimeSessionState();

      return {
        ...defaultSession,
        hasActiveSession: true,
        playerName: normalizedPlayerName,
        sessionRevision: currentSession.sessionRevision + 1,
        worldSeed: currentSession.worldSeed
      };
    });
  }, [runtimeSession.worldSeed]);

  const loadSavedSession = useCallback(() => {
    if (!savedSessionSlot) {
      return false;
    }

    setSessionInitState(savedSessionSlot.gameState);
    setRuntimeSession((currentSession) => ({
      ...savedSessionSlot.runtimeSession,
      hasActiveSession: true,
      sessionRevision: currentSession.sessionRevision + 1
    }));

    return true;
  }, [savedSessionSlot]);

  const saveActiveSession = useCallback(
    (gameState: EmberwakeGameState) => {
      if (!runtimeSession.hasActiveSession) {
        return false;
      }

      const savedSlot = {
        gameState,
        metadata: {
          playerName: runtimeSession.playerName,
          savedAtIso: new Date().toISOString(),
          sessionRevision: runtimeSession.sessionRevision,
          worldSeed: runtimeSession.worldSeed
        },
        runtimeSession: {
          ...runtimeSession,
          hasActiveSession: true
        }
      };

      writeSavedRuntimeSessionSlot(savedSlot);
      setSavedSessionSlot(savedSlot);

      return true;
    },
    [runtimeSession]
  );

  return {
    createNewSession,
    cycleWorldSeed,
    loadSavedSession,
    runtimeSession,
    saveActiveSession,
    savedSessionSlot,
    sessionInitState,
    setCameraMode,
    setCameraState
  };
}
