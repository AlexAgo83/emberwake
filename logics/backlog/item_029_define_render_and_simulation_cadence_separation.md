## item_029_define_render_and_simulation_cadence_separation - Define render and simulation cadence separation
> From version: 0.1.1
> Status: Done
> Understanding: 93%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Rendering and simulation must not be treated as the same execution loop.
- This slice defines how frame-driven drawing and fixed-step updates relate so timing responsibilities stay clear.

# Scope
- In: Render-vs-simulation responsibilities, cadence boundaries, and update ownership.
- Out: Debug stepping controls or full entity movement logic.

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: The request defines a dedicated simulation-loop scope rather than leaving update timing implicit inside rendering concerns.
- AC2: The request defines the relationship between simulation updates and rendering frames.
- AC3: The request treats a strict fixed-timestep simulation loop as the intended baseline for logic updates.
- AC4: The request defines a deterministic or reproducible update expectation suitable for debugging and automated testing.
- AC5: The request covers pause, simulation stepping, and speed-adjustment expectations where they affect the update model.
- AC6: The request remains compatible with the world and entity requests already written.
- AC7: The request does not prematurely assume multiplayer or backend-driven synchronization.

# AC Traceability
- AC1 -> Scope: Simulation timing stays distinct from rendering concerns. Proof: `src/game/entities/hooks/useEntitySimulation.ts`, `src/game/render/RuntimeSurface.tsx`.
- AC2 -> Scope: Render frames and simulation updates have explicit separate responsibilities. Proof: `src/game/entities/hooks/useEntitySimulation.ts`, `src/app/AppShell.tsx`.
- AC3 -> Scope: Fixed-step logic updates remain authoritative. Proof: `src/game/entities/model/entitySimulation.ts`, `src/game/entities/hooks/useEntitySimulation.ts`.
- AC4 -> Scope: Deterministic stepping remains reproducible. Proof: `src/game/entities/model/entitySimulation.test.ts`.
- AC5 -> Scope: Pause, step, and speed controls act on the simulation cadence without redefining render cadence. Proof: `src/game/entities/hooks/useEntitySimulation.ts`, `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC6 -> Scope: Cadence separation remains compatible with world and entity systems. Proof: `src/app/AppShell.tsx`, `src/game/entities/render/EntityScene.tsx`.
- AC7 -> Scope: The slice remains frontend-only. Proof: `src/game/entities/hooks/useEntitySimulation.ts`.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Consider
- Architecture signals: contracts and integration
- Architecture follow-up: Review whether an architecture decision is needed before implementation becomes harder to reverse.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): `adr_004_run_simulation_on_a_fixed_timestep`
- Request: `req_007_define_simulation_loop_and_deterministic_update_model`
- Primary task(s): `task_018_orchestrate_simulation_cadence_debug_controls_and_performance_metrics`

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from request `req_007_define_simulation_loop_and_deterministic_update_model`.
- Source file: `logics/request/req_007_define_simulation_loop_and_deterministic_update_model.md`.
- Request context seeded into this backlog item from `logics/request/req_007_define_simulation_loop_and_deterministic_update_model.md`.
- Completed in `task_018_orchestrate_simulation_cadence_debug_controls_and_performance_metrics`.
