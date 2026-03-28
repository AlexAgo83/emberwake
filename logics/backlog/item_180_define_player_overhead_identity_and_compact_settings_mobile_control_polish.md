## item_180_define_player_overhead_identity_and_compact_settings_mobile_control_polish - Define player overhead identity and compact settings/mobile-control polish
> From version: 0.5.0
> Status: Done
> Understanding: 100%
> Confidence: 100%
> Progress: 100%
> Complexity: High
> Theme: UX
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The player overhead presentation does not yet show character identity and current level.
- The `Settings` scene remains too tall in practical viewports.
- The mobile joystick background still feels visually too heavy over time.

# Scope
- In: player overhead name + level line, settings compaction, and progressive fade-out polish for the mobile virtual-stick background.
- Out: full settings IA redesign, new control categories, or broad HUD redesign.

```mermaid
%% logics-signature: backlog|define-player-overhead-identity-and-comp|req-050-define-a-main-menu-polish-and-fi|the-player-overhead-presentation-does-no|ac1-the-slice-defines-that-the
flowchart LR
    Req[Req 050 shell and progression polish] --> Gap[Identity and settings polish still weak]
    Gap --> Slice[Overhead identity + compact settings + mobile fade]
    Slice --> Result[Clearer player identity and cleaner control surfaces]
```

# Acceptance criteria
- AC1: The slice defines that the player overhead presentation includes character name and current level.
- AC2: The slice defines a compaction posture strong enough to fit the `Settings` surface inside common viewport heights.
- AC3: The slice defines a progressive fade-out behavior for the mobile joystick background.
- AC4: The slice keeps these changes presentation-focused and does not reopen broader shell/control architecture.

# Request AC Traceability
- req_050_define_a_main_menu_polish_and_first_crystal_xp_progression_wave coverage: AC1, AC10, AC11, AC12, AC2, AC3, AC4, AC5, AC6, AC7, AC8, AC9. Proof: `item_180_define_player_overhead_identity_and_compact_settings_mobile_control_polish` remains the request-closing backlog slice for `req_050_define_a_main_menu_polish_and_first_crystal_xp_progression_wave` and stays linked to `task_044_orchestrate_main_menu_polish_and_first_crystal_progression_wave` for delivered implementation evidence.


# Links
- Request: `req_050_define_a_main_menu_polish_and_first_crystal_xp_progression_wave`

# Notes
- Derived from request `req_050_define_a_main_menu_polish_and_first_crystal_xp_progression_wave`.
- Implemented through `task_044_orchestrate_main_menu_polish_and_first_crystal_progression_wave`.
