# Emberwake 0.2.1

## Highlights

- Realigned the release tag with the current green `release` branch after `0.2.0` exposed a flaky browser smoke gate in GitHub Actions.
- Matched the browser smoke simulation-step budget to the runtime clamp actually enforced by the unified frame loop.
- Stabilized frame-pacing smoke validation around recent-window telemetry so CI keeps checking meaningful runtime behavior without failing on noisy cumulative ratios.

## Technical Notes

- This patch release contains only post-`v0.2.0` release stabilization commits: `ee7e579`, `dac40de`, and `30a7344`.
- Browser smoke now evaluates the most recent sampled frame window and keeps the robust per-frame burst checks while dropping the flaky catch-up ratio gate that regressed on GitHub runners.
- `0.2.1` is validated from the current `release` branch state with `npm run release:changelog:validate` and `npm run release:ready` before tagging.
