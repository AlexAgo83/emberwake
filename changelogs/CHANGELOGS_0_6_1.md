# Emberwake 0.6.1

## Highlights

- Clarified key shell surfaces so the `Main menu`, `Growth`, and related labels read more consistently and the growth screen better explains owned versus projected gains before purchase.
- Fixed an intermittent invisible-wall traversal bug caused by hidden support collider alignment, reducing unfair movement blocking during live runs.
- Shipped a dedicated long-session JS heap-retention wave with new profiling tooling, targeted runtime view churn reduction, and reproducible comparison artifacts for follow-up memory work.

## Shell and progression polish

- Renamed player-facing shell entry points to keep `Skills`, `Talents`, and adjacent menu language aligned across the menu, shell overlays, and growth surfaces.
- Improved `Growth` readability by exposing current and projected talent effects more clearly, alongside the related `AppMetaScenePanel` and `GrowthScene` layout polish needed to support that readback.
- Tightened the related shell presentation tests so the menu and meta-scene copy remain stable through future UI waves.

## Runtime fixes and profiling

- Corrected hidden support-collider behavior that could leave the player blocked by effectively invisible traversal obstacles.
- Added long-session heap analysis tooling, including constructor-family snapshot comparisons and a readable profiling build path for retained-owner attribution.
- Removed avoidable runtime presentation churn by stopping redundant state normalization in the render presentation path and by passing selected-entity identity through the runtime shell instead of cloning every visible entity for selection state.
- Added runtime profiling counters for tracked entities, visible entities, and level-up choice pressure, then updated the profiling bridge and harness so automated runs can dismiss level-up pauses instead of falsely stalling the validation session.

## Technical Notes

- The final `left-right-pendulum` 120 s validation run completed with `stalledSampleCount = 0` and reduced heap growth by about `19.1 MB` compared with the earlier `2026-03-29T10:32:48.699Z` pendulum baseline.
- The reduced-pressure `eastbound-drift` 120 s comparison run also completed with `stalledSampleCount = 0` and landed about `33.6 MB` below the final pendulum run, giving the release a cleaner before/after profiling matrix.
- Release preparation keeps `package.json` as the source of truth for the app version and promotes this changelog as the release-notes source for `v0.6.1`.

## Validation

- `npm run release:changelog:validate`
- `npm run release:ready:advisory`
- `python3 logics/skills/logics-version-release-manager/scripts/publish_version_release.py --version 0.6.1 --notes-file changelogs/CHANGELOGS_0_6_1.md --dry-run`
