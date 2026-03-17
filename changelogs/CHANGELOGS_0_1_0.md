# Emberwake 0.1.0

## Highlights

- Bootstrapped the static `React + TypeScript + PixiJS + PWA` runtime foundation.
- Established fullscreen viewport ownership, logical world-space sizing, and shell diagnostics.
- Added deterministic world and chunk contracts, camera controls, and a shared entity contract.
- Introduced a fixed-step entity simulation loop, desktop keyboard steering, and a visible mobile virtual-stick baseline.
- Added Render Blueprint and GitHub Actions CI foundations for static delivery.

## Technical Notes

- Release delivery is expected to flow through the dedicated `release` branch.
- Curated changelog files are mandatory for deployable versions.
- The Render Blueprint now omits an explicit `plan` field and relies on Render-managed plan selection.
- The current build still reports a large Pixi bundle warning, but validation passes.
