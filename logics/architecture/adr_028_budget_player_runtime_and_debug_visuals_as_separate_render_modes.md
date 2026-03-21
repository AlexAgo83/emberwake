## adr_028_budget_player_runtime_and_debug_visuals_as_separate_render_modes - Budget player runtime and debug visuals as separate render modes
> Date: 2026-03-21
> Status: Accepted
> Drivers: Reduce sustained runtime cost without a rendering rewrite; stop making player runtime pay for debug grids and labels; keep render posture compatible with unified frame scheduling and existing Pixi adapters.
> Related request: `req_023_define_the_next_runtime_shell_render_and_system_boundary_architecture_wave`
> Related backlog: `item_094_define_sustained_runtime_performance_and_render_phase_two_architecture_for_density_redraw_and_debug_budgeting`
> Related task: `task_031_orchestrate_the_remaining_open_architecture_and_runtime_input_reliability_wave`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
Player runtime and diagnostics visuals should be treated as separate render modes so debug labels and grids can be degraded or removed without changing the player-facing world layer.

# Context
The runtime already had startup and frame-pacing budgets, but the world and entity scenes still rendered debug-heavy visuals all the time:
- chunk grids
- chunk labels
- entity labels

That posture increased sustained redraw and text cost even when diagnostics were hidden.

# Decision
- Add a game-owned render-performance contract that distinguishes `player` and `diagnostics` runtime surface modes.
- Route the shell’s diagnostics visibility into the runtime surface so the render layer can select the appropriate mode.
- Keep world terrain/base visuals in both modes, but gate debug-only overlays and labels behind diagnostics mode.
- Treat debug visuals as separately degradable budget domains rather than part of the baseline player runtime cost.

# Alternatives considered
- Keep a single render mode and optimize later. Rejected because it hides the player/debug budget split.
- Rewrite the world renderer immediately around chunk caches. Rejected because this wave only needed the posture and first enforcement seam.
- Move diagnostics into the shell DOM. Rejected because the world-space overlays still belong to game/render composition.

# Consequences
- The live runtime now pays less sustained visual cost when diagnostics are hidden.
- Render budgeting becomes explicit in code rather than implicit in local conventions.
- Deeper chunk caching or render batching can build on this posture later without undoing ownership boundaries.

# Migration and rollout
- Add a render-performance contract and runtime surface mode type in game-owned presentation code.
- Pass the shell-selected mode through runtime surface boundaries.
- Gate chunk overlays, chunk labels, and entity labels behind diagnostics mode.

# References
- `req_023_define_the_next_runtime_shell_render_and_system_boundary_architecture_wave`
- `item_094_define_sustained_runtime_performance_and_render_phase_two_architecture_for_density_redraw_and_debug_budgeting`
- `task_031_orchestrate_the_remaining_open_architecture_and_runtime_input_reliability_wave`
- `adr_019_keep_engine_pixi_as_adapter_and_game_as_runtime_scene_composer`

# Follow-up work
- Add chunk caching or stronger redraw policies if sustained runtime profiling still points to the world layer.
- Expand render budgeting when combat feedback or VFX layers become real.

