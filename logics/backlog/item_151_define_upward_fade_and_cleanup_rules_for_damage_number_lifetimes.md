## item_151_define_upward_fade_and_cleanup_rules_for_damage_number_lifetimes - Define upward fade and cleanup rules for damage-number lifetimes
> From version: 0.5.0
> Status: Done
> Understanding: 100%
> Confidence: 100%
> Progress: 100%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Floating numbers need explicit lifetime and cleanup rules or they will become noisy or persistent.
- Without bounded motion/disappearance rules, the effect can degrade readability quickly.

# Scope
- In: defining upward drift, fade/disappearance, and cleanup rules for floating damage numbers.
- Out: richer particle systems, screen-space combat typography, or animation-authoring frameworks.

```mermaid
%% logics-signature: backlog|define-upward-fade-and-cleanup-rules-for|req-041-define-damage-reaction-fx-and-fl|floating-numbers-need-explicit-lifetime-|ac1-the-slice-defines-upward-motion
flowchart LR
    Req[Req 041 damage feedback] --> Gap[Damage numbers need bounded lifetime]
    Gap --> Slice[Define upward fade and cleanup]
    Slice --> Result[Damage numbers stay readable and self-cleaning]
```

# Acceptance criteria
- AC1: The slice defines upward motion for floating damage numbers.
- AC2: The slice defines automatic fade/disappearance behavior after a short lifetime.
- AC3: The slice defines cleanup behavior so expired numbers do not persist.
- AC4: The slice stays narrow and avoids reopening broader text-animation systems.

# Request AC Traceability
- req_041_define_damage_reaction_fx_and_floating_damage_numbers_for_runtime_combat coverage: AC1, AC2, AC3, AC4, AC5, AC6. Proof: `item_151_define_upward_fade_and_cleanup_rules_for_damage_number_lifetimes` remains the request-closing backlog slice for `req_041_define_damage_reaction_fx_and_floating_damage_numbers_for_runtime_combat` and stays linked to `task_041_orchestrate_combat_readability_spawn_direction_pathfinding_and_map_generation_wave` for delivered implementation evidence.


# Links
- Request: `req_041_define_damage_reaction_fx_and_floating_damage_numbers_for_runtime_combat`

# Notes
- Derived from request `req_041_define_damage_reaction_fx_and_floating_damage_numbers_for_runtime_combat`.
- Implemented in `a27102c`.
- Damage numbers now drift upward, fade out, and clean themselves up after a bounded lifetime.
