## item_010_implement_fixed_step_entity_movement_and_state_update_loop - Implement fixed-step entity movement and state update loop
> From version: 0.1.3
> Status: Done
> Understanding: 94%
> Confidence: 91%
> Progress: 100%
> Complexity: High
> Theme: Entities
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The entity layer needs a deterministic update loop that does not depend on arbitrary frame mutations.
- Movement should start as continuous world-space motion driven directly by velocity, without requiring steering, acceleration, collision resolution, or pathfinding yet.
- Evolving entity state needs a simple, reproducible update model that later simulation systems can extend.

# Scope
- In:
- Fixed-step-compatible entity update mindset
- Velocity-based continuous movement with direct input-to-velocity response in the first pass
- Deterministic or debug-driven movement patterns
- Simple evolving state transitions over time
- Out:
- Chunk indexing and visibility ownership
- Entity rendering details and debug visuals
- Selection, inspection, and lifecycle scenario tooling

```mermaid
%% logics-signature: backlog|implement-fixed-step-entity-movement-and|req-002-render-evolving-world-entities-o|the-entity-layer-needs-a-deterministic|ac1-entity-updates-are-compatible-with
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: Entity updates are compatible with a fixed simulation-step mindset even if rendering remains frame-based.
- AC2: Entity movement uses continuous world-space motion and supports direct velocity-based updates in the first pass.
- AC3: Initial movement remains deterministic, scripted, or developer-driven without requiring advanced AI or pathfinding.
- AC4: Entities can expose or transition through evolving state over time, even if the first implementation uses simple placeholder states.
- AC5: Acceleration, collision resolution, combat, and advanced animation remain out of scope for this slice.
- AC6: The resulting movement and state loop is reusable by later indexing, rendering, and behavior slices.

# AC Traceability
- AC1 -> Scope: Entity updates follow a fixed-step-compatible mindset. Proof: `src/game/entities/hooks/useEntitySimulation.ts`, `src/game/entities/model/entitySimulation.ts`.
- AC2 -> Scope: Movement is continuous and velocity-based. Proof: `src/game/entities/model/entitySimulation.ts`, `src/game/entities/model/entitySimulation.test.ts`.
- AC3 -> Scope: Movement remains deterministic or debug-driven without advanced AI. Proof: `src/game/entities/model/entitySimulation.ts`, `src/game/entities/model/entitySimulation.test.ts`.
- AC4 -> Scope: State can evolve over time under the update loop. Proof: `src/game/entities/model/entitySimulation.ts`, `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC5 -> Scope: Collision, combat, and advanced animation remain out of scope. Proof: `src/game/entities/model/entitySimulation.ts`.
- AC6 -> Scope: Update loop remains reusable for later indexing, rendering, and behavior slices. Proof: `src/game/entities/hooks/useEntitySimulation.ts`, `src/app/AppShell.tsx`.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Required
- Architecture signals: contracts and integration, delivery and operations
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): `prod_000_initial_single_entity_navigation_loop`
- Architecture decision(s): `adr_004_run_simulation_on_a_fixed_timestep`
- Request: `req_002_render_evolving_world_entities_on_the_map`
- Primary task(s): `task_009_implement_fixed_step_entity_movement_and_state_update_loop`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from request `req_002_render_evolving_world_entities_on_the_map`.
- Source file: `logics/request/req_002_render_evolving_world_entities_on_the_map.md`.
- Request context seeded into this backlog item from `logics/request/req_002_render_evolving_world_entities_on_the_map.md`.
- This slice provides the simulation baseline that later rendering and inspection slices will observe.
