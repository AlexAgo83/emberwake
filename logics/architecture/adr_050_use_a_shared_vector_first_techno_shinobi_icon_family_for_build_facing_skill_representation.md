## adr_050_use_a_shared_vector_first_techno_shinobi_icon_family_for_build_facing_skill_representation - Use a shared vector-first techno-shinobi icon family for build-facing skill representation
> Date: 2026-03-23
> Status: Proposed
> Drivers: The playable build loop now needs real iconography across HUD, codex, and future build-choice surfaces, but those icons must stay coherent, small-size readable, and visually native to Emberwake.
> Related request: `req_070_define_a_techno_shinobi_iconography_wave_for_active_passive_and_fusion_skills`
> Related backlog: `item_261_define_a_shared_techno_shinobi_icon_language_for_build_facing_skill_assets`, `item_262_define_the_first_active_skill_icon_set_for_the_playable_roster`, `item_263_define_the_first_passive_item_icon_set_for_the_playable_roster`, `item_264_define_fusion_icon_intensification_as_a_derivative_of_base_build_identity`, `item_265_define_icon_asset_delivery_across_hud_grimoire_and_build_choice_surfaces`
> Related task: `task_055_orchestrate_difficulty_iconography_rotation_and_balance_foundations`
> Related architecture: `adr_044_split_runtime_hud_into_anchored_blocks_and_route_mobile_menu_entry_to_the_full_screen_shell_surface`, `adr_045_model_grimoire_and_bestiary_as_shell_owned_discovery_gated_archive_scenes`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
Skill icons should be delivered as one shared, vector-first techno-shinobi icon family that can scale cleanly across build-facing surfaces.

# Decision
- Use one coherent icon family across actives, passives, and fusions.
- Favor vector-first assets for clarity and scalability.
- Keep fusion icons derivative of base build identity rather than inventing a disconnected symbol language.
- Validate icons in real placements such as HUD and `Grimoire`.

# Consequences
- Skill identity becomes faster to read in play and in codex surfaces.
- The roster feels more authored and less placeholder-like.
- Icon delivery stays consistent across future build-choice surfaces.

# Alternatives considered
- Keep text-only build identity.
  Rejected because it weakens fast recognition.
- Use unrelated per-skill illustrations.
  Rejected because they would fragment the UI language and scale poorly at small sizes.
