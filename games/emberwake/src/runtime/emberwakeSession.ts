import { createDefaultCameraState } from "@src/game/camera/model/cameraMath";
import { officialDebugScenario } from "@src/game/debug/data/officialDebugScenario";
import type { RuntimeSessionState } from "@shared/lib/runtimeSessionStorage";

export const emberwakeRuntimeSessionSeedOptions = [
  officialDebugScenario.worldSeed,
  "emberwake-ash-seed",
  "emberwake-glow-seed"
] as const;

export const createDefaultEmberwakeRuntimeSessionState = (): RuntimeSessionState => ({
  cameraState: officialDebugScenario.cameraState ?? createDefaultCameraState(),
  cameraMode: "free",
  worldSeed: officialDebugScenario.worldSeed
});
