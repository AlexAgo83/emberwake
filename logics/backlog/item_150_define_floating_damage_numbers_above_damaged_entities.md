## item_150_define_floating_damage_numbers_above_damaged_entities - Define floating damage numbers above damaged entities
> From version: 0.2.3
> Status: Draft
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Damage values are not yet surfaced visually at the point of impact.
- Without floating damage numbers, hit magnitude stays too implicit.

# Scope
- In: defining floating damage numbers above damaged entities.
- Out: healing numbers, crit typography systems, or combo counters.

```mermaid
%% logics-signature: backlog|define-floating-damage-numbers-above-dam|req-041-define-damage-reaction-fx-and-fl|damage-values-are-not-yet-surfaced|ac1-the-slice-defines-floating-damage
flowchart LR
    Req[Req 041 damage feedback] --> Gap[Damage magnitude is too implicit]
    Gap --> Slice[Define floating damage numbers]
    Slice --> Result[Hit values read directly above damaged entities]
```

# Acceptance criteria
- AC1: The slice defines floating damage numbers strongly enough to guide implementation.
- AC2: The slice defines their placement above damaged entities.
- AC3: The slice defines integer-only or similarly bounded value presentation.
- AC4: The slice stays narrow and does not reopen a larger combat-text system.

# Links
- Request: `req_041_define_damage_reaction_fx_and_floating_damage_numbers_for_runtime_combat`

# Notes
- Derived from request `req_041_define_damage_reaction_fx_and_floating_damage_numbers_for_runtime_combat`.
