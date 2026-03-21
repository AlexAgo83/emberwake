## adr_033_adopt_deterministic_movement_oriented_pseudo_physics_instead_of_a_full_physics_engine - Adopt deterministic movement-oriented pseudo-physics instead of a full physics engine
> Date: 2026-03-21
> Status: Accepted
> Drivers: Preserve the current fixed-step simulation posture; add collision and movement feel without importing rigid-body complexity; keep runtime behavior easy to test, debug, and reason about.
> Related request: `req_033_define_a_first_collision_and_blocking_world_wave_for_runtime_gameplay`, `req_034_define_a_first_movement_surface_modifiers_wave_for_runtime_gameplay`
> Related backlog: `item_125_define_movement_resolution_against_non_traversable_world_space`, `item_126_define_a_lightweight_entity_separation_posture_for_runtime_collisions`, `item_128_define_slow_surface_behavior_for_fixed_step_runtime_movement`, `item_129_define_optional_slippery_surface_behavior_without_reopening_full_physics_scope`
> Related task: `task_037_orchestrate_single_slot_persistence_and_pseudo_physics_foundations`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
The runtime should implement a deterministic pseudo-physics layer oriented around movement, blocking, and separation rather than adopting a full rigid-body physics engine.

# Context
The game now needs:
- blocked traversal
- simple overlap prevention
- movement-affecting surfaces

Those needs do not justify forces, impulses, restitution, mass, or an external physics framework. A full physics engine would add significant complexity before the product has enough gameplay systems to benefit from it.

The runtime already has a fixed-step authority model. The physics posture should reinforce that rather than compete with it.

# Decision
- Keep the runtime on a deterministic fixed-step simulation model.
- Implement movement resolution as conservative, predictable blocking and separation rather than force-based simulation.
- Prefer simple collision shapes and narrow gameplay rules over general-purpose rigid-body abstractions.
- Treat realism as secondary to readability, stability, and testability.
- Avoid introducing an external physics engine in this wave.

# Alternatives considered
- Introduce a full physics engine now. Rejected because the current gameplay needs are narrower than what such an engine optimizes for.
- Keep free traversal until combat or navigation is built. Rejected because spatial credibility is already a product issue.
- Implement highly ad hoc per-feature movement hacks. Rejected because collision and traversal rules need a durable architectural posture.

# Consequences
- Movement and collision behavior stay easy to inspect and test deterministically.
- The runtime avoids premature engine complexity.
- Some behaviors will be intentionally “gamey” rather than physically realistic.
- Future systems must stay disciplined about not quietly reintroducing force-based semantics through one-off features.

# Migration and rollout
- Add blocking-world movement resolution first.
- Add lightweight entity separation second.
- Add traversable surface modifiers third.
- Revisit whether additional physical semantics are needed only after gameplay systems clearly demand them.

# References
- `req_033_define_a_first_collision_and_blocking_world_wave_for_runtime_gameplay`
- `req_034_define_a_first_movement_surface_modifiers_wave_for_runtime_gameplay`
- `adr_024_drive_live_runtime_from_the_pixi_visual_frame_while_engine_keeps_fixed_step_authority`

# Follow-up work
- Define which movement-resolution strategy best balances blocking and sliding behavior.
- Revisit whether any limited continuous-collision safeguards are needed once entity density increases.
