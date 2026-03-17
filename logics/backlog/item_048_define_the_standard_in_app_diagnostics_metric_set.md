## item_048_define_the_standard_in_app_diagnostics_metric_set - Define the standard in app diagnostics metric set
> From version: 0.1.2
> Status: Done
> Understanding: 94%
> Confidence: 93%
> Progress: 100%
> Complexity: Medium
> Theme: Performance
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Runtime diagnostics need a standard metric set rather than per-feature improvisation.
- This slice defines the in-app metrics that should be visible while developing the shell, world, and first player loop, including a fixed first overlay baseline.

# Scope
- In: Standard runtime metrics, first-loop movement diagnostics, and in-app visibility expectations.
- Out: Performance budget targets or regression governance.

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: The request defines dedicated performance and diagnostics expectations for the frontend application.
- AC2: The request identifies the first metrics or budgets relevant to shell rendering, world rendering, entity rendering, or loading behavior.
- AC3: The request defines an explicit minimum-performance target for a mobile-sized reference experience rather than relying only on qualitative language.
- AC4: The request requires in-app visibility for core diagnostics such as FPS, frame time, and world-load indicators during development.
- AC5: The request treats camera state, controlled-entity position, controlled-entity speed or movement vector, current chunk, and rendered chunk count as part of the preferred first in-app diagnostic set.
- AC6: The request remains compatible with the debug overlay and diagnostics direction already anticipated.
- AC7: The request addresses profiling expectations appropriate for a frontend-only static application.
- AC8: The request remains compatible with mobile and large-screen usage expectations.
- AC9: The request does not assume backend telemetry or paid observability tooling.

# AC Traceability
- AC1 -> Scope: Diagnostics expectations are standardized inside the runtime overlay. Proof: `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC2 -> Scope: The metric set covers shell, world, entity, and cadence signals. Proof: `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC3 -> Scope: The overlay includes an explicit mobile performance target. Proof: `src/shared/constants/performanceBudget.ts`, `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC4 -> Scope: FPS and frame time are visible in-app. Proof: `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC5 -> Scope: Camera, chunk, entity position, and speed all appear in the diagnostics panel. Proof: `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC6 -> Scope: The metric set remains aligned with the existing debug overlay direction. Proof: `src/app/AppShell.tsx`, `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC7 -> Scope: Profiling expectations are documented for the same diagnostic set. Proof: `README.md`.
- AC8 -> Scope: The panel works in mobile and large-screen layouts. Proof: `src/app/styles/app.css`, browser verification captured in `logics/tasks/task_018_orchestrate_simulation_cadence_debug_controls_and_performance_metrics.md`.
- AC9 -> Scope: The implementation remains frontend-local. Proof: `src/game/debug/ShellDiagnosticsPanel.tsx`, `README.md`.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Required
- Architecture signals: contracts and integration, delivery and operations
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): `adr_006_standardize_debug_first_runtime_instrumentation`
- Request: `req_012_define_performance_budgets_profiling_and_diagnostics`
- Primary task(s): `task_018_orchestrate_simulation_cadence_debug_controls_and_performance_metrics`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from request `req_012_define_performance_budgets_profiling_and_diagnostics`.
- Source file: `logics/request/req_012_define_performance_budgets_profiling_and_diagnostics.md`.
- Request context seeded into this backlog item from `logics/request/req_012_define_performance_budgets_profiling_and_diagnostics.md`.
- Completed in `task_018_orchestrate_simulation_cadence_debug_controls_and_performance_metrics`.
