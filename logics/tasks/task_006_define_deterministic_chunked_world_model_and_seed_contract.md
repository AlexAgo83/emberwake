## task_006_define_deterministic_chunked_world_model_and_seed_contract - Define deterministic chunked world model and seed contract
> From version: 0.1.3
> Status: Done
> Understanding: 96%
> Confidence: 92%
> Progress: 100%
> Complexity: High
> Theme: World
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog item `item_005_define_deterministic_chunked_world_model_and_seed_contract`.
- Source file: `logics/backlog/item_005_define_deterministic_chunked_world_model_and_seed_contract.md`.
- Related request(s): `req_001_render_top_down_infinite_chunked_world_map`.
- The map layer needs a deterministic chunked world model with stable identity before camera culling and entity indexing can build on it.
- World, chunk, and screen coordinates need explicit transforms grounded in stable logical units rather than pixels.
- A global world seed must exist early enough to support deterministic debug content and later procedural generation.

# Dependencies
- Blocking: `task_002_add_stable_logical_viewport_and_world_space_shell_contract`.
- Unblocks: `task_007_implement_camera_controls_for_pan_zoom_and_rotation`, `task_008_define_entity_contract_and_generic_archetype_baseline`, and later map streaming tasks.

```mermaid
%% logics-signature: task|define-deterministic-chunked-world-model|item-005-define-deterministic-chunked-wo|1-confirm-scope-dependencies-and-linked|python3-logics-skills-logics-doc-linter-
flowchart LR
    Backlog[Backlog source] --> Step1[Implementation step 1]
    Step1 --> Step2[Implementation step 2]
    Step2 --> Step3[Implementation step 3]
    Step3 --> Validation[Validation]
    Validation --> Report[Report and Done]
```

# Plan
- [x] 1. Confirm scope, dependencies, and linked acceptance criteria.
- [x] 2. Implement the scoped changes from the backlog item.
- [x] 3. Validate the result and update the linked Logics docs.
- [x] 4. Create a dedicated git commit for this task scope after validation passes.
- [x] FINAL: Update related Logics docs

# AC Traceability
- AC1 -> Scope: The world model uses fixed square chunks with a default target of `16x16` tiles or logical cells per chunk.. Proof: `src/game/world/model/worldContract.ts`.
- AC2 -> Scope: World, chunk, and screen coordinates are explicitly distinguished and transform cleanly between one another.. Proof: `src/game/world/types.ts`, `src/game/world/model/worldContract.ts`.
- AC3 -> Scope: Stable logical world units and tile sizing are defined independently from raw screen pixels.. Proof: `src/game/world/model/worldContract.ts`.
- AC4 -> Scope: Chunk identity is deterministic from chunk coordinates and compatible with a global world-seed model, starting from a fixed default seed that can be overridden later.. Proof: `src/game/world/model/worldContract.ts`, `src/game/world/model/worldContract.test.ts`.
- AC5 -> Scope: The world model supports positive and negative coordinates and remains compatible with a future infinite-map approach.. Proof: `src/game/world/model/worldContract.ts`, `src/game/world/model/worldContract.test.ts`.
- AC6 -> Scope: This slice provides the deterministic world contract required by later rendering, culling, and entity indexing work.. Proof: `src/game/world/model/worldContract.ts`, `src/game/debug/ShellDiagnosticsPanel.tsx`.

# Decision framing
- Product framing: Required
- Product signals: conversion journey, navigation and discoverability
- Product follow-up: Create or link a product brief before implementation moves deeper into delivery.
- Architecture framing: Required
- Architecture signals: contracts and integration
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): `adr_003_define_coordinate_spaces_and_camera_contract`, `adr_005_make_world_identity_deterministic_from_seed_and_coordinates`
- Backlog item: `item_005_define_deterministic_chunked_world_model_and_seed_contract`
- Request(s): `req_001_render_top_down_infinite_chunked_world_map`

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run lint`
- `npm run typecheck`
- `npm run test`

# Definition of Done (DoD)
- [x] Scope implemented and acceptance criteria covered.
- [x] Validation commands executed and results captured.
- [x] Linked request/backlog/task docs updated.
- [x] A dedicated git commit has been created for the completed task scope.
- [x] Status is `Done` and progress is `100%`.

# Report
- Added a deterministic world contract with fixed `16x16` chunks, stable tile sizing in world units, and an overrideable global seed.
- Added explicit world/chunk/screen coordinate types and shared projection helpers so later camera and picking work build on named conversions instead of ad hoc math.
- Added deterministic chunk identity and signature helpers plus unit tests covering negative coordinates and projection round-trips.
- Validation passed with:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
