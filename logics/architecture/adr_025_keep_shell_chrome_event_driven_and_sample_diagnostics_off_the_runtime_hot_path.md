## adr_025_keep_shell_chrome_event_driven_and_sample_diagnostics_off_the_runtime_hot_path - Keep shell chrome event driven and sample diagnostics off the runtime hot path
> Date: 2026-03-21
> Status: Accepted
> Drivers: Prevent shell-facing React work from undermining loop unification; keep menu and meta surfaces event-driven; retain diagnostics value without publishing every frame into shell chrome.
> Related request: `req_022_define_a_unified_frame_loop_architecture_for_runtime_stability_and_render_scheduling`
> Related backlog: `item_091_define_hot_path_state_publication_rules_between_runtime_shell_and_diagnostics_surfaces`
> Related task: `task_030_orchestrate_unified_frame_loop_architecture_for_runtime_stability_and_render_scheduling`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
Shell chrome should stay event-driven. Runtime diagnostics may observe live runtime data, but they should not require fully unsampled shell publication on every visual frame.

# Context
Loop unification only solves part of runtime smoothness. The shell still sits around the runtime:
- menu and meta surfaces do not need per-frame updates
- diagnostics are useful, but they are a debugging surface rather than a gameplay-critical render path
- shell callbacks and shell-owned state can accidentally churn if they are recreated every runtime frame

Without explicit rules, the shell can keep unnecessary work on the hot path even after the runtime loop is unified.

# Decision
- Treat the runtime scene as the only shell-adjacent surface that is allowed to remain visual-frame-driven.
- Treat menu and meta surfaces as event-driven shell chrome with stabilized callbacks and memoized components.
- Treat diagnostics as sampled consumers of runtime state rather than strict per-frame mirrors of runtime internals.
- Express the publication modes explicitly in a shell-owned runtime publication contract so the repo has a durable rule for hot-path consumers.
- Keep inspection and diagnostics available, but avoid making them the reason the entire shell must repaint at runtime-frame cadence.

# Alternatives considered
- Leave all shell surfaces subscribed to live runtime cadence. Rejected because it weakens the value of loop unification.
- Remove diagnostics from the shell. Rejected because diagnostics remain useful during pre-alpha development.
- Build a larger shell-state framework immediately. Rejected because the current need is focused on publication mode, not global UI architecture.

# Consequences
- Menu and meta surfaces are less likely to rerender gratuitously during runtime motion.
- Diagnostics remain informative while imposing less continuous churn when opened.
- The publication posture is now explicit instead of accidental.
- Some shell work still happens in React on the runtime path, so this is a reduction strategy rather than a complete shell/runtime decoupling.

# Migration and rollout
- Stabilize shell-facing callbacks in app hooks and `AppShell`.
- Memoize event-driven shell chrome components.
- Sample diagnostics snapshots on an explicit interval instead of pushing every visual frame through the panel.
- Surface the publication contract in diagnostics so the active posture stays visible during debugging.

# References
- `req_022_define_a_unified_frame_loop_architecture_for_runtime_stability_and_render_scheduling`
- `item_091_define_hot_path_state_publication_rules_between_runtime_shell_and_diagnostics_surfaces`
- `task_030_orchestrate_unified_frame_loop_architecture_for_runtime_stability_and_render_scheduling`
- `adr_016_define_shell_scene_state_and_meta_surface_ownership`
- `adr_022_keep_product_meta_flow_shell_owned_while_runtime_state_remains_game_preserved`

# Follow-up work
- Revisit whether inspection should also move to sampled publication if entity density grows enough to make it a measurable hot-path cost.
- Add stronger selector-based publication only if shell React work becomes a dominant runtime bottleneck.
