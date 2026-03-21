import { createDefaultCameraState } from "@engine/camera/cameraMath";
import type { RuntimeSessionState } from "@shared/lib/runtimeSessionStorage";
import { emberwakeRuntimeBootstrap } from "@game/runtime/emberwakeRuntimeBootstrap";

export const emberwakeRuntimeSessionSeedOptions = [
  emberwakeRuntimeBootstrap.worldSeed,
  "emberwake-ash-seed",
  "emberwake-glow-seed"
] as const;

export const createDefaultEmberwakeRuntimeSessionState = (): RuntimeSessionState => ({
  hasActiveSession: false,
  playerName: "",
  cameraState: emberwakeRuntimeBootstrap.cameraState ?? createDefaultCameraState(),
  cameraMode: "follow-entity",
  sessionRevision: 0,
  worldSeed: emberwakeRuntimeBootstrap.worldSeed
});
