# Emberwake 0.3.2

## Highlights

- Cleaned the shell-owned front door further by removing leftover meta residue from `Main menu`, `Changelogs`, and `New game`, tightening `Settings` action semantics, and keeping the `Changelogs` back action visible on constrained viewports.
- Made desktop traversal fully view-relative under camera rotation so directional movement follows the player view instead of world axes.
- Externalized retunable runtime numbers into validated `gameplayTuning.json` and `systemTuning.json` contracts so balance and technical feel can be adjusted without hunting through runtime code.
- Added a scripted long-session profiling harness with declarative player scenarios, invincibility/no-death support, spawn-mode overrides, and stable profiling artifacts for multi-minute runtime investigation.

## Technical Notes

- Gameplay and system tuning now flow through dedicated JSON files plus typed adapters, keeping runtime logic in TypeScript while moving retunable constants out of local literals.
- Runtime profiling now exposes browser-driven automation hooks and artifact generation under `output/playwright/long-session/`, separate from the short smoke test path.
- Release-facing docs and `logics` workflow docs are synchronized with the delivered shell/tuning/profiling wave so request, backlog, and task status no longer drift behind implementation.
- This patch release includes a post-wave layout correction so the `Changelogs` surface keeps `Back to menu` visible at constrained viewport heights.
- `0.3.2` is prepared from `main` with `npm run release:changelog:validate` and `npm run release:ready:advisory` before promotion to `release`.
