## item_237_define_targeted_validation_for_second_pass_weapon_feedback_polish - Define targeted validation for second-pass weapon feedback polish
> From version: 0.4.0
> Status: Draft
> Understanding: 99%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: Quality
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Second-pass feedback polish can improve clarity, but also add noise or budget regressions.
- The project needs bounded validation for the specific readability gains this wave targets.

# Scope
- In: targeted checks for non-hit readability, spatial ownership, and weapon differentiation.
- In: bounded runtime-cost checks.
- Out: full benchmark infrastructure.

```mermaid
%% logics-signature: backlog|define-targeted-validation-for-second-pa|req-062-define-a-second-combat-skill-fee|second-pass-feedback-polish-can-improve-|ac1-the-slice-defines-targeted-readabili
flowchart LR
    Req[Req 062 second-pass feedback polish] --> Need[Polish must stay readable and cheap]
    Need --> Slice[Targeted validation]
    Slice --> Result[Credible second-pass feedback improvements]
```

# Acceptance criteria
- AC1: The slice defines targeted readability checks for the under-expressed weapons.
- AC2: The slice defines differentiation checks for `Guided Senbon` and `Shade Kunai`.
- AC3: The slice includes bounded runtime-cost validation.

# Links
- Product brief(s): `prod_012_second_pass_combat_skill_feedback_polish_for_underexpressed_weapons`
- Architecture decision(s): `adr_043_extend_transient_weapon_feedback_with_bounded_anticipation_and_linger_states`
- Request: `req_062_define_a_second_combat_skill_feedback_polish_wave_for_underexpressed_weapons`

# Notes
- Derived from request `req_062_define_a_second_combat_skill_feedback_polish_wave_for_underexpressed_weapons`.
