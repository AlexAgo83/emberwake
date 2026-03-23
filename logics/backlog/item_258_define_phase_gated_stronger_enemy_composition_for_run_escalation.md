## item_258_define_phase_gated_stronger_enemy_composition_for_run_escalation - Define phase-gated stronger enemy composition for run escalation
> From version: 0.4.0
> Status: Draft
> Understanding: 95%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Escalation currently leans too heavily on numeric pressure rather than introducing stronger hostile forms over time.

# Scope
- In: stronger enemy forms or tiers entering later phases.
- In: authored composition progression by run phase.
- Out: full procedural encounter director logic.

```mermaid
%% logics-signature: backlog|define-phase-gated-stronger-enemy-compos|req-069-define-a-smoother-early-game-and|escalation-currently-leans-too-heavily-o|ac1-the-slice-defines-stronger-enemy
flowchart LR
    Req[Req 069 difficulty normalization] --> Need[Numeric scaling alone is not enough]
    Need --> Slice[Stronger enemy composition]
    Slice --> Result[Phase escalation gains clearer identity]
```

# Acceptance criteria
- AC1: The slice defines stronger enemy composition as part of authored escalation.
- AC2: Stronger hostile forms or tiers enter later than baseline hostiles.
- AC3: The slice keeps composition progression readable and phase-driven.

# Links
- Architecture decision(s): `adr_049_structure_time_scaled_enemy_pressure_around_authored_population_opening_composition_tiers_and_mini_boss_beats`
- Request: `req_069_define_a_smoother_early_game_and_stronger_time_scaled_enemy_pressure_wave`

# Notes
- Derived from request `req_069_define_a_smoother_early_game_and_stronger_time_scaled_enemy_pressure_wave`.
