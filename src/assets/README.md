# Asset Layout

This folder separates source, placeholder, and runtime-ready assets across the
four active domains:

- `map`
- `entities`
- `overlays`
- `shell`

Per domain:
- `source/` contains authoring files or imported source material.
- `placeholders/` contains lightweight debug or prototype assets.
- `runtime/` contains files that are allowed to ship directly before atlas
  generation becomes necessary.

Current naming posture:
- use lowercase names
- separate segments with `.`
- keep domain first, role second, and lifecycle last
- keep the filename stem equal to the `assetId`

Default entity-facing posture:
- authored entity assets should treat `right` as the default facing
- directional variants should be named and reviewed relative to that `right` baseline

Drop-in delivery rule:
- list the `assetId` once in the catalog or source data
- author the file
- place it into the matching domain and stage directory
- keep the filename stem equal to the `assetId`
- let the shared resolver discover it without per-asset code

Directory contract:
- runtime file: `src/assets/<domain>/runtime/<assetId>.<ext>`
- placeholder file: `src/assets/<domain>/placeholders/<assetId>.<ext>`
- source file: `src/assets/<domain>/source/<assetId>.<ext-or-authoring-format>`
- optional metadata sidecar: `src/assets/<domain>/<stage>/<assetId>.meta.json`

Examples:
- `map.terrain.emberplain.placeholder.svg`
- `entity.player.primary.runtime.png`
- `overlay.system.fullscreen-button.runtime.svg`
- `entity.player.primary.runtime.meta.json`

Fallback contract:
1. resolve the exact runtime file whose stem matches the `assetId`
2. if missing, resolve the exact placeholder file whose stem matches the `assetId`
3. if still missing, fall back to the procedural or inline visual owned by code

Metadata is optional and should only exist for non-default cases such as:
- custom pivot or anchor
- explicit logical size overrides
- variants that cannot be inferred from the base file
- frame-based animation data
- custom render offsets

The typed contract for sizing, pivots, packaging, and runtime loading lives in
`src/shared/config/assetPipeline.ts`.
