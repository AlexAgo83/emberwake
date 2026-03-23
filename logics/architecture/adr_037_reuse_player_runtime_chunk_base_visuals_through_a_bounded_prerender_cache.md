## adr_037_reuse_player_runtime_chunk_base_visuals_through_a_bounded_prerender_cache - Reuse player-runtime chunk base visuals through a bounded prerender cache
> Date: 2026-03-23
> Status: Proposed
> Drivers: Remove tile-by-tile chunk base redraw from the steady-state player frame loop; keep world identity deterministic; avoid turning performance fixes into unbounded render-resource retention; preserve the current game-to-Pixi ownership split.
> Related request: `req_056_define_a_runtime_render_hot_path_optimization_wave_for_world_and_entity_drawing`
> Related backlog: `item_205_define_a_bounded_chunk_visual_reuse_strategy_for_player_runtime_world_rendering`
> Related task: (none yet)
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
Player-runtime chunk base visuals should be prerendered and reused through a bounded cache rather than rebuilt tile by tile every visual frame.

# Context
The current world render posture rebuilds chunk base visuals inside `WorldScene` draw callbacks:
- each visible chunk reconstructs its base geometry tile by tile
- the resulting player-runtime cost repeats even when the chunk visuals are logically static
- the renderer already has explicit player and diagnostics modes, so the next step is to reduce steady-state player redraw rather than broaden debug/posture work

This is not primarily a world-generation decision. World identity should remain deterministic from seed and coordinates. The decision here is about runtime visual reuse:
- where the static chunk visuals are materialized
- how long they live
- how they are bounded and invalidated

# Decision
- Treat chunk base visuals as reusable render assets for the player runtime rather than as per-frame rebuilt `Graphics` instructions.
- Use a bounded prerender/cache posture keyed by deterministic chunk identity.
- Keep cache ownership at the render adapter boundary so game/world data stays declarative and Pixi resources stay adapter-owned.
- Keep diagnostics-only overlays, labels, and other debug visuals outside this base chunk cache unless a later ADR explicitly extends the posture.
- Prefer the simplest reusable representation that removes steady-state tile-by-tile redraw without widening into a renderer rewrite.

# Alternatives considered
- Keep rebuilding chunk tiles every frame. Rejected because it leaves an obvious hot path in place.
- Build an unbounded cache of prerendered chunk visuals. Rejected because it trades frame time for unbounded memory retention.
- Move full chunk visual ownership into game content/state. Rejected because Pixi resources belong in the render adapter layer, not the game-state layer.
- Rewrite the world renderer around a more invasive batching system immediately. Rejected because this wave needs a bounded reuse seam first, not a larger renderer rewrite.

# Consequences
- Steady-state player runtime should spend less frame time rebuilding static world visuals.
- Chunk visual reuse becomes explicit and testable rather than accidental.
- The render layer now carries a bounded resource lifecycle that must be validated and maintained carefully.
- Memory posture may improve or worsen depending on cache discipline, so bounded lifecycle rules are part of the decision, not an implementation detail.

# Migration and rollout
- Introduce a deterministic chunk-visual cache key based on current chunk identity rules.
- Move player-runtime chunk base preparation behind a bounded prerender/cache seam.
- Keep diagnostics overlays out of the base cache for the first rollout.
- Validate the new posture against existing long-session scenarios and compare frame-time/fps plus memory behavior.

# References
- `req_056_define_a_runtime_render_hot_path_optimization_wave_for_world_and_entity_drawing`
- `item_205_define_a_bounded_chunk_visual_reuse_strategy_for_player_runtime_world_rendering`
- `adr_005_make_world_identity_deterministic_from_seed_and_coordinates`
- `adr_019_keep_engine_pixi_as_adapter_and_game_as_runtime_scene_composer`
- `adr_028_budget_player_runtime_and_debug_visuals_as_separate_render_modes`

# Follow-up work
- Decide the exact cached representation once implementation begins and profiling can compare alternatives.
- Revisit whether the full-screen background fill should join the same reuse posture after chunk base visuals land.
- Extend the cache posture to diagnostics visuals only if a later wave proves that worthwhile.

