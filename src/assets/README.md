# Asset Layout

This folder separates source, placeholder, and runtime-ready assets across the
three initial domains:

- `map`
- `entities`
- `overlays`

Per domain:
- `source/` contains authoring files or imported source material.
- `placeholders/` contains lightweight debug or prototype assets.
- `runtime/` contains files that are allowed to ship directly before atlas
  generation becomes necessary.

Current naming posture:
- use lowercase names
- separate segments with `.`
- keep domain first, role second, and lifecycle last

Examples:
- `map.terrain.emberplain.placeholder.svg`
- `entity.player.primary.placeholder.svg`
- `overlay.system.fullscreen-button.runtime.svg`

The typed contract for sizing, pivots, packaging, and runtime loading lives in
`src/shared/config/assetPipeline.ts`.
