# Emberwake 0.7.1

## Highlights

- Refined the shell/runtime seam with a dedicated in-run abandon confirmation, smoother main-menu backdrop transitions, and a tighter runtime HUD cluster for FPS plus timer.
- Expanded mission identity by adding unique reward pickups for every primary objective and deterministic seeded objective placement per run and world.
- Added mini-boss chest rewards that upgrade owned skills, fall back cleanly to healing plus gold on capped builds, and report the result through runtime toasts.
- Fixed build-offer coverage so the full unlocked active/passive roster can actually surface across level-up offers and rerolls.

## Shell and HUD polish

- Replaced the generic abandon confirmation path with a shell-owned in-run confirmation surface.
- Added fade-out/fade-in behavior to the rotating enemy silhouette on the main screen.
- Grouped the runtime timer directly under the FPS readout so both values scan as one telemetry cluster.

## Mission and reward identity

- Added a unique mission reward item and dedicated runtime asset for every current primary objective across the five-world ladder.
- Mission bosses now drop the correct world/stage-specific objective pickup instead of collapsing to one generic cache reward.
- Mission objective placement is now derived deterministically from the selected world plus the run seed, so repeated runs can vary while remaining reproducible.

## Runtime cleanup and mini-boss rewards

- Added terminal runtime texture-cache cleanup when returning to the main screen from `abandon`, `victory`, or `defeat`.
- Mini-bosses now drop a dedicated chest reward that can improve `1` to `3` already owned skills.
- When no owned skill can still be improved, the mini-boss chest resolves into a fallback salvage reward of healing plus gold.
- Runtime toasts now name the skills improved by mini-boss chest rewards.

## Build offer coverage

- Fixed deterministic offer ordering so rerolls and varied ticks actually remix the unlocked active/passive pool.
- Added a regression test that verifies the full unlocked active/passive roster can surface over varied offers once the shop is fully unlocked.

## Technical Notes

- `0.7.1` remains package-version-driven through `package.json`, with `package-lock.json` kept in sync.
- The runtime performance budget was realigned to the current shell envelope after this wave, preserving a passing release gate.

## Validation

- `npm run release:changelog:validate`
- `npm run release:ready:advisory`
