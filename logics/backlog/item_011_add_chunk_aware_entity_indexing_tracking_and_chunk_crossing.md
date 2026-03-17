## item_011_add_chunk_aware_entity_indexing_tracking_and_chunk_crossing - Add chunk-aware entity indexing tracking and chunk crossing
> From version: 0.1.0
> Status: Done
> Understanding: 92%
> Confidence: 89%
> Progress: 100%
> Complexity: High
> Theme: Entities
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The entity layer needs chunk-aware spatial indexing without making entities permanently owned by one chunk.
- Entities must be able to cross chunk boundaries while preserving identity, continuity, and tracked state.
- Rendering visibility and long-lived tracking must stay distinct so off-screen entities do not disappear from the simulation model.

# Scope
- In:
- Spatial indexing of entities by chunk
- Chunk-boundary crossing behavior
- Distinction between rendered-visible entities and tracked entities outside the viewport
- Continuity of identity and state across visibility changes
- Out:
- Movement update rules
- Debug rendering and visual entity presentation
- Picking, selection, and inspection tooling

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: Entities belong to world space and may be spatially indexed by chunk, but they are not modeled as permanently owned by a single chunk.
- AC2: Entities can cross chunk boundaries while preserving identity, position continuity, and state continuity.
- AC3: The design distinguishes between rendered-visible entities and entities that remain tracked even when not currently visible.
- AC4: Entity state continuity is preserved when entities leave and later re-enter the visible area.
- AC5: Controlled spawn and despawn behavior is compatible with this tracking model.
- AC6: The resulting indexing model remains compatible with a large or effectively infinite chunked world.

# AC Traceability
- AC1 -> Scope: Entities are spatially indexed by chunk without permanent chunk ownership. Proof: `src/game/entities/model/entitySpatialIndex.ts`, `src/game/entities/model/entitySpatialIndex.test.ts`.
- AC2 -> Scope: Chunk crossing preserves identity and continuity. Proof: `src/game/entities/hooks/useEntityWorld.ts`, `src/game/entities/model/entitySimulation.ts`.
- AC3 -> Scope: Tracked and rendered-visible scopes are distinct. Proof: `src/game/entities/hooks/useEntityWorld.ts`, `src/app/AppShell.tsx`.
- AC4 -> Scope: State continuity survives visibility changes. Proof: `src/game/entities/hooks/useEntityWorld.ts`.
- AC5 -> Scope: Spawn and despawn fit the same tracking model. Proof: `src/game/entities/model/entityDebugScenario.ts`, `src/game/entities/hooks/useEntityWorld.ts`.
- AC6 -> Scope: Indexing remains compatible with large or infinite chunked worlds. Proof: `src/game/entities/model/entitySpatialIndex.ts`, `src/game/entities/model/entitySpatialIndex.test.ts`.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Required
- Architecture signals: contracts and integration, delivery and operations
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): `prod_000_initial_single_entity_navigation_loop`, `prod_003_high_density_top_down_survival_action_direction`
- Architecture decision(s): `adr_003_define_coordinate_spaces_and_camera_contract`, `adr_004_run_simulation_on_a_fixed_timestep`, `adr_005_make_world_identity_deterministic_from_seed_and_coordinates`
- Request: `req_002_render_evolving_world_entities_on_the_map`
- Primary task(s): `task_014_orchestrate_entity_world_integration_and_debug_presentation`

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from request `req_002_render_evolving_world_entities_on_the_map`.
- Source file: `logics/request/req_002_render_evolving_world_entities_on_the_map.md`.
- Request context seeded into this backlog item from `logics/request/req_002_render_evolving_world_entities_on_the_map.md`.
- This slice connects the entity model to the chunked world without coupling identity to a single chunk.
