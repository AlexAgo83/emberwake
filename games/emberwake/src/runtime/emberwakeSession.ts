import { createDefaultCameraState } from "@engine/camera/cameraMath";
import type { RuntimeSessionState } from "@shared/lib/runtimeSessionStorage";
import { emberwakeRuntimeBootstrap } from "@game/runtime/emberwakeRuntimeBootstrap";

export const emberwakeRuntimeSessionSeedOptions = [
  emberwakeRuntimeBootstrap.worldSeed,
  "emberwake-ash-seed",
  "emberwake-glow-seed"
] as const;

export const createDefaultEmberwakeRuntimeSessionState = (): RuntimeSessionState => ({
  cameraState: emberwakeRuntimeBootstrap.cameraState ?? createDefaultCameraState(),
  cameraMode: "free",
  worldSeed: emberwakeRuntimeBootstrap.worldSeed
});
