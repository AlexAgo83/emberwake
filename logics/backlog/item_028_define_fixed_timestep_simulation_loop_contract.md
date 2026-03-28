## item_028_define_fixed_timestep_simulation_loop_contract - Define fixed timestep simulation loop contract
> From version: 0.1.1
> Status: Done
> Understanding: 93%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- World and entity updates need an authoritative timing model that is independent from frame rate.
- This slice fixes the fixed-timestep contract so later simulation and movement work stays deterministic.

# Scope
- In: Authoritative update cadence, fixed-step rules, and baseline simulation contract.
- Out: Render interpolation details or debug controls beyond what proves the contract.

```mermaid
%% logics-signature: backlog|define-fixed-timestep-simulation-loop-co|req-007-define-simulation-loop-and-deter|world-and-entity-updates-need-an|ac1-the-request-defines-a-dedicated
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
- AC1 -> Scope: The simulation loop has a dedicated runtime contract. Proof: `src/game/entities/model/entitySimulation.ts`, `src/game/entities/hooks/useEntitySimulation.ts`.
- AC2 -> Scope: The relationship between frame sampling and simulation updates is explicit. Proof: `src/game/entities/hooks/useEntitySimulation.ts`.
- AC3 -> Scope: A strict fixed timestep remains the baseline. Proof: `src/game/entities/model/entitySimulation.ts`.
- AC4 -> Scope: Deterministic stepping remains suitable for debugging and tests. Proof: `src/game/entities/model/entitySimulation.ts`, `src/game/entities/model/entitySimulation.test.ts`.
- AC5 -> Scope: Pause, step, and speed adjustments are supported within the update model. Proof: `src/game/entities/hooks/useEntitySimulation.ts`, `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC6 -> Scope: The loop remains compatible with world and entity layers already implemented. Proof: `src/app/AppShell.tsx`, `src/game/entities/hooks/useEntityWorld.ts`.
- AC7 -> Scope: The slice stays frontend-local and deterministic. Proof: `src/game/entities/hooks/useEntitySimulation.ts`.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Required
- Architecture signals: contracts and integration
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): `adr_004_run_simulation_on_a_fixed_timestep`
- Request: `req_007_define_simulation_loop_and_deterministic_update_model`
- Primary task(s): `task_018_orchestrate_simulation_cadence_debug_controls_and_performance_metrics`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from request `req_007_define_simulation_loop_and_deterministic_update_model`.
- Source file: `logics/request/req_007_define_simulation_loop_and_deterministic_update_model.md`.
- Request context seeded into this backlog item from `logics/request/req_007_define_simulation_loop_and_deterministic_update_model.md`.
- Completed in `task_018_orchestrate_simulation_cadence_debug_controls_and_performance_metrics`.
