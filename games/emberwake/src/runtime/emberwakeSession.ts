import { createDefaultCameraState } from "@engine/camera/cameraMath";
import type { RuntimeSessionState } from "@shared/lib/runtimeSessionStorage";
import { emberwakeRuntimeBootstrap } from "@game/runtime/emberwakeRuntimeBootstrap";
import {
  defaultWorldProfileId,
  getWorldProfile,
  worldProfileSeedOptions
} from "@shared/model/worldProfiles";

export const emberwakeRuntimeSessionSeedOptions = worldProfileSeedOptions;

export const createDefaultEmberwakeRuntimeSessionState = (): RuntimeSessionState => ({
  hasActiveSession: false,
  playerName: "",
  cameraState: emberwakeRuntimeBootstrap.cameraState ?? createDefaultCameraState(),
  cameraMode: "follow-entity",
  sessionRevision: 0,
  worldProfileId: defaultWorldProfileId,
  worldSeed: getWorldProfile(defaultWorldProfileId).worldSeed
});
