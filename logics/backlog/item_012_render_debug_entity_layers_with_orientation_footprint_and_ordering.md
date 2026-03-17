## item_012_render_debug_entity_layers_with_orientation_footprint_and_ordering - Render debug entity layers with orientation footprint and ordering
> From version: 0.1.2
> Status: Done
> Understanding: 93%
> Confidence: 90%
> Progress: 100%
> Complexity: High
> Theme: Entities
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The entity layer needs a visible debug-first render pass that makes orientation, footprint, state, and ordering obvious through simple geometric visuals first.
- Entity rendering must remain world-space aligned under pan, zoom, and rotation.
- Debug visuals need to stay decoupled from final art direction while still validating render-layer assumptions.

# Scope
- In:
- World-space debug rendering for entities
- Visual footprint, facing or orientation marker, and explicit render ordering
- Debug visuals such as shapes, labels, direction markers, state colors, traces, or overlap diagnostics
- Out:
- Simulation update rules
- Chunk indexing ownership rules
- Picking, selection, and inspection UI

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: Entities are rendered in world space and remain visually consistent with camera pan, zoom, and rotation.
- AC2: Debug-friendly visuals expose at least orientation, footprint, and current state through geometric placeholder rendering without depending on final art assets.
- AC3: Render ordering or layer priority for entities is explicit enough to avoid unstable draw order.
- AC4: Optional debug labels, movement traces, or simple overlap diagnostics are available to help inspect entity behavior.
- AC5: This slice remains focused on rendering presentation and does not take on simulation or selection logic.
- AC6: The resulting entity rendering layer remains reusable for later gameplay-facing visuals.

# AC Traceability
- AC1 -> Scope: Entity rendering remains world-space aligned under camera transforms. Proof: `src/game/entities/render/EntityScene.tsx`, `src/game/render/RuntimeSurface.tsx`.
- AC2 -> Scope: Debug visuals expose orientation, footprint, and state. Proof: `src/game/entities/render/EntityScene.tsx`.
- AC3 -> Scope: Entity draw order is explicit and stable. Proof: `src/game/entities/model/entitySpatialIndex.ts`, `src/game/entities/model/entitySpatialIndex.test.ts`.
- AC4 -> Scope: Optional labels, traces, or overlap diagnostics support debugging. Proof: `src/game/entities/render/EntityScene.tsx`, `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC5 -> Scope: Slice stays limited to visual rendering concerns. Proof: `src/game/entities/render/EntityScene.tsx`.
- AC6 -> Scope: Rendering layer remains reusable for later visual upgrades. Proof: `src/game/entities/render/EntityScene.tsx`.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Required
- Architecture signals: contracts and integration, delivery and operations
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): `prod_003_high_density_top_down_survival_action_direction`
- Architecture decision(s): `adr_002_separate_react_shell_from_pixi_runtime_ownership`, `adr_008_define_asset_logical_sizing_and_runtime_packaging_rules`
- Request: `req_002_render_evolving_world_entities_on_the_map`
- Primary task(s): `task_014_orchestrate_entity_world_integration_and_debug_presentation`

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from request `req_002_render_evolving_world_entities_on_the_map`.
- Source file: `logics/request/req_002_render_evolving_world_entities_on_the_map.md`.
- Request context seeded into this backlog item from `logics/request/req_002_render_evolving_world_entities_on_the_map.md`.
- This slice gives entities a debug-visible render pass before richer gameplay visuals exist.
