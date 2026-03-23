## adr_045_model_grimoire_and_bestiary_as_shell_owned_discovery_gated_archive_scenes - Model grimoire and bestiary as shell-owned discovery-gated archive scenes
> Date: 2026-03-23
> Status: Proposed
> Drivers: Skills and creatures now need player-facing archive surfaces, and future discovery gating requires clear shell ownership instead of ad hoc overlays.
> Related request: `req_064_define_a_grimoire_scene_for_skill_discovery_and_future_unlock_gating`, `req_065_define_a_bestiary_scene_for_discovered_and_defeated_creatures`
> Related backlog: `item_243_define_main_menu_codex_archive_entry_posture_for_grimoire_and_bestiary_access`, `item_244_define_a_player_facing_grimoire_scene_for_skill_discovery_and_future_unlock_gating`, `item_245_define_a_player_facing_bestiary_scene_for_discovered_creatures_and_defeat_tracking`, `item_246_define_a_shared_discovery_gating_and_unknown_entry_posture_for_codex_archive_scenes`, `item_247_define_techno_shinobi_codex_archive_presentation_and_validation_for_grimoire_and_bestiary`
> Related task: `TBD after request approval`
> Related architecture: `adr_016_define_shell_scene_state_and_meta_surface_ownership`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
`Grimoire` and `Bestiary` should be modeled as shell-owned archive scenes with shared discovery-gating posture, not as runtime overlays or settings-like utilities.

# Decision
- Add both as shell-owned archive scenes.
- Treat discovery gating as a first-class concern.
- Allow unknown-entry placeholders or redacted states without requiring full reveal.
- Keep skills and creatures in sibling archive surfaces rather than merging them immediately into one overloaded scene.

# Consequences
- The project gains a durable codex family in the shell.
- Future unlock logic has a clear player-facing home.
- The archive surfaces can evolve independently while staying coherent.

# Alternatives considered
- Put both inside one generic codex screen immediately.
  Rejected for first pass because distinct content families would compete too early.
- Make them runtime overlays.
  Rejected because they belong to shell-owned reflection and reference.
