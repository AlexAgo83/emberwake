## adr_032_separate_visual_terrain_blocking_obstacles_and_movement_surface_modifiers - Separate visual terrain, blocking obstacles, and movement surface modifiers
> Date: 2026-03-21
> Status: Accepted
> Drivers: Prevent world rendering and gameplay traversal rules from collapsing into one contract; keep collision, terrain readability, and movement feel independently evolvable; support deterministic generation of both blocking and non-blocking world features.
> Related request: `req_033_define_a_first_collision_and_blocking_world_wave_for_runtime_gameplay`, `req_034_define_a_first_movement_surface_modifiers_wave_for_runtime_gameplay`
> Related backlog: `item_124_define_a_first_obstacle_layer_representation_for_runtime_traversal`, `item_127_define_a_first_movement_surface_modifier_contract_for_traversable_world_space`
> Related task: `task_037_orchestrate_single_slot_persistence_and_pseudo_physics_foundations`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
The runtime world model should separate three concerns:
- visual terrain identity
- blocking obstacle collision
- traversable movement-surface modifiers

# Context
The current generated world is still terrain-first. That is useful for visual identity, but it is the wrong long-term place to encode every gameplay rule. If terrain also becomes the direct source of collision and movement behavior, the contract quickly becomes overloaded:
- visual iteration becomes coupled to gameplay blocking
- non-blocking but movement-affecting areas are awkward to express
- deterministic generation has fewer clean extension points

The world needs a clearer layering model before collision and surface effects are implemented in earnest.

# Decision
- Treat terrain as the visual/biome layer only.
- Treat obstacles as the blocking/collision layer that determines whether space is traversable.
- Treat movement-surface modifiers as a separate traversal-behavior layer for walkable space.
- Allow generation to correlate these layers, but do not collapse them into a single contract.
- Keep the first slice minimal, but preserve the architectural distinction even if some implementations initially co-locate data for convenience.

# Alternatives considered
- Infer collision directly from terrain kind. Rejected because it couples visual identity too tightly to gameplay blocking.
- Encode movement modifiers directly into terrain kind. Rejected because it prevents clean combinations such as a terrain remaining visually stable while traversal behavior changes.
- Use only one generic “world cell behavior” layer immediately. Rejected because it hides meaning and makes future systems harder to reason about.

# Consequences
- Terrain iteration can remain visual without accidentally changing traversal rules.
- Blocking space and movement-affecting space gain explicit contracts.
- World generation gains clearer extension points for future hazards, cover, or special traversal without reopening terrain semantics.
- Some initial data plumbing may feel more explicit, but the runtime model becomes easier to evolve safely.

# Migration and rollout
- Keep the existing terrain generation posture as the visual baseline.
- Add an obstacle representation that determines blocking traversability.
- Add a movement-surface modifier representation for traversable space.
- Update generation, runtime queries, and tests to resolve the correct layer for each gameplay question.

# References
- `req_033_define_a_first_collision_and_blocking_world_wave_for_runtime_gameplay`
- `req_034_define_a_first_movement_surface_modifiers_wave_for_runtime_gameplay`
- `adr_015_define_engine_to_game_runtime_contract_boundaries`

# Follow-up work
- Define how obstacle generation composes with terrain generation without requiring a separate authoring tool immediately.
- Define the first movement-surface modifier contract for traversable tiles or cells.
