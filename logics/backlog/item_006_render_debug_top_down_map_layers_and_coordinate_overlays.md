## item_006_render_debug_top_down_map_layers_and_coordinate_overlays - Render debug top-down map layers and coordinate overlays
> From version: 0.1.0
> Status: Done
> Understanding: 94%
> Confidence: 90%
> Progress: 100%
> Complexity: High
> Theme: World
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The map layer needs a visible top-down rendering pass that makes chunks, tiles or cells, and coordinates inspectable before final art direction exists.
- Base map rendering, chunk overlays, and future object layers must be separated from the start.
- The first rendered output should validate the world model visually without depending on a final generation system.

# Scope
- In:
- Debug-friendly top-down map rendering
- Base map layer plus chunk and coordinate overlays
- Deterministic or stubbed chunk content for visual validation
- Separation of render layers for future terrain, chunk, and object content
- Out:
- Camera controls and gestures
- Chunk visibility and culling strategy
- Picking, reset, and diagnostic tooling beyond the visible overlays themselves

```mermaid
%% logics-signature: backlog|render-debug-top-down-map-layers-and-coo|req-001-render-top-down-infinite-chunked|the-map-layer-needs-a-visible|ac1-the-visible-world-is-rendered
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: The visible world is rendered in a top-down debug-friendly form with chunk boundaries and tile or cell structure clearly inspectable.
- AC2: Deterministic or stubbed chunk content can be rendered without requiring final procedural generation logic.
- AC3: Render layers are separated so base map content, chunk overlays, and future object layers can evolve independently.
- AC4: Coordinate overlays or labels make the world model visually inspectable during development.
- AC5: This slice validates the world rendering surface visually without taking on camera-control or culling logic.
- AC6: The rendered output remains compatible with later chunk-visibility and entity-layer work.

# AC Traceability
- AC1 -> Scope: Top-down debug rendering exposes chunks and tile or cell structure. Proof: `src/game/world/render/WorldScene.tsx`.
- AC2 -> Scope: Deterministic or stubbed chunk content can be rendered. Proof: `src/game/world/model/chunkDebugData.ts`.
- AC3 -> Scope: Render layers are explicitly separated. Proof: `src/game/world/render/WorldScene.tsx`.
- AC4 -> Scope: Coordinate overlays or labels support inspection. Proof: `src/game/world/render/WorldScene.tsx`, `.playwright-cli/page-2026-03-17T07-29-32-017Z.png`.
- AC5 -> Scope: Slice stays focused on visible map rendering, not camera or culling logic. Proof: `src/game/world/render/WorldScene.tsx`.
- AC6 -> Scope: Output remains reusable for later culling and entity layers. Proof: `src/game/render/RuntimeSurface.tsx`, `src/game/world/render/WorldScene.tsx`.

# Decision framing
- Product framing: Required
- Product signals: conversion journey, navigation and discoverability, engagement loop
- Product follow-up: Create or link a product brief before implementation moves deeper into delivery.
- Architecture framing: Required
- Architecture signals: contracts and integration, runtime and boundaries, delivery and operations
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): `prod_000_initial_single_entity_navigation_loop`, `prod_002_readable_world_traversal_and_presence`
- Architecture decision(s): `adr_002_separate_react_shell_from_pixi_runtime_ownership`, `adr_003_define_coordinate_spaces_and_camera_contract`, `adr_006_standardize_debug_first_runtime_instrumentation`
- Request: `req_001_render_top_down_infinite_chunked_world_map`
- Primary task(s): `task_013_orchestrate_world_render_and_chunk_visibility_foundation`

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from request `req_001_render_top_down_infinite_chunked_world_map`.
- Source file: `logics/request/req_001_render_top_down_infinite_chunked_world_map.md`.
- Request context seeded into this backlog item from `logics/request/req_001_render_top_down_infinite_chunked_world_map.md`.
- This slice gives the map layer a visible debug render before streaming and tooling are added.
