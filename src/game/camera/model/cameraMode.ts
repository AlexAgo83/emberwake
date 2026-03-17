export type CameraMode = "follow-entity" | "free";

export const cameraModeOptions = ["free", "follow-entity"] as const satisfies CameraMode[];
