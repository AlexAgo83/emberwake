## adr_035_resolve_entity_collisions_as_lightweight_deterministic_separation - Resolve entity collisions as lightweight deterministic separation
> Date: 2026-03-21
> Status: Accepted
> Drivers: Prevent obviously broken entity overlap; keep entity/entity interaction stable without introducing rigid-body response; preserve deterministic gameplay simulation.
> Related request: `req_033_define_a_first_collision_and_blocking_world_wave_for_runtime_gameplay`
> Related backlog: `item_126_define_a_lightweight_entity_separation_posture_for_runtime_collisions`
> Related task: `task_037_orchestrate_single_slot_persistence_and_pseudo_physics_foundations`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
Entity/entity collision should be implemented as lightweight deterministic separation and overlap prevention, not as a full physical response system.

# Context
As soon as blocked world space appears, entity overlap becomes more visible and more damaging to readability. Players expect entities to stop collapsing into the same space, but that expectation still does not require:
- impulses
- bounce
- mass transfer
- general-purpose rigid-body interaction

The first need is simple: avoid obviously broken overlap while preserving stable runtime behavior.

# Decision
- Treat entity/entity collision as a bounded separation problem.
- Use simple collision shapes suitable for deterministic overlap checks and correction.
- Prioritize player-relevant and major gameplay entities first rather than making every runtime object collide immediately.
- Resolve collisions in a predictable order compatible with the fixed-step simulation model.
- Keep entity/entity response intentionally lightweight and non-physical.

# Alternatives considered
- Defer entity/entity collision entirely until later systems. Rejected because overlap undermines spatial credibility once blocking-world rules exist.
- Use full physical response between entities. Rejected because the runtime does not yet need rigid-body complexity.
- Make every entity collide from day one. Rejected because it increases cost and ambiguity before the relevant gameplay set is known.

# Consequences
- Entity overlap becomes less visibly broken.
- The runtime preserves deterministic movement semantics.
- Some interactions may feel simpler than a full action game physics model, but they remain readable and stable.
- Future features must explicitly opt into richer interaction if they need it.

# Migration and rollout
- Introduce collision shapes for the first collidable entity set.
- Detect overlap during fixed-step updates.
- Apply bounded separation or movement rejection rules.
- Expand the collidable set only when product needs justify it.

# References
- `req_033_define_a_first_collision_and_blocking_world_wave_for_runtime_gameplay`
- `adr_033_adopt_deterministic_movement_oriented_pseudo_physics_instead_of_a_full_physics_engine`

# Follow-up work
- Define the first collidable-entity set explicitly.
- Revisit collision ordering if AI, projectiles, or dense crowds make pair resolution more complex.
