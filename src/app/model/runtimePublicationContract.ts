export const runtimePublicationContract = {
  diagnosticsSamplingIntervalMs: 250,
  hotPathSurfaceModes: {
    diagnostics: "sampled",
    runtimeScene: "visual-frame",
    shellChrome: "event-driven"
  }
} as const;
