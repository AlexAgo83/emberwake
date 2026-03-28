## item_047_define_core_runtime_performance_budgets_and_mobile_reference_target - Define core runtime performance budgets and mobile reference target
> From version: 0.1.1
> Status: Done
> Understanding: 93%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Performance
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The runtime needs an explicit baseline for acceptable performance instead of qualitative language only.
- This slice defines the core budgets and mobile reference target that later rendering and simulation work should respect.

# Scope
- In: Core budgets, reference mobile target, and high-level performance expectations.
- Out: Instrumentation metric details or profiling workflow mechanics.

```mermaid
%% logics-signature: backlog|define-core-runtime-performance-budgets-|req-012-define-performance-budgets-profi|the-runtime-needs-an-explicit-baseline|ac1-the-request-defines-dedicated-perfor
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
- AC5: The request treats controlled-entity position, speed or movement vector, current chunk, and camera state as part of the preferred first in-app diagnostic set.
- AC6: The request remains compatible with the debug overlay and diagnostics direction already anticipated.
- AC7: The request addresses profiling expectations appropriate for a frontend-only static application.
- AC8: The request remains compatible with mobile and large-screen usage expectations.
- AC9: The request does not assume backend telemetry or paid observability tooling.

# AC Traceability
- AC1 -> Scope: Performance expectations are explicit in runtime constants and diagnostics. Proof: `src/shared/constants/performanceBudget.ts`, `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC2 -> Scope: Early metrics and budgets cover runtime cadence and render/world state. Proof: `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC3 -> Scope: A mobile-sized reference target is explicit. Proof: `src/shared/constants/performanceBudget.ts`, `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC4 -> Scope: FPS and frame time are visible in-app. Proof: `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC5 -> Scope: Camera, chunk, entity position, and speed signals are included. Proof: `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC6 -> Scope: Budgets remain compatible with the existing debug overlay direction. Proof: `src/app/AppShell.tsx`, `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC7 -> Scope: Profiling expectations are documented for a frontend-only app. Proof: `README.md`.
- AC8 -> Scope: Reference budgets stay compatible with mobile and large-screen layouts. Proof: `src/shared/constants/performanceBudget.ts`, `src/app/hooks/useLogicalViewportModel.ts`.
- AC9 -> Scope: The slice does not rely on backend telemetry. Proof: `README.md`, `src/game/debug/ShellDiagnosticsPanel.tsx`.

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
- Urgency: Medium

# Notes
- Derived from request `req_012_define_performance_budgets_profiling_and_diagnostics`.
- Source file: `logics/request/req_012_define_performance_budgets_profiling_and_diagnostics.md`.
- Request context seeded into this backlog item from `logics/request/req_012_define_performance_budgets_profiling_and_diagnostics.md`.
- Completed in `task_018_orchestrate_simulation_cadence_debug_controls_and_performance_metrics`.
