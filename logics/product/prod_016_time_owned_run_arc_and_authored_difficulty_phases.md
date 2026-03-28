## prod_016_time_owned_run_arc_and_authored_difficulty_phases - Time-owned run arc and authored difficulty phases
> Date: 2026-03-28
> Status: Validated
> Related request: `req_067_define_a_time_driven_run_progression_and_difficulty_escalation_wave`
> Related backlog: `item_252_define_an_authored_time_phase_model_for_run_progression_beats`, `item_253_define_first_pass_time_driven_pressure_levers_for_spawn_and_enemy_scaling`, `item_254_define_player_facing_phase_signaling_for_time_driven_run_escalation`, `item_255_define_targeted_validation_for_time_owned_run_pacing_and_difficulty_escalation`
> Related task: `task_054_orchestrate_post_0_4_0_runtime_expression_and_progression_waves`
> Related architecture: `adr_039_structure_the_first_survivor_build_loop_around_separate_active_and_passive_slots`, `adr_047_structure_first_pass_run_difficulty_escalation_as_authored_time_phases`
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
The run now grows through the build system, but it still needs a stronger authored survival arc. Time should own part of the pacing, not just level-ups and drops.

```mermaid
flowchart LR
    Problem[Product problem] --> Goals[Goals]
    Goals --> Decisions[Key product decisions]
    Decisions --> Guardrails[Scope and guardrails]
    Guardrails --> Signals[Success signals]
```


# Product problem
Build growth alone does not guarantee a satisfying run arc. Without a time-owned structure:
- pressure can feel flat
- phase changes can feel absent
- survival time lacks authored identity

# Goals
- Give the run clear time-based beats.
- Escalate difficulty in readable authored phases.
- Create stronger pacing synchronization between survival time and combat pressure.

# Non-goals
- Building an all-purpose dynamic director.
- Endless exponential scaling in the first pass.
- Rebalancing every gameplay system at once.

# Direction
## Authored phases first
Use readable survival milestones with named or implicit phases.

## Limited pressure levers first
Start with:
- spawn pressure
- enemy stat pressure

before widening to more exotic systems.

## Phase changes should be felt
Escalation should be noticeable enough that the player reads:
- “the run has changed”

# Success signals
- Runs feel more structured from early to late survival.
- Difficulty escalates in recognizable beats.
- Players can sense time-based pressure growth, not just random noise.

# Risks
- Over-scaling too fast and breaking early fun.
- Making phases so subtle that the system is invisible.
- Widening too fast into a giant encounter-director rewrite.
