# Emberwake 0.1.1

## Highlights

- Refined runtime hardening around input release behavior, diagnostics layout, and bundle risk tracking.
- Clarified local environment and Render mirror documentation for deployment and operator setup.
- Replaced the old panel-heavy runtime overlay with a single floating shell menu that owns fullscreen, camera reset, diagnostics, and inspecteur visibility.
- Moved diagnostics and inspecteur behind intentional menu-driven access, with a compact floating desktop posture and denser mobile panel layouts.
- Added camera mode selection in the shell menu so runtime control can switch between free camera and entity-follow camera behavior.

## Technical Notes

- This patch release keeps the existing static React, TypeScript, PixiJS, and PWA delivery model.
- Runtime shell preferences now persist inspecteur visibility, while runtime session storage persists camera state and camera mode.
- Mobile runtime chrome was compacted further so inspecteur and diagnostics occupy less screen space during touch play.
- Release notes remain version-matched to `package.json` and validated through `npm run release:changelog:validate`.
