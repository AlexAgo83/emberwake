## task_044_orchestrate_main_menu_polish_and_first_crystal_progression_wave - Orchestrate main-menu polish and first crystal progression wave
> From version: 0.3.0
> Status: Draft
> Understanding: 100%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog items `item_177_define_a_main_menu_changelog_surface_and_release_history_entry`, `item_178_define_a_more_atmospheric_main_menu_presentation_with_footer_version_linking`, `item_179_define_first_crystal_xp_level_and_runtime_progression_feedback`, and `item_180_define_player_overhead_identity_and_compact_settings_mobile_control_polish`.
- Related request(s): `req_050_define_a_main_menu_polish_and_first_crystal_xp_progression_wave`.
- The repository now has a published `0.3.0` release and a playable combat loop, so the next product-facing wave should strengthen the entry surface, add first progression rewards, and tighten shell/mobile control readability.

# Dependencies
- Blocking: `task_043_orchestrate_runtime_memory_structure_generation_and_settings_polish_wave`.
- Unblocks: a more showcase-ready main menu, first crystal-based progression, richer runtime identity feedback, and a more practical settings/mobile-control surface.

```mermaid
%% logics-signature: task|orchestrate-main-menu-polish-and-first-c|item-177-define-a-main-menu-changelog-su|1-define-and-implement-the-main|npm-run-ci
flowchart TD
    Menu[item_177 changelog access and ordering] --> Wave[Main-menu polish and crystal progression wave]
    Atmosphere[item_178 animated background and footer] --> Wave
    Progression[item_179 crystal XP and runtime feedback] --> Wave
    Polish[item_180 overhead identity, settings compaction, mobile fade] --> Wave
```

# Plan
- [ ] 1. Define and implement the `Main menu` changelog entry, changelog-reading surface, and `Load game` action ordering.
- [ ] 2. Define and implement the animated `Main menu` background and bottom-anchored version footer linking to GitHub.
- [ ] 3. Define and implement first hostile crystal drops, XP gain, and level progression feedback in runtime.
- [ ] 4. Define and implement player overhead identity, settings compaction, and mobile joystick fade-out polish.
- [ ] 5. Validate shell UX, runtime progression readability, and docs traceability end to end.
- [ ] FINAL: Create dedicated git commit(s) for this orchestration scope.

# Links
- Backlog item(s): `item_177_define_a_main_menu_changelog_surface_and_release_history_entry`, `item_178_define_a_more_atmospheric_main_menu_presentation_with_footer_version_linking`, `item_179_define_first_crystal_xp_level_and_runtime_progression_feedback`, `item_180_define_player_overhead_identity_and_compact_settings_mobile_control_polish`
- Request(s): `req_050_define_a_main_menu_polish_and_first_crystal_xp_progression_wave`

# Validation
- `npm run ci`
- `npm run test:browser:smoke`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Done (DoD)
- [ ] Covered backlog items are implemented or explicitly split further with updated traceability.
- [ ] `Main menu` exposes changelog reading and prioritizes `Load game` ahead of `Start new game`.
- [ ] `Main menu` gains a stronger atmospheric background and a bottom-anchored version footer linking to GitHub without layout shift.
- [ ] Defeated hostiles drop crystals and the player can gain XP and levels from collecting them.
- [ ] Runtime feedback shows level plus XP progress and the player overhead shows name plus level.
- [ ] `Settings` fits more comfortably inside the page height and the mobile joystick background fades progressively.
- [ ] Dedicated git commit(s) have been created for the completed orchestration scope.
- [ ] Status is `Done` and progress is `100%`.

# Outcome
- Pending implementation.

# Commits
- Pending.
