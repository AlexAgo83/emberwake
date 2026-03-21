import { logicalViewport } from "../constants/logicalViewport";
import packageMetadata from "../../../package.json";

const readBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
};

export const appConfig = {
  name: import.meta.env.VITE_APP_NAME ?? "Emberwake",
  version: import.meta.env.VITE_APP_VERSION ?? packageMetadata.version,
  projectUrl: import.meta.env.VITE_APP_PROJECT_URL ?? "https://github.com/AlexAgo83/emberwake",
  environment: import.meta.env.VITE_APP_ENV ?? (import.meta.env.PROD ? "production" : "development"),
  debugOverlayEnabled: readBoolean(import.meta.env.VITE_DEFAULT_DEBUG_OVERLAY, false),
  diagnosticsEnabled: import.meta.env.DEV || import.meta.env.VITE_APP_ENV === "preview",
  logicalWidth: logicalViewport.mobileWidth
};
