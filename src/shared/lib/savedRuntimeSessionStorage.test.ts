import { beforeEach, describe, expect, it } from "vitest";

import { createInitialEmberwakeGameState } from "@game/runtime/emberwakeGameModule";
import { createDefaultRuntimeSessionState } from "./runtimeSessionStorage";
import {
  readSavedRuntimeSessionSlot,
  writeSavedRuntimeSessionSlot
} from "./savedRuntimeSessionStorage";

describe("savedRuntimeSessionStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips a saved runtime session slot through local storage", () => {
    const runtimeSession = {
      ...createDefaultRuntimeSessionState(),
      hasActiveSession: true,
      playerName: "Ash",
      sessionRevision: 4,
      worldProfileId: "glowfen-basin" as const,
      worldSeed: "emberwake-world-glowfen-basin"
    };
    const gameState = createInitialEmberwakeGameState();
    gameState.simulation.entity.worldPosition = { x: 256, y: -128 };
    gameState.systems.progression.runtimeTicksSurvived = 24;

    const savedSlot = {
      gameState,
      metadata: {
        playerName: runtimeSession.playerName,
        savedAtIso: "2026-03-21T12:00:00.000Z",
        sessionRevision: runtimeSession.sessionRevision,
        worldProfileId: runtimeSession.worldProfileId,
        worldSeed: runtimeSession.worldSeed
      },
      runtimeSession
    };

    writeSavedRuntimeSessionSlot(savedSlot);

    expect(readSavedRuntimeSessionSlot()).toEqual(savedSlot);
  });

  it("returns null when no saved slot exists", () => {
    expect(readSavedRuntimeSessionSlot()).toBeNull();
  });
});
