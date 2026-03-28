## task_040_orchestrate_game_over_recap_and_proximity_loot_wave - Orchestrate game-over recap and proximity-loot wave
> From version: 0.5.0
> Status: Done
> Understanding: 100%
> Confidence: 100%
> Progress: 100%
> Complexity: High
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog items `item_137_define_a_game_over_recap_surface_for_defeated_runs`, `item_138_define_post_recap_return_to_main_menu_and_reentry_options`, `item_139_define_a_player_attack_cone_visualization_aligned_with_runtime_combat_geometry`, `item_140_define_nearby_pickup_spawn_rules_around_the_player`, `item_141_define_a_first_healing_kit_pickup_that_restores_25_percent_health`, and `item_142_define_gold_as_the_default_fallback_pickup_and_first_runtime_currency_counter`.
- Related request(s): `req_037_define_a_game_over_recap_flow_and_player_attack_cone_visualization`, `req_038_define_a_first_proximity_loot_spawn_wave_with_healing_kits_and_gold`.
- The repository now has the first hostile combat loop and defeat routing, but the failure surface still needs a product-grade recap while the live world still lacks a first pickup/recovery loop.
- This orchestration task groups the next survival loop wave so defeat closure, post-defeat re-entry, attack readability, and nearby pickups land as one coherent gameplay/product step instead of disconnected slices.

# Dependencies
- Blocking: `task_036_orchestrate_main_menu_new_game_and_character_name_entry_wave`, `task_037_orchestrate_single_slot_persistence_and_pseudo_physics_foundations`, `task_039_orchestrate_the_first_hostile_combat_loop_wave`.
- Unblocks: first readable game-over loop, post-defeat replay flow, first nearby reward/recovery loop, and follow-up work around drops, economy, or richer combat feedback.

```mermaid
%% logics-signature: task|orchestrate-game-over-recap-and-proximit|item-137-define-a-game-over-recap-surfac|1-define-and-implement-a-shell-owned|npm-run-ci
flowchart TD
    Recap[item_137 game-over recap surface] --> Wave[Game-over plus proximity-loot wave]
    Return[item_138 post-recap return to main menu] --> Wave
    Cone[item_139 attack cone visualization] --> Wave
    Spawn[item_140 nearby pickup spawn rules] --> Wave
    Heal[item_141 healing kit pickup] --> Wave
    Gold[item_142 gold fallback pickup] --> Wave
```

# Plan
- [x] 1. Define and implement a shell-owned `Game over` recap surface for defeated runs with bounded first-slice summary data.
- [x] 2. Define and implement post-recap routing back to `Main menu`, with clear re-entry options around `Load game` and `Start new game`.
- [x] 3. Define and implement a player attack-cone visualization aligned with the real combat geometry and bounded display timing.
- [x] 4. Define and implement nearby pickup spawn rules around the player, respecting local caps, safe spawn distance, and traversable world space.
- [x] 5. Define and implement a first healing-kit pickup that restores `25%` of player max health with a max-health clamp.
- [x] 6. Define and implement gold as the default fallback pickup plus a first runtime currency counter or count posture.
- [x] 7. Validate the resulting loop end to end so defeat, re-entry, and nearby pickups all behave coherently.
- [x] 8. Update linked requests, backlog, task, and supporting notes so the wave remains traceable.
- [x] FINAL: Create dedicated git commit(s) for this orchestration scope.

# Request AC Traceability
- req_037_define_a_game_over_recap_flow_and_player_attack_cone_visualization coverage: AC1, AC2, AC3, AC4, AC5, AC6. Proof: `task_040_orchestrate_game_over_recap_and_proximity_loot_wave` closes the linked request chain for `req_037_define_a_game_over_recap_flow_and_player_attack_cone_visualization` and carries the delivery evidence for `item_139_define_a_player_attack_cone_visualization_aligned_with_runtime_combat_geometry`.


# Links
- Backlog item(s): `item_137_define_a_game_over_recap_surface_for_defeated_runs`, `item_138_define_post_recap_return_to_main_menu_and_reentry_options`, `item_139_define_a_player_attack_cone_visualization_aligned_with_runtime_combat_geometry`, `item_140_define_nearby_pickup_spawn_rules_around_the_player`, `item_141_define_a_first_healing_kit_pickup_that_restores_25_percent_health`, `item_142_define_gold_as_the_default_fallback_pickup_and_first_runtime_currency_counter`
- Request(s): `req_037_define_a_game_over_recap_flow_and_player_attack_cone_visualization`, `req_038_define_a_first_proximity_loot_spawn_wave_with_healing_kits_and_gold`

# Validation
- `npm run ci`
- `npm run test:browser:smoke`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Implementation notes
- `13db4e2` introduced the gameplay/product wave:
  - shell-owned `Game over` recap with bounded run stats
  - defeat dismissal back to `Main menu` with the dead run cleared
  - world-space pulse for the automatic player cone attack
  - bounded nearby pickups with blocked-space checks and safe spawn distance
  - `20%` healing kits, `80%` gold, auto-pickup, and runtime gold counting

# Definition of Done (DoD)
- [x] Covered backlog items are implemented or explicitly split further with updated traceability.
- [x] Defeat resolves through a readable game-over recap and returns cleanly to `Main menu`.
- [x] The player’s attack cone is visually readable in runtime and aligned with the actual combat geometry.
- [x] Nearby pickups can appear near the player without spawning inside blocked space or directly on top of the player.
- [x] Healing kits and gold both work inside the first pickup loop with bounded behavior.
- [x] Linked requests, backlog, and task docs are updated with proofs and status.
- [x] Dedicated git commit(s) have been created for the completed orchestration scope.
- [x] Status is `Done` and progress is `100%`.
