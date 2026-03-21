## adr_034_model_traversable_surface_effects_as_bounded_movement_modifiers - Model traversable surface effects as bounded movement modifiers
> Date: 2026-03-21
> Status: Accepted
> Drivers: Add traversal variety without conflating movement feel with blocking collision; make slow and slippery space readable to players; keep movement-affecting surfaces bounded and deterministic.
> Related request: `req_034_define_a_first_movement_surface_modifiers_wave_for_runtime_gameplay`
> Related backlog: `TBD`
> Related task: `TBD`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
Traversable world effects should be modeled as bounded movement modifiers such as `normal`, `slow`, and later `slippery`, rather than as obstacle collision or raw terrain semantics.

# Context
Not all meaningful world differentiation should be binary. Some areas should remain walkable while still changing how movement feels. That requires a first-class concept for traversal effects that is neither:
- a blocking obstacle
- nor just a visual terrain label

Without a dedicated posture, slow or slippery behavior would either leak into obstacle rules or become buried inside terrain generation in ways that are hard to evolve safely.

# Decision
- Represent traversable surface effects as a dedicated movement-modifier contract.
- Keep the first slice bounded to a small vocabulary such as `normal`, `slow`, and possibly `slippery`.
- Apply modifiers only to traversable space.
- Prefer mild, legible effects over dramatic control loss.
- Keep modifier behavior deterministic and compatible with the fixed-step simulation model.

# Alternatives considered
- Put slow or slippery behavior directly into terrain kind. Rejected because it couples visual identity too tightly to traversal rules.
- Model every surface through a large generalized material system immediately. Rejected because it is too broad for the first slice.
- Skip surface effects entirely until later gameplay systems appear. Rejected because traversal feel is already a meaningful part of world credibility.

# Consequences
- Movement feel can evolve independently from both collision and terrain art direction.
- Player readability improves because traversable-but-different space becomes explicit.
- The runtime needs one more world query concept, but the semantics stay clear.
- Slippery behavior must remain restrained or it risks feeling arbitrary rather than expressive.

# Migration and rollout
- Introduce a first movement-modifier enum or equivalent contract.
- Ship `slow` first as the safest effect.
- Add `slippery` only if the movement model remains legible and testable.
- Validate surface readability through runtime observation and automated tests.

# References
- `req_034_define_a_first_movement_surface_modifiers_wave_for_runtime_gameplay`
- `adr_032_separate_visual_terrain_blocking_obstacles_and_movement_surface_modifiers`
- `adr_033_adopt_deterministic_movement_oriented_pseudo_physics_instead_of_a_full_physics_engine`

# Follow-up work
- Decide whether movement modifiers should affect all entities or player-controlled movement first.
- Revisit whether hazards or stamina-like traversal effects deserve their own layer later.
