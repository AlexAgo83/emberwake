## task_018_orchestrate_simulation_cadence_debug_controls_and_performance_metrics - Orchestrate simulation cadence, debug controls, and performance metrics
> From version: 0.1.3
> Status: Done
> Understanding: 95%
> Confidence: 93%
> Progress: 100%
> Complexity: High
> Theme: Runtime
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog items `item_028_define_fixed_timestep_simulation_loop_contract`, `item_029_define_render_and_simulation_cadence_separation`, `item_030_define_pause_step_and_simulation_speed_debug_controls`, `item_047_define_core_runtime_performance_budgets_and_mobile_reference_target`, `item_048_define_the_standard_in_app_diagnostics_metric_set`, and `item_049_define_profiling_workflow_and_regression_review_expectations`.
- Related request(s): `req_007_define_simulation_loop_and_deterministic_update_model`, `req_012_define_performance_budgets_profiling_and_diagnostics`.
- A fixed-step entity loop exists, but the runtime still lacks explicit cadence controls, standard metrics, and profiling posture.
- This orchestration task groups the runtime controls and metrics needed to keep growth debuggable.

# Dependencies
- Blocking: `task_009_implement_fixed_step_entity_movement_and_state_update_loop`, `task_014_orchestrate_entity_world_integration_and_debug_presentation`.
- Unblocks: reliable perf budgets, richer browser smoke tests, and later density-heavy gameplay work.

```mermaid
%% logics-signature: task|orchestrate-simulation-cadence-debug-con|item-028-define-fixed-timestep-simulatio|1-formalize-cadence-separation-and-fixed|npm-run-ci
flowchart LR
    Loop[item_028 fixed-step contract] --> Runtime[Controlled simulation runtime]
    Cadence[item_029 render vs simulation cadence] --> Runtime
    Debug[item_030 pause step speed] --> Runtime
    Budget[item_047 performance budgets] --> Runtime
    Metrics[item_048 diagnostics metric set] --> Runtime
    Profile[item_049 profiling workflow] --> Runtime
```

# Plan
- [x] 1. Formalize cadence separation and fixed-step runtime behavior at the app level.
- [x] 2. Add pause, single-step, and simulation-speed controls for debug operation.
- [x] 3. Standardize runtime diagnostics metrics, performance targets, and profiling review posture.
- [x] 4. Validate the runtime and update linked Logics docs.
- [x] FINAL: Create a dedicated git commit for this orchestration scope.

# AC Traceability
- `item_028` -> Fixed-step simulation loop contract is explicit across runtime subsystems. Proof: `src/game/entities/model/entitySimulation.ts`, `src/game/entities/hooks/useEntitySimulation.ts`.
- `item_029` -> Render cadence and simulation cadence are intentionally separated. Proof: `src/game/entities/hooks/useEntitySimulation.ts`, `src/game/render/RuntimeSurface.tsx`, `src/app/AppShell.tsx`.
- `item_030` -> Pause, step, and speed controls exist for debug use. Proof: `src/game/entities/hooks/useEntitySimulation.ts`, `src/game/debug/ShellDiagnosticsPanel.tsx`.
- `item_047` -> Performance budgets and reference targets are explicit. Proof: `src/shared/constants/performanceBudget.ts`, `src/game/debug/ShellDiagnosticsPanel.tsx`.
- `item_048` -> Standard in-app metrics are visible and consistent. Proof: `src/game/debug/ShellDiagnosticsPanel.tsx`, `src/app/AppShell.tsx`.
- `item_049` -> Profiling and regression review workflow is documented and usable. Proof: `README.md`, `logics/tasks/task_018_orchestrate_simulation_cadence_debug_controls_and_performance_metrics.md`.

# Decision framing
- Product framing: Consider
- Product signals: engagement loop, navigation and discoverability
- Product follow-up: Keep the runtime focused on readability and responsiveness rather than over-instrumenting player-facing surfaces.
- Architecture framing: Required
- Architecture signals: runtime and boundaries, delivery and operations
- Architecture follow-up: Keep alignment with `adr_004` and `adr_006`.

# Links
- Product brief(s): `prod_000_initial_single_entity_navigation_loop`, `prod_003_high_density_top_down_survival_action_direction`
- Architecture decision(s): `adr_004_run_simulation_on_a_fixed_timestep`, `adr_006_standardize_debug_first_runtime_instrumentation`
- Backlog item(s): `item_028_define_fixed_timestep_simulation_loop_contract`, `item_029_define_render_and_simulation_cadence_separation`, `item_030_define_pause_step_and_simulation_speed_debug_controls`, `item_047_define_core_runtime_performance_budgets_and_mobile_reference_target`, `item_048_define_the_standard_in_app_diagnostics_metric_set`, `item_049_define_profiling_workflow_and_regression_review_expectations`
- Request(s): `req_007_define_simulation_loop_and_deterministic_update_model`, `req_012_define_performance_budgets_profiling_and_diagnostics`

# Validation
- `npm run ci`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Done (DoD)
- [x] Covered backlog items are implemented or explicitly split further with updated traceability.
- [x] Simulation cadence and diagnostics are explicit enough to support future performance-sensitive work.
- [x] Linked backlog/task docs are updated with proofs and status.
- [x] A dedicated git commit has been created for the completed orchestration scope.
- [x] Status is `Done` and progress is `100%`.

# Report
- Made the fixed-step simulation contract explicit in the runtime hook, including capped catch-up behavior and a controlled separation between frame sampling and simulation updates.
- Added debug-only simulation controls for pause, single-step, and speed multipliers without leaking those controls into the player-facing HUD.
- Expanded the diagnostics panel with runtime cadence metrics such as frame time, FPS, tick, steps per frame, accumulator, entity speed, and explicit mobile reference targets.
- Documented the early profiling workflow in the repository README so performance changes can be reviewed against the same deterministic runtime posture.
- Validation passed with:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - runtime browser verification of pause, step, resume, speed changes, and diagnostics visibility
