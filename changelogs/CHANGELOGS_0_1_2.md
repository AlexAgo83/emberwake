# Emberwake 0.1.2

## Highlights

- Reworked the runtime shell around a single floating menu so fullscreen, camera reset, diagnostics, and inspecteur access now flow through one compact control hub.
- Hid inspecteur and diagnostics by default, with a compact desktop floating posture and denser mobile panel layouts that preserve more of the play surface.
- Added camera mode selection in the shell menu so the runtime can switch between free camera control and entity-follow camera behavior.
- Stabilized camera-follow runtime updates to avoid feedback loops while the controlled entity moves on mobile.

## Technical Notes

- This patch release keeps the existing static React, TypeScript, PixiJS, and PWA delivery model.
- Runtime session storage now persists both camera state and camera mode, while shell preferences continue to own menu-driven panel visibility.
- Release readiness for this candidate is validated against the version-matched changelog, the full CI command set, and the browser smoke pass.
