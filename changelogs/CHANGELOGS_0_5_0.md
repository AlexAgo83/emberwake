# Emberwake 0.5.0

## Highlights

- Turned the first playable combat loop into a fuller survivor-style run structure with active weapons, passive seals, curated fusions, level-up choice panels, chest rewards, and stronger build-facing HUD support.
- Added techno-shinobi codex/archive surfaces, skill iconography, post-run skill ranking, and time-owned difficulty phases so the shell now explains more of the game instead of only hosting it.
- Hardened runtime long-session profiling with repeatable pendulum scenarios, auto-picked build choices, heap snapshots, mobile replay support, and pickup compaction work that reduced the worst runaway session failures.

## Build loop and progression

- Added the first authored roster of active weapons, passive modifiers, and curated fusion paths, all surfaced through runtime build-choice selection and persistent run-state summary data.
- Added time-driven run progression phases with stronger hostile composition over time, mini-boss beats, and a first tuning pass across XP growth, hostile durability, economy pacing, and pressure escalation.
- Added post-run skill ranking support so outcome surfaces can compare the strongest tools used during the run instead of only showing a flat recap.

## Shell, HUD, and codex surfaces

- Reworked the runtime HUD into a more compact techno-shinobi split layout with active/passive slot reservation, icon-first build tracking, cleaner mobile behavior, and less shell chrome noise during play.
- Added player-facing `Grimoire` and `Bestiary` scenes with discovery-gated archive entries so the shell now teaches skills and encountered creatures directly.
- Tightened shell scene reachability and viewport posture across `Pause`, `Game over`, `Grimoire`, `Bestiary`, and other content-heavy surfaces so the most important actions stay reachable more reliably.

## Combat feedback and runtime profiling

- Added a first transient combat-skill feedback layer so the main playable weapons and their fusion states now produce readable techno-shinobi traces, bursts, pulses, and zone markers in runtime.
- Hardened profiling automation with scenario auto-picks, `4x` simulation replay in Playwright, mobile/headed replay options, and structured runtime counters written to `output/playwright/long-session/`.
- Reduced long-session pickup runaway behavior by compacting nearby and off-player pickup clusters into larger stacks, then added heap-snapshot capture to investigate remaining memory pressure with more useful evidence.

## Technical Notes

- Added the `--mobile` profiling runner mode and documented the repeatable pendulum scenario used most often for long-session memory and pickup-pressure investigation.
- Normalized shell and gameplay-system state more defensively so persisted or partially migrated runtime/system snapshots no longer crash the app during hydration.
- Kept workflow traceability aligned with shipped code by splitting the pending viewport-safe shell scroll contract into backlog items and an orchestration task for later implementation.

## Validation

- `npm run release:changelog:validate`
- `npm run release:ready:advisory`
- `npm run test -- AppMetaScenePanel`
