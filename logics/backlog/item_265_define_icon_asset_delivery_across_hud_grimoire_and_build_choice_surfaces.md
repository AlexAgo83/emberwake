## item_265_define_icon_asset_delivery_across_hud_grimoire_and_build_choice_surfaces - Define icon asset delivery across HUD, Grimoire, and build-choice surfaces
> From version: 0.5.0
> Status: Done
> Understanding: 95%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Icon work only matters if it lands coherently in the real build-facing surfaces.

# Scope
- In: delivery and validation across HUD slots, `Grimoire`, and build-choice surfaces.
- In: small-size usage and asset integration posture.
- Out: unrelated shell icon work.

```mermaid
%% logics-signature: backlog|define-icon-asset-delivery-across-hud-gr|req-070-define-a-techno-shinobi-iconogra|icon-work-only-matters-if-it|ac1-the-slice-defines-icon-delivery
flowchart LR
    Req[Req 070 skill iconography] --> Need[Icons must land in real surfaces]
    Need --> Slice[Icon delivery and validation]
    Slice --> Result[Build-facing UI benefits from the new assets]
```

# Acceptance criteria
- AC1: The slice defines icon delivery across HUD, `Grimoire`, and build-choice surfaces.
- AC2: The slice verifies small-size readability in real placements.
- AC3: The slice explicitly uses `logics-ui-steering`.

# Request AC Traceability
- req_070_define_a_techno_shinobi_iconography_wave_for_active_passive_and_fusion_skills coverage: AC1, AC2, AC3, AC4, AC5, AC6, AC7. Proof: `item_265_define_icon_asset_delivery_across_hud_grimoire_and_build_choice_surfaces` remains the request-closing backlog slice for `req_070_define_a_techno_shinobi_iconography_wave_for_active_passive_and_fusion_skills` and stays linked to `task_055_orchestrate_difficulty_iconography_rotation_and_balance_foundations` for delivered implementation evidence.


# Links
- Architecture decision(s): `adr_050_use_a_shared_vector_first_techno_shinobi_icon_family_for_build_facing_skill_representation`
- Request: `req_070_define_a_techno_shinobi_iconography_wave_for_active_passive_and_fusion_skills`

# Notes
- Derived from request `req_070_define_a_techno_shinobi_iconography_wave_for_active_passive_and_fusion_skills`.
