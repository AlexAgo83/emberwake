## adr_021_define_runtime_performance_budgets_and_profiling_at_the_shell_to_runtime_boundary - Define runtime performance budgets and profiling at the shell to runtime boundary
> Date: 2026-03-21
> Status: Accepted
> Drivers: Turn startup cost into an explicit contract; keep Pixi activation measurable after lazy loading; protect a mobile-sensitive product posture with repeatable repository checks instead of reactive local profiling.
> Related request: `req_021_define_the_next_runtime_product_and_gameplay_system_architecture_wave`
> Related backlog: `item_087_define_runtime_performance_budgets_profiling_and_mobile_limits_for_shell_and_pixi_startup`
> Related task: `task_029_orchestrate_runtime_performance_product_meta_flow_and_gameplay_system_architecture`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
Shell startup and runtime activation should be controlled by explicit repository-owned budgets. The primary architecture boundary is not raw bundle size alone. It is the path from shell boot to lazy runtime load to confirmed renderer readiness.

# Context
`task_028` introduced a shell-owned lazy-loading boundary for the Pixi runtime, but the project still lacked a durable way to answer basic product questions:
- how much shell JavaScript is acceptable before runtime activation
- how large the lazy runtime chunk is allowed to grow
- how long the shell can wait before the runtime confirms readiness
- what validation path should fail when those limits drift

Without that posture, performance work would stay anecdotal:
- build warnings would be tuned locally instead of tied to agreed budgets
- runtime readiness regressions would only appear during manual browsing
- mobile-sensitive startup concerns would stay implied instead of enforceable

# Decision
- Define the first runtime budgets in a versioned repository config under `src/shared/config/runtimePerformanceBudget.json`.
- Treat shell startup bytes, lazy runtime bytes, renderer-ready latency, and frame-time expectations as first-class performance architecture signals.
- Use a mobile-sensitive reference device class and viewport in the budget contract rather than treating desktop-only startup as sufficient proof.
- Expose runtime activation metrics from the shell through `window.__EMBERWAKE_RUNTIME_METRICS__` so browser smoke can validate shell-to-runtime readiness directly.
- Keep the first enforcement path lightweight and high-signal:
  - build-time budget validation for shell and lazy runtime chunks
  - browser smoke validation for renderer-ready latency
  - diagnostics visibility inside the shell for local interpretation
- Keep the budget set intentionally narrow until product and rendering density justify deeper CPU, memory, or scene-density gates.

# Alternatives considered
- Rely only on Vite chunk warnings. Rejected because warning thresholds are not a product-facing contract.
- Delay enforcement and only document desired numbers. Rejected because startup drift would remain invisible in the normal validation path.
- Introduce a broad performance platform immediately. Rejected because the current repo only needs a focused boundary budget and repeatable checks.

# Consequences
- Startup cost now has an explicit contract that can fail in CI.
- Shell and runtime-loading boundaries stay measurable as gameplay and rendering density grow.
- Browser smoke becomes a more meaningful release signal because it validates runtime readiness, not only that the page renders.
- The current posture does not yet cover sustained runtime load, memory pressure, or effect-density limits, so later waves may need deeper profiling gates.

# Migration and rollout
- Store performance budgets in shared config so the shell, diagnostics, and scripts read the same contract.
- Validate bundle budgets through a dedicated repository script.
- Extend browser smoke to fail if the runtime does not confirm readiness inside the allowed latency budget.
- Surface the same metrics inside diagnostics so local investigation matches CI evidence.

# References
- `req_021_define_the_next_runtime_product_and_gameplay_system_architecture_wave`
- `item_087_define_runtime_performance_budgets_profiling_and_mobile_limits_for_shell_and_pixi_startup`
- `task_029_orchestrate_runtime_performance_product_meta_flow_and_gameplay_system_architecture`
- `adr_017_lazy_load_pixi_runtime_behind_a_shell_owned_boot_boundary`

# Follow-up work
- Add scene-density and gameplay-density budgets once combat, effects, and autonomous systems become real runtime costs.
- Revisit lazy-runtime chunk strategy if mobile startup pressure grows faster than the current budget envelope.
