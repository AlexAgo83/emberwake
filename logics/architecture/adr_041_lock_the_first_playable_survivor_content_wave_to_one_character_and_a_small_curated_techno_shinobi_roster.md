## adr_041_lock_the_first_playable_survivor_content_wave_to_one_character_and_a_small_curated_techno_shinobi_roster - Lock the first playable survivor content wave to one character and a small curated techno-shinobi roster
> Date: 2026-03-23
> Status: Proposed
> Drivers: Convert the build-system direction into one concrete and testable first loop; stop content sprawl before tuning and UI are proven; keep the first release legible and theme-coherent.
> Related request: `req_059_define_a_first_playable_techno_shinobi_build_content_wave`
> Related backlog: `item_218_define_the_first_exact_techno_shinobi_active_roster_and_starter_weapon_delivery`, `item_219_define_the_first_exact_techno_shinobi_passive_roster_and_fusion_key_delivery`, `item_220_define_first_pass_level_up_pool_and_chest_rules_for_the_techno_shinobi_build_loop`, `item_221_define_the_first_curated_techno_shinobi_fusion_delivery_and_readiness_rules`, `item_222_define_player_facing_level_up_and_build_tracking_ui_for_the_first_techno_shinobi_loop`, `item_223_define_first_playable_tuning_and_validation_for_the_techno_shinobi_build_wave`
> Related task: `task_051_orchestrate_the_first_playable_techno_shinobi_build_content_wave`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
The first playable survivor-like content wave in `Emberwake` should be locked to one starter character, one small curated techno-shinobi roster, and one intentionally bounded progression grammar before the project expands into multiple characters, broader unlock structures, or a larger content matrix.

# Context
The project already decided that:
- the first build loop should use separate active and passive slots
- the first fusion layer should be curated rather than combinatorial
- the first presentation language should read as techno-shinobi

The remaining risk is content sprawl. Without an explicit architecture/product decision, implementation can easily widen into:
- too many starting weapons
- multiple character-specific starter rules
- too many passives before their identities are stable
- fusion permutations that outpace communication and tuning
- UI complexity before the first loop is even proven fun

That would delay the only result that matters right now:

`one small, understandable, replayable first build loop`

# Decision
- Ship the first survivor-like content wave around one standardized starter character and one standardized starter weapon.
- Freeze the first content wave to a small curated roster rather than a broad “future-ready” matrix.
- Treat the first loop as a proof layer for:
  - content naming
  - role readability
  - level-up pool quality
  - chest payoff rhythm
  - fusion communication
- Keep all first-wave content fully unlocked by default.
- Defer multiple-character divergence, unlock trees, and larger content volume until the first loop is validated.

# Alternatives considered
- Implement multiple characters immediately with different starters.
  Rejected because it multiplies tuning, UI, and communication cost too early.
- Ship a larger roster immediately for perceived content value.
  Rejected because it reduces readability and slows iteration on the core loop.
- Add meta-progression or unlock gating in the same wave.
  Rejected because it obscures whether the core loop is good on its own.

# Consequences
- The first implementation is easier to test, tune, and explain.
- The team can evaluate whether the build grammar works before adding long-tail complexity.
- Some future-facing systems will remain temporarily absent, especially:
  - unlock progression
  - alternate starters
  - wider content breadth
- Future expansion remains possible, but only after the first curated layer is stable.

# Migration and rollout
- Define the exact first playable active and passive roster.
- Define the first curated fusion set and readiness rules.
- Implement the level-up and chest grammar for the bounded roster.
- Validate readability, pacing, and build payoff on the one-character baseline.
- Expand only after the first loop is proven understandable and fun.

# References
- `prod_005_visual_identity_dark_fantasy_with_synthetic_energy_accents`
- `prod_009_level_up_slots_and_run_progression_model_for_emberwake`
- `prod_010_first_playable_techno_shinobi_build_content_and_progression_defaults`
- `adr_039_structure_the_first_survivor_build_loop_around_separate_active_and_passive_slots`
- `adr_040_use_curated_active_passive_fusions_as_the_foundational_build_payoff_layer`

# Follow-up work
- Turn the first curated roster into implementation-ready backlog items.
- Define the first player-facing level-up and build-tracking UI posture.
- Revisit multi-character divergence only after the first playable wave is validated.
