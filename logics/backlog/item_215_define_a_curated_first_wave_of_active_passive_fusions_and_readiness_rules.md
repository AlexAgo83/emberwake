## item_215_define_a_curated_first_wave_of_active_passive_fusions_and_readiness_rules - Define a curated first wave of active passive fusions and readiness rules
> From version: 0.4.0
> Status: Draft
> Understanding: 98%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- A build loop with actives and passives but no curated payoff layer will still feel flatter than the genre baseline Emberwake is trying to adopt.
- At the same time, a combinatorial fusion matrix would be too noisy, too expensive, and too hard to communicate in the first implementation.
- Emberwake therefore needs a small curated first fusion wave plus clear readiness rules that explain when a fusion is actually available.

# Scope
- In: defining a first-wave fusion posture, candidate active + passive pairs, and readiness conditions for fusion payoff.
- In: defining how fusions are curated, readable, and Emberwake-specific instead of generic or fully combinatorial.
- Out: exhaustive long-term fusion coverage, exact values for every evolved form, or full late-game recipe catalogs.

```mermaid
%% logics-signature: backlog|define-a-curated-first-wave-of-active-pa|req-058-define-a-foundational-survivor-b|a-build-loop-with-actives-and|ac1-the-slice-defines-curated-active
flowchart LR
    Req[Req 058 foundational build system] --> Gap[No payoff layer yet]
    Gap --> Slice[Curated first fusion wave]
    Slice --> Result[Readable build payoff moments]
```

# Acceptance criteria
- AC1: The slice defines curated active + passive fusion posture rather than a combinatorial system.
- AC2: The slice defines a small first-wave fusion target that is implementation-friendly.
- AC3: The slice defines what makes a weapon-passive pair fusion-ready in the first system.
- AC4: The slice defines fused forms as meaningful gameplay and fantasy escalation rather than as hidden numeric upgrades.
- AC5: The slice keeps fusion naming and presentation Emberwake-specific.

# AC Traceability
- AC1 -> Scope: curated posture is explicit. Proof target: fusion-content rules and task notes.
- AC2 -> Scope: first-wave fusion scale is bounded. Proof target: fusion roster plan and implementation scope.
- AC3 -> Scope: readiness rules are explicit. Proof target: upgrade-state and reward-trigger logic.
- AC4 -> Scope: fused forms are distinct payoff states. Proof target: evolved-content definitions and player-facing presentation.
- AC5 -> Scope: Emberwake-specific naming/fantasy is preserved. Proof target: fused-form names and presentation.

# Decision framing
- Product framing: Required
- Product signals: engagement loop, payoff, readability
- Product follow-up: None.
- Architecture framing: Required
- Architecture signals: runtime and boundaries
- Architecture follow-up: Keep payoff logic aligned with the curated fusion ADR rather than growing ad hoc pair rules.

# Links
- Product brief(s): `prod_005_visual_identity_dark_fantasy_with_synthetic_energy_accents`, `prod_008_active_passive_fusion_direction_for_emberwake`
- Architecture decision(s): `adr_040_use_curated_active_passive_fusions_as_the_foundational_build_payoff_layer`
- Request: `req_058_define_a_foundational_survivor_build_system_for_weapons_passives_fusions_and_run_progression`
- Primary task(s): `task_050_orchestrate_the_foundational_survivor_build_system_wave`

# References
- `logics/product/prod_008_active_passive_fusion_direction_for_emberwake.md`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from request `req_058_define_a_foundational_survivor_build_system_for_weapons_passives_fusions_and_run_progression`.
- Source file: `logics/request/req_058_define_a_foundational_survivor_build_system_for_weapons_passives_fusions_and_run_progression.md`.
