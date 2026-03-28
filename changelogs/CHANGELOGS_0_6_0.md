# Emberwake 0.6.0

## Highlights

- Expanded the survivor-style combat roster with a full second wave of active and passive skills, then completed the remaining first-wave fusion pairings so more build paths stay viable deeper into a run.
- Added shell-owned meta progression with persistent gold, permanent talent ranks, unlockable roster/shop lanes, and cross-run bestiary/grimoire progression so runs now feed a lasting profile instead of ending in isolation.
- Shipped a broader runtime pressure wave with update prompts, save toasts, utility-drop refresh rules, crystal magnet flow, hourglass time-stop pickups, stronger boss escalation, and cleaner game-over damage analysis.

## Meta progression and shell surfaces

- Added a dedicated `Growth` scene in the shell with unlockable shop entries, escalating permanent talent ranks, and a visible persistent gold balance.
- Persisted the meta profile across runs, including banked gold, bestiary discovery, grimoire discovery, and defeat-count archive progress.
- Added shell toast delivery for save-game feedback and a browser/PWA update prompt so deployed builds can announce refresh-ready updates more cleanly.

## Combat, pickups, and pressure escalation

- Added a second-wave skill roster spanning proximity control, chain damage, trail pressure, freeze control, vacuum play, survivability, and economy-focused passives.
- Completed the missing fusion outcomes for `Cinder Arc + Echo Thread` and `Null Canister + Vacuum Tabi`, then exposed them through the runtime build system.
- Added new hostile archetypes, increased boss scale and durability pressure, layered boss-defeat escalation on top of time phases, and introduced boss-spawn shell warning toasts.
- Added new utility-drop behavior with magnet and hourglass pickups, stronger crystal-attraction logic, attraction-first XP collection, stale offscreen utility cleanup, and safer utility respawn pressure.

## UX and readability polish

- Reworked blocking obstacle visibility so non-traversable tiles read much more clearly during play.
- Improved the game-over skill ranking with damage-share progress bars and stronger comparative readback.
- Tightened shell archive and growth layouts so content-heavy scenes remain more readable and less visually noisy.

## Technical Notes

- Expanded runtime validation coverage across build progression, entity simulation, hostile intent, shell growth interactions, and persistent meta-profile storage.
- Recalibrated the shell-startup byte budget contract for the broader `0.6.0` shell surface while keeping request-count and lazy-runtime activation limits unchanged.
- Hardened pickup, crystal, and floating-number handling so long sessions avoid several stale-state and respawn-pressure edge cases seen in the `0.5.x` line.
- Closed the large post-`0.5.1` Logics execution waves so shipped runtime changes and workflow traceability stay aligned before the next release promotion.

## Validation

- `npm run release:changelog:validate`
- `npm run release:ready:advisory`
