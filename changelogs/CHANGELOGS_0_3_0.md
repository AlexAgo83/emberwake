# Emberwake 0.3.0

## Highlights

- Expanded Emberwake from a shell-navigation prototype into a playable survival slice with a shell-owned `Main menu`, `New game`, `Load game`, `Settings`, and `Game over` flow.
- Added deterministic runtime gameplay foundations: single-slot save/load, blocking obstacles, slow and slippery surfaces, hostile spawning, pursuit, contact damage, automatic player cone attacks, pickups, gold, and run recap.
- Improved runtime readability and feel with overhead health and charge bars, damage reactions, floating damage numbers, directional hostile spawning, and more clustered non-linear world generation.
- Tightened the runtime architecture and performance posture through hot-path optimization, lower render churn, initial memory-growth investigation, and a first structural split of the `entitySimulation` monolith.

## Technical Notes

- The shell/runtime loop now supports preserved pause-to-menu flow, denser desktop-control settings, release-facing README refresh, and explicit `logics` hygiene guidance.
- Runtime render preparation now reuses chunk presentation data more aggressively and reduces Pixi overlay allocation pressure in the live scene.
- `entitySimulation.ts` is no longer the single owner of all gameplay responsibilities; spawn, combat, and intent-oriented runtime behavior now live in narrower runtime-local modules.
- Hostile local population is currently configured to scale up to `20` active nearby enemies.
- `0.3.0` is prepared from `main` with `npm run release:changelog:validate` and `npm run release:ready:advisory` before promotion to `release`.
