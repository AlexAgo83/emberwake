## item_231_define_first_pass_fusion_visual_intensification_rules_for_playable_weapon_feedback - Define first-pass fusion visual intensification rules for playable weapon feedback
> From version: 0.4.0
> Status: Done
> Understanding: 100%
> Confidence: 98%
> Progress: 100%
> Complexity: Medium
> Theme: UX
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- First-wave fusions now exist in build logic, but their payoff is still under-expressed visually.
- The project needs one bounded slice that makes fused weapons feel visibly evolved while preserving parent-weapon recognition.
- Without this slice, fusion remains too close to a hidden stat upgrade.

# Scope
- In: defining visual intensification rules for first-wave fused weapons.
- In: preserving each fused weapon’s parent-signature readability.
- In: using cadence, multiplicity, footprint, and shape density as escalation tools.
- Out: a fully separate effect family for each fusion or a broader VFX escalation system.

```mermaid
%% logics-signature: backlog|define-first-pass-fusion-visual-intensif|req-061-define-a-first-combat-skill-feed|first-wave-fusions-now-exist-in-build|ac1-the-slice-defines-visible-escalation
flowchart LR
    Req[Req 061 combat skill feedback wave] --> Need[Fusion payoff is visually weak]
    Need --> Slice[Fusion visual intensification]
    Slice --> Result[Fusions feel like evolved forms]
```

# Acceptance criteria
- AC1: The slice defines visible escalation rules for first-wave fused weapons.
- AC2: The slice preserves parent-weapon identity instead of making fusion visuals unrelated.
- AC3: The slice keeps fusion payoff readable during normal combat pressure.
- AC4: The slice stays bounded to first-wave fusions and does not widen into a large evolution-VFX framework.

# AC Traceability
- AC1 -> Scope: fused states change visibly. Proof target: fused signature implementations or parameter rules.
- AC2 -> Scope: parent identity remains clear. Proof target: side-by-side runtime review or design notes.
- AC3 -> Scope: readability remains intact. Proof target: manual runtime validation.
- AC4 -> Scope: slice stays bounded. Proof target: first-wave fusion-only coverage.

# Decision framing
- Product framing: Required
- Product signals: payoff, excitement, build readability
- Product follow-up: None.
- Architecture framing: Optional
- Architecture signals: presentation and boundaries
- Architecture follow-up: keep fusion visuals parameter-driven where possible.

# Links
- Product brief(s): `prod_008_active_passive_fusion_direction_for_emberwake`, `prod_011_techno_shinobi_combat_skill_feedback_direction_for_first_playable_weapons`
- Architecture decision(s): `adr_040_use_curated_active_passive_fusions_as_the_foundational_build_payoff_layer`, `adr_042_separate_weapon_simulation_from_transient_combat_skill_feedback_presentation`
- Request: `req_061_define_a_first_combat_skill_feedback_wave_for_playable_weapons`
- Primary task(s): `task_053_orchestrate_the_first_playable_combat_skill_feedback_wave`

# References
- `logics/product/prod_008_active_passive_fusion_direction_for_emberwake.md`
- `logics/product/prod_011_techno_shinobi_combat_skill_feedback_direction_for_first_playable_weapons.md`
- `logics/request/req_061_define_a_first_combat_skill_feedback_wave_for_playable_weapons.md`

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from request `req_061_define_a_first_combat_skill_feedback_wave_for_playable_weapons`.
- Source file: `logics/request/req_061_define_a_first_combat_skill_feedback_wave_for_playable_weapons.md`.
- Implemented by carrying `fusionId` through the transient feedback seam and intensifying parent signatures through brighter palettes, extra strokes, and denser marks instead of unrelated effect families.
