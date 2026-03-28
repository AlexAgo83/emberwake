## item_007_add_chunk_visibility_preload_caching_and_rotated_camera_culling - Add chunk visibility preload caching and rotated-camera culling
> From version: 0.1.2
> Status: Done
> Understanding: 95%
> Confidence: 91%
> Progress: 100%
> Complexity: High
> Theme: World
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The map layer needs chunk visibility logic that works with pan, zoom, and rotation instead of assuming an axis-aligned camera forever.
- Visible rendering must remain bounded even if the world itself is effectively infinite.
- Preload and caching rules are needed so chunk streaming remains stable without retaining an unbounded active set.

# Scope
- In:
- Visible chunk resolution from camera and viewport state
- Rotated-camera-aware culling rules
- Small preload margin around the visible area, with one ring of chunks as the default baseline
- Bounded active render set and cache or retention policy
- Out:
- Camera controls themselves
- Base map rendering and overlays
- Debug picking and reset tooling

```mermaid
%% logics-signature: backlog|add-chunk-visibility-preload-caching-and|req-001-render-top-down-infinite-chunked|the-map-layer-needs-chunk-visibility|ac1-visible-chunks-are-resolved-from
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: Visible chunks are resolved from camera and viewport state rather than assuming a fixed world window.
- AC2: Culling remains valid when the camera is rotated and does not rely solely on axis-aligned viewport assumptions.
- AC3: A small preload margin exists around the visible area to reduce popping during movement, with one surrounding chunk ring as the default baseline.
- AC4: Chunks leaving the active area are eligible to leave the active render set under a bounded cache or retention policy.
- AC5: The resulting chunk visibility logic remains compatible with an effectively infinite world.
- AC6: This slice is limited to visibility, preload, cache, and culling behavior rather than map drawing or camera interaction design.

# AC Traceability
- AC1 -> Scope: Visible chunk resolution depends on camera and viewport state. Proof: `src/game/world/model/worldViewMath.ts`, `src/game/world/model/worldViewMath.test.ts`.
- AC2 -> Scope: Culling remains valid with rotated camera state. Proof: `src/game/world/model/worldViewMath.ts`, `src/game/world/model/worldViewMath.test.ts`.
- AC3 -> Scope: Small preload margin is defined around visible chunks. Proof: `src/game/world/hooks/useVisibleChunkSet.ts`.
- AC4 -> Scope: Off-area chunks leave the active set under a bounded retention policy. Proof: `src/game/world/hooks/useVisibleChunkSet.ts`, `src/app/AppShell.tsx`.
- AC5 -> Scope: Logic remains compatible with effectively infinite world traversal. Proof: `src/game/world/hooks/useVisibleChunkSet.ts`, `src/game/world/model/worldContract.ts`.
- AC6 -> Scope: Slice is limited to visibility, preload, cache, and culling. Proof: `src/game/world/hooks/useVisibleChunkSet.ts`.

# Decision framing
- Product framing: Required
- Product signals: conversion journey, navigation and discoverability, engagement loop
- Product follow-up: Create or link a product brief before implementation moves deeper into delivery.
- Architecture framing: Required
- Architecture signals: contracts and integration, runtime and boundaries, delivery and operations
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): `prod_002_readable_world_traversal_and_presence`
- Architecture decision(s): `adr_003_define_coordinate_spaces_and_camera_contract`, `adr_005_make_world_identity_deterministic_from_seed_and_coordinates`
- Request: `req_001_render_top_down_infinite_chunked_world_map`
- Primary task(s): `task_013_orchestrate_world_render_and_chunk_visibility_foundation`

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from request `req_001_render_top_down_infinite_chunked_world_map`.
- Source file: `logics/request/req_001_render_top_down_infinite_chunked_world_map.md`.
- Request context seeded into this backlog item from `logics/request/req_001_render_top_down_infinite_chunked_world_map.md`.
- This slice provides the streaming and culling rules that make the infinite-world model practical.
