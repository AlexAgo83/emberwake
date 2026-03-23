## adr_047_structure_first_pass_run_difficulty_escalation_as_authored_time_phases - Structure first-pass run difficulty escalation as authored time phases
> Date: 2026-03-23
> Status: Accepted
> Drivers: Runs need a stronger time-owned arc, but the first pass should remain readable and authored instead of becoming a general dynamic-director system.
> Related request: `req_067_define_a_time_driven_run_progression_and_difficulty_escalation_wave`
> Related backlog: `item_252_define_an_authored_time_phase_model_for_run_progression_beats`, `item_253_define_first_pass_time_driven_pressure_levers_for_spawn_and_enemy_scaling`, `item_254_define_player_facing_phase_signaling_for_time_driven_run_escalation`, `item_255_define_targeted_validation_for_time_owned_run_pacing_and_difficulty_escalation`
> Related task: `task_054_orchestrate_post_0_4_0_runtime_expression_and_progression_waves`
> Related architecture: `adr_039_structure_the_first_survivor_build_loop_around_separate_active_and_passive_slots`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
First-pass run escalation should be modeled as authored time phases with bounded pressure levers, not as a fully adaptive encounter director.

# Decision
- Define authored survival thresholds or phases.
- Bind first-pass escalation to a limited set of pressure levers.
- Allow light player-facing phase signaling.
- Keep the model global and simple before introducing stage-specific variants.

# Consequences
- Pacing becomes more readable.
- Difficulty gains a stronger authored arc.
- The project avoids overcommitting to a large dynamic-difficulty framework too early.

# Alternatives considered
- Purely continuous invisible scaling.
  Rejected because phase readability matters.
- Full adaptive director in the first pass.
  Rejected as too broad and too expensive for the current stage.
