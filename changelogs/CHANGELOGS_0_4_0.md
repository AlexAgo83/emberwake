# Emberwake 0.4.0

## Highlights

- Rebuilt the shell-owned menu family with a full `Techno-shinobi` visual direction across `Main menu`, `New game`, `Settings`, `Changelogs`, runtime command surfaces, and player HUD chrome.
- Tightened runtime shell defaults and HUD behavior so player-facing feedback opens in the right state, changelog navigation remains usable, and leftover non-essential shell copy no longer dilutes the product entry flow.
- Optimized the runtime render hot path by moving world and entity drawing toward local-space retained callbacks and by removing spatial diagnostics work from the default player path unless explicitly opened.

## Shell and HUD overhaul

- Reworked the front door and meta-scene composition so shell surfaces feel like a coherent product family instead of a stack of interchangeable translucent cards.
- Reframed `Settings` into a cleaner control-editing surface with explicit action semantics, removed dead explanatory filler, and restored the expected apply affordance.
- Refined runtime chrome by keeping only the most relevant field-status metrics, restoring the runtime feedback level chip, and defaulting shell preferences toward player-facing feedback instead of debug-first inspection.
- Fixed shell regressions discovered during the rewamp, including constrained-height changelog scrolling and the missing bottom `Back to menu` action.

## Runtime render and profiling posture

- Reworked `WorldScene` so chunk base visuals draw in local chunk space with stable retained callbacks instead of redoing more camera-coupled work every frame.
- Reworked `EntityScene` so pickups and combatants render from positioned local containers, with memoized pickup drawing and a clearer split between stable geometry and transient combat overlays.
- Gated chunk indexing and overlap detection behind visible diagnostics so the default runtime path no longer pays those costs when the player is simply playing.
- Reprofiled `eastbound-drift`, `traversal-baseline`, and `square-loop` after implementation; the accepted posture preserves strong results on realistic traversal scenarios and explicitly rejects a more aggressive off-screen chunk-cache variant that degraded the simpler drift case.

## Workflow and release hygiene

- Synchronized the supporting Logics request, backlog, ADR, and orchestration docs for both the shell rewamp wave and the runtime render optimization wave so release-facing documentation matches the shipped code.
- Updated the bundled Logics kit submodule to the `1.1.0` line used by the current workspace tooling and changelog guidance.
- `0.4.0` is prepared from `main` with curated release notes, release-readiness checks, and browser/runtime validation before any later promotion to `release`.

## Validation

- `npm run ci`
- `npm run test:browser:smoke`
- `npm run release:changelog:validate`
- `npm run release:ready:advisory`
