## adr_051_resolve_player_orientation_through_a_bounded_simulation_owned_turn_rate - Resolve player orientation through a bounded simulation-owned turn rate
> Date: 2026-03-23
> Status: Accepted
> Drivers: Movement already gained bounded reversal inertia, but facing still snaps directly to resolved velocity, creating a feel mismatch and leaving no clean surface for future turn-speed modifiers.
> Related request: `req_071_define_a_bounded_entity_rotation_inertia_and_turn_rate_wave`
> Related backlog: `item_266_define_a_simulation_owned_turn_rate_contract_for_player_entity_facing`, `item_267_define_target_heading_and_last_meaningful_facing_rules_under_rotation_inertia`, `item_268_define_a_future_modifier_seam_for_authored_turn_responsiveness_changes`, `item_269_define_targeted_validation_for_player_turning_readability_and_responsiveness`
> Related task: `task_055_orchestrate_difficulty_iconography_rotation_and_balance_foundations`
> Related architecture: `adr_033_adopt_deterministic_movement_oriented_pseudo_physics_instead_of_a_full_physics_engine`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
Player orientation should be resolved through a bounded, simulation-owned turn-rate model rather than snapping immediately to the latest movement heading.

# Decision
- Keep turning deterministic and simulation-owned.
- Resolve facing through a bounded turn-rate posture.
- Hold last meaningful facing while idle.
- Leave an explicit seam for future authored turn-speed modifiers.

# Consequences
- Facing changes become less abrupt and more readable.
- Movement inertia and orientation feel stay aligned.
- Future skills or passives can accelerate turning without reopening the movement architecture.

# Alternatives considered
- Keep instant orientation snaps.
  Rejected because they remain harsher than the body motion.
- Fake turning only in presentation.
  Rejected because gameplay feel and future modifiers need a simulation-owned surface.
