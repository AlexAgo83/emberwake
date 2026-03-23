import { beforeEach, describe, expect, it } from "vitest";

import {
  createDefaultRuntimeSessionState,
  readRuntimeSessionState,
  runtimeSessionContract,
  writeRuntimeSessionState
} from "./runtimeSessionStorage";

describe("runtimeSessionStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips runtime session state through local storage", () => {
    const runtimeSession = {
      hasActiveSession: true,
      playerName: "Wanderer",
      cameraMode: "free" as const,
      cameraState: {
        rotation: 0.5,
        worldPosition: { x: 128, y: -256 },
        zoom: 1.25
      },
      sessionRevision: 3,
      worldSeed: "emberwake-glow-seed"
    };

    writeRuntimeSessionState(runtimeSession);

    expect(readRuntimeSessionState(createDefaultRuntimeSessionState())).toEqual({
      ...runtimeSession,
      cameraState: {
        ...runtimeSession.cameraState,
        rotation: createDefaultRuntimeSessionState().cameraState.rotation
      }
    });
  });

  it("invalidates persisted state when the schema version does not match", () => {
    const fallbackState = createDefaultRuntimeSessionState();

    window.localStorage.setItem(
      runtimeSessionContract.storageKey,
      JSON.stringify({
        runtimeSession: {
          hasActiveSession: true,
          playerName: "Legacy",
          cameraState: {
            rotation: 1,
            worldPosition: { x: 10, y: 20 },
            zoom: 2
          },
          sessionRevision: 1,
          worldSeed: "legacy-seed"
        },
        version: runtimeSessionContract.storageVersion + 1
      })
    );

    expect(readRuntimeSessionState(fallbackState)).toEqual(fallbackState);
  });
});
