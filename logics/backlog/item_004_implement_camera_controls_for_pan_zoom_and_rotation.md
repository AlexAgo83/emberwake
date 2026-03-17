## item_004_implement_camera_controls_for_pan_zoom_and_rotation - Implement camera controls for pan zoom and rotation
> From version: 0.1.3
> Status: Done
> Understanding: 96%
> Confidence: 92%
> Progress: 100%
> Complexity: High
> Theme: World
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The world-map layer needs a concrete camera manipulation contract from the start: pan, zoom, and rotation.
- Desktop and mobile controls must be explicit so map navigation does not become an emergent side effect of trial-and-error gestures.
- The full camera kit should exist early for debugging and world inspection even if the first player-facing loop keeps zoom and rotation out of its primary controls.
- Camera behavior needs stable pivot, bounds, and reset rules before chunk visibility and world rendering build on top of it.

# Scope
- In:
- Desktop control mapping for pan, zoom, and rotation
- Mobile gesture mapping for pan, zoom, and rotation
- Camera pivot, zoom bounds, free-form rotation, and reset behavior
- Camera-centered origin and initial navigation contract
- Out:
- Chunk identity and world-seed model
- Map rendering and chunk visibility logic
- Diagnostics and picking beyond what is strictly needed to validate camera behavior

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: The default desktop controls are explicit, with pointer drag for pan, mouse wheel for zoom, and keyboard rotation controls such as `Q` and `E`.
- AC2: The default mobile controls are explicit, with one-finger pan, pinch-to-zoom, and two-finger rotation as the baseline gesture model.
- AC3: Zoom and rotation behave around a defined pivot rule, preferably the viewport center by default.
- AC4: Zoom is constrained by explicit minimum and maximum bounds.
- AC5: Rotation is free-form by default and camera reset actions can restore position, zoom, and rotation to a known state.
- AC6: The camera contract remains compatible with later chunked-world rendering without requiring a camera rewrite, while still allowing pan, zoom, and rotation to stay debug-oriented in the first player loop.

# AC Traceability
- AC1 -> Scope: Desktop camera controls are explicit. Proof: `src/game/camera/hooks/useCameraController.ts`.
- AC2 -> Scope: Mobile camera gestures are explicit. Proof: `src/game/camera/hooks/useCameraController.ts`.
- AC3 -> Scope: Camera pivot rule is defined. Proof: `src/game/camera/model/cameraMath.ts`.
- AC4 -> Scope: Zoom bounds are defined. Proof: `src/game/camera/constants/cameraContract.ts`, `src/game/camera/model/cameraMath.ts`.
- AC5 -> Scope: Free-form rotation and reset behavior are defined. Proof: `src/game/camera/constants/cameraContract.ts`, `src/app/AppShell.tsx`.
- AC6 -> Scope: Camera contract remains reusable for later chunked-world slices. Proof: `src/game/debug/ShellDiagnosticsPanel.tsx`, `src/game/camera/model/cameraMath.ts`.

# Decision framing
- Product framing: Required
- Product signals: conversion journey, navigation and discoverability, engagement loop
- Product follow-up: Create or link a product brief before implementation moves deeper into delivery.
- Architecture framing: Required
- Architecture signals: contracts and integration, runtime and boundaries, delivery and operations
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): `adr_003_define_coordinate_spaces_and_camera_contract`
- Request: `req_001_render_top_down_infinite_chunked_world_map`
- Primary task(s): `task_007_implement_camera_controls_for_pan_zoom_and_rotation`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from request `req_001_render_top_down_infinite_chunked_world_map`.
- Source file: `logics/request/req_001_render_top_down_infinite_chunked_world_map.md`.
- Request context seeded into this backlog item from `logics/request/req_001_render_top_down_infinite_chunked_world_map.md`.
- This slice defines the manipulation contract that later map rendering and chunk visibility depend on.
