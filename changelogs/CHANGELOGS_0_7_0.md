# Emberwake 0.7.0

## Highlights

- Reframed Emberwake around a full world-to-mission run loop with a five-world ladder, mission-gated unlock progression, authored world cards, and deterministic seeds derived from player identity plus world choice.
- Added a structured primary mission flow on the map with three distant objectives, mission bosses, mission-item drops, extraction after completion, and off-screen guidance for mission targets and mini-boss pressure.
- Expanded the shell and archive layer with a loot archive, richer world selection, in-run abandon flow, cleaned outcome screens, generated skill icons, and a stronger generated-asset presentation across the game.

## World progression and mission structure

- Added five authored world profiles: `Ashwake Verge`, `Emberplain Reach`, `Glowfen Basin`, `Obsidian Vault`, and `Cinderfall Crown`.
- Added unlock-gated world selection from `New game`, with visible attempts, clears, and mission progress on each world card.
- Introduced hostile scaling by world tier from world 2 onward, increasing hostile health and damage by `10%` per world.
- Added a primary mission loop with three objectives per world, objective-specific labels and placements, mission bosses, mission-item drops, and extraction only after the full objective set is secured.
- Added off-screen guidance arrows for mission objectives, mission bosses, dropped mission items, and mini-bosses when they matter outside the current camera frame.

## Run commitment, build flow, and runtime combat

- Shifted the player-facing run posture away from save/load and toward committed runs that end in `victory`, `defeat`, or explicit `abandon`.
- Added the in-run `Abandon run` action and cleaned terminal runtime ownership on return to the main menu so completed or abandoned runs do not linger as resumable sessions.
- Reworked level-up moments into a dual-track offer model with `3` combat offers, `3` passive offers, single-pick resolution, reroll charges, and pass charges backed by shop progression.
- Added state-reactive entity health bars, a bounded red laser attack for `watchglass`, and continued runtime readability tuning for generated assets and overlays.
- Differentiated crystal runtime behavior further by preserving value under compaction instead of silently losing distant or dense crystal fields.

## Shell, archives, and generated asset presentation

- Added a `Loot Archive` shell surface with discovery gated by actual item collection, parallel to the existing codex-style archive flows.
- Reworked `Victory` to match the stronger `Game over` presentation model, including recap and skill-ranking views plus a clean return to the main menu.
- Enriched the main menu with large runtime character and enemy silhouettes at the screen edges and refreshed related shell layout behavior for desktop and mobile.
- Added a wider generated art wave covering first-wave runtime entities, directional entity posture, unique boss assets, distinct crystal assets, and full generated skill-icon coverage.
- Extended the `Bestiary` to include boss forms as first-class archive entries.

## Technical Notes

- The world seed is now derived deterministically from the normalized player name plus the selected world profile, making authored world selection and player identity part of repeatable run generation.
- Runtime-owned memory/state is now explicitly cleaned when returning to the main menu from terminal run states such as `victory`, `defeat`, and `abandon`.
- Release-facing documentation was refreshed so the repository `README` now reflects the current world ladder, mission loop, archive surfaces, and run-commit posture instead of the earlier save/load framing.
- `0.7.0` is prepared from `main` with `package.json` as the source of truth for the app version and this changelog as the release-notes source for `v0.7.0`.

## Validation

- `npm run release:changelog:validate`
- `npm run release:ready:advisory`
