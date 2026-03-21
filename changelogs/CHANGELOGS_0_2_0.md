# Emberwake 0.2.0

## Highlights

- Reworked the live runtime around a modular `app / engine-core / engine-pixi / games/emberwake` topology so shell, reusable engine contracts, Pixi composition, and Emberwake gameplay are now separated by explicit public boundaries.
- Added shell-owned scene orchestration for runtime, pause, settings, defeat, and victory, with lazy runtime boot behind a dedicated boundary instead of eager Pixi startup.
- Unified the live frame loop so Pixi drives visual frames while the engine runner keeps fixed-step simulation authority, frame-pacing telemetry, and sampled diagnostics publication.
- Introduced typed gameplay content catalogs, ordered gameplay systems, gameplay-to-shell outcome contracts, and player-vs-diagnostics render modes for the Emberwake runtime.
- Restored delayed surface interaction reliability for mobile runtime controls, including virtual-stick rebinding after lazy surface mount and regression coverage for related input flows.

## Technical Notes

- The current package version now targets the first post-`0.1.x` runtime architecture wave and is validated through `npm run ci`, `npm run release:changelog:validate`, and `npm run test:browser:smoke`.
- Public TypeScript entrypoints and targeted ESLint rules now protect deep-import boundaries across `@app`, `@engine`, `@engine-pixi`, and `@game`.
- Runtime startup and frame-pacing checks are now backed by explicit performance budgets and browser smoke validation, while the large Pixi vendor chunk remains a tracked delivery risk rather than an ignored warning.
- The repository README now reflects the modular runtime topology, the current release baseline, and the release-oriented validation commands expected before promotion to the `release` branch.
