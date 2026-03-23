## adr_038_split_entity_player_rendering_into_stable_geometry_and_transient_combat_overlays - Split entity player rendering into stable geometry and transient combat overlays
> Date: 2026-03-23
> Status: Accepted
> Drivers: Reduce per-entity redraw density in the player runtime; preserve combat readability; stop mixing stable body shapes with short-lived combat feedback in one dense draw posture; keep the current Pixi/runtime ownership model intact.
> Related request: `req_056_define_a_runtime_render_hot_path_optimization_wave_for_world_and_entity_drawing`
> Related backlog: `item_206_define_a_split_entity_render_layer_posture_for_stable_shapes_and_transient_combat_fx`
> Related task: `task_048_orchestrate_runtime_render_hot_path_optimization_for_world_and_entity_drawing`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
Entity player rendering should be split into stable geometry and transient combat overlays so the default player path redraws less dense work while preserving essential readability.

# Context
`EntityScene` currently redraws a dense mix of entity visuals:
- stable body geometry and orientation
- health and charge bars
- attack arcs
- hit reactions
- floating combat numbers
- optional diagnostics labels

That single dense redraw posture is easy to extend but expensive to scale. The runtime evidence does not currently show simulation distress, which means render cost is the better next target. The decision needed here is structural:
- how to separate stable and transient entity visuals
- what remains always on in the player path
- what becomes isolated, conditional, or cheaper

# Decision
- Treat stable entity body visuals and transient combat feedback as separate concerns in code, even when they still share one `Graphics` node for the lightest player-runtime topology.
- Render entities in local coordinates inside positioned containers so movement no longer forces world-position-heavy drawing math inside each callback.
- Keep pickup visuals on a memoized stable path and keep diagnostics labels behind diagnostics mode rather than treating them as part of the player-runtime entity baseline.
- Preserve current gameplay semantics and deterministic simulation; this ADR changes render composition, not combat rules.

# Alternatives considered
- Keep one dense entity draw callback and only micro-optimize inside it. Rejected because it leaves the structural redraw coupling intact.
- Remove combat readability overlays broadly. Rejected because the game still needs readable combat feedback.
- Move combat overlays into shell DOM/UI. Rejected because the feedback is world-space and belongs near the runtime scene.
- Rewrite combat presentation around a different renderer stack. Rejected because the needed decision is about render composition, not renderer replacement.

# Consequences
- Entity rendering is easier to optimize incrementally because stable and transient concerns are now explicit in code.
- The player-runtime display tree stays leaner than the first attempted multi-layer split, which reduced the risk of over-optimizing into a heavier scene graph.
- Some existing visuals may still need more explicit lifecycle or visibility rules if combat density grows further.
- Future combat-feedback additions have a clearer place to land without automatically bloating the stable pickup/body path.

# Migration and rollout
- Move entity rendering into local coordinates inside positioned containers.
- Keep stable pickup/body drawing memoized where practical.
- Keep diagnostics labels behind diagnostics mode.
- Validate against scripted profiling scenarios plus manual combat-readability checks.

# References
- `req_056_define_a_runtime_render_hot_path_optimization_wave_for_world_and_entity_drawing`
- `item_206_define_a_split_entity_render_layer_posture_for_stable_shapes_and_transient_combat_fx`
- `adr_019_keep_engine_pixi_as_adapter_and_game_as_runtime_scene_composer`
- `adr_028_budget_player_runtime_and_debug_visuals_as_separate_render_modes`
- `adr_033_adopt_deterministic_movement_oriented_pseudo_physics_instead_of_a_full_physics_engine`

# Follow-up work
- Decide whether health and charge bars remain always-on for all combatants or become more conditional.
- Revisit transient feedback batching or pooling if profiling still points to combat overlays after the split.
- Add stronger validation guidance if manual readability review proves too subjective.
