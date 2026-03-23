## prod_014_shell_codex_archive_direction_for_grimoire_and_bestiary - Shell codex archive direction for grimoire and bestiary
> Date: 2026-03-23
> Status: Validated
> Related request: `req_064_define_a_grimoire_scene_for_skill_discovery_and_future_unlock_gating`, `req_065_define_a_bestiary_scene_for_discovered_and_defeated_creatures`
> Related backlog: `item_243_define_main_menu_codex_archive_entry_posture_for_grimoire_and_bestiary_access`, `item_244_define_a_player_facing_grimoire_scene_for_skill_discovery_and_future_unlock_gating`, `item_245_define_a_player_facing_bestiary_scene_for_discovered_creatures_and_defeat_tracking`, `item_246_define_a_shared_discovery_gating_and_unknown_entry_posture_for_codex_archive_scenes`, `item_247_define_techno_shinobi_codex_archive_presentation_and_validation_for_grimoire_and_bestiary`
> Related task: `task_054_orchestrate_post_0_4_0_runtime_expression_and_progression_waves`
> Related architecture: `adr_016_define_shell_scene_state_and_meta_surface_ownership`, `adr_045_model_grimoire_and_bestiary_as_shell_owned_discovery_gated_archive_scenes`
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
The shell now needs durable knowledge surfaces for both build content and creature content. The right posture is not a debug index or settings submenu. It is a codex/archive family that belongs to the shell as a player-facing knowledge layer.

This brief defines the next product layer:

`give discovered game knowledge a home`

# Product problem
The project now has meaningful content in two different families:
- skills and build components
- creatures and combat targets

But the shell still lacks:
- a stable skill knowledge surface
- a stable creature archive
- a home for future discovery gating

Without archive scenes:
- learned content stays trapped inside runs
- discovery progression has no visible home
- future unlock logic has no obvious player-facing surface

# Goals
- Add shell-owned archive scenes for skills and creatures.
- Make those scenes player-readable and discovery-oriented.
- Anticipate future gating so unknown content can stay intentionally hidden.
- Keep the two scenes visually related as a codex family.

# Non-goals
- Building a full lore encyclopedia.
- Shipping full collection-completion meta systems.
- Turning archive scenes into equipment or tuning surfaces.
- Implementing every future unlock rule in the same wave.

# Direction
## Codex family, not random extra menus
`Grimoire` and `Bestiary` should feel like sibling archive scenes:
- same shell family
- different content focus
- same discovery posture

## Discovery gating as first-class posture
The player should not immediately see everything.
The product value comes partly from:
- discovery
- recognition
- future completion desire

## Unknown entries should feel intentional
Unknown content should suggest “there is more here” without feeling broken or incomplete.

## Techno-shinobi archive identity
These scenes should not feel like fantasy parchment books or generic admin lists.
They should read as:
- ritual archive
- field catalog
- classified codex

# Success signals
- Players can understand skills outside runs.
- Players can track discovered creatures and defeats.
- The shell gains a coherent codex/archive layer.
- Future unlock-gating work has an obvious player-facing home.

# Risks
- Making the archive scenes too text-heavy in the first pass.
- Revealing too much undiscovered content too early.
- Letting `Grimoire` and `Bestiary` drift apart visually and structurally.
