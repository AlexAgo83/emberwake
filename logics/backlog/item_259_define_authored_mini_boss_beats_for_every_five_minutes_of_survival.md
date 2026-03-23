## item_259_define_authored_mini_boss_beats_for_every_five_minutes_of_survival - Define authored mini-boss beats for every five minutes of survival
> From version: 0.4.0
> Status: Done
> Understanding: 95%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The run lacks clear threat peaks that punctuate survival milestones.

# Scope
- In: authored mini-boss appearances on a first-pass cadence of every 5 minutes.
- In: bounded mini-boss threat spikes within the time-owned run arc.
- Out: full boss roster expansion or stage-specific boss scripting.

```mermaid
%% logics-signature: backlog|define-authored-mini-boss-beats-for-ever|req-069-define-a-smoother-early-game-and|the-run-lacks-clear-threat-peaks|ac1-the-slice-defines-authored-mini-boss
flowchart LR
    Req[Req 069 difficulty normalization] --> Need[Run lacks clear threat peaks]
    Need --> Slice[Mini-boss beats]
    Slice --> Result[Survival milestones gain authored spikes]
```

# Acceptance criteria
- AC1: The slice defines authored mini-boss beats as part of the run arc.
- AC2: The first-pass cadence is one mini-boss every 5 minutes unless tuning explicitly revises it.
- AC3: Mini-boss appearances read as legible spikes rather than chaotic overload.

# Links
- Architecture decision(s): `adr_049_structure_time_scaled_enemy_pressure_around_authored_population_opening_composition_tiers_and_mini_boss_beats`
- Request: `req_069_define_a_smoother_early_game_and_stronger_time_scaled_enemy_pressure_wave`

# Notes
- Derived from request `req_069_define_a_smoother_early_game_and_stronger_time_scaled_enemy_pressure_wave`.
