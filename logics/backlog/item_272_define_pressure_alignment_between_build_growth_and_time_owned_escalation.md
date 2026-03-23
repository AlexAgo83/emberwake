## item_272_define_pressure_alignment_between_build_growth_and_time_owned_escalation - Define pressure alignment between build growth and time-owned escalation
> From version: 0.4.0
> Status: Draft
> Understanding: 95%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Difficulty pacing only works if build growth and hostile pressure rise on understandable parallel curves.

# Scope
- In: alignment between player growth and early/mid/late pressure.
- In: first-pass pacing targets across the run arc.
- Out: adaptive dynamic difficulty.

```mermaid
%% logics-signature: backlog|define-pressure-alignment-between-build-|req-072-define-a-first-playable-balance-|difficulty-pacing-only-works-if-build|ac1-the-slice-defines-pressure-alignment
flowchart LR
    Req[Req 072 first balance wave] --> Need[Power growth and pressure must align]
    Need --> Slice[Pressure alignment]
    Slice --> Result[Run pacing becomes legible]
```

# Acceptance criteria
- AC1: The slice defines pressure alignment between build growth and time-owned escalation.
- AC2: The slice covers early, mid, and late pressure expectations.
- AC3: The slice remains authored and explainable.

# Links
- Architecture decision(s): `adr_036_externalize_retunable_gameplay_and_system_tuning_as_validated_json_contracts`, `adr_047_structure_first_pass_run_difficulty_escalation_as_authored_time_phases`
- Request: `req_072_define_a_first_playable_balance_wave_for_build_power_run_economy_and_difficulty_pacing`

# Notes
- Derived from request `req_072_define_a_first_playable_balance_wave_for_build_power_run_economy_and_difficulty_pacing`.
