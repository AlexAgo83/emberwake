## item_149_define_a_first_hit_reaction_fx_posture_for_damaged_runtime_combatants - Define a first hit-reaction FX posture for damaged runtime combatants
> From version: 0.2.3
> Status: Draft
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Damage is applied mechanically, but entities still lack a clear immediate hit-confirmation reaction.
- Without a bounded hit FX posture, combat feedback remains too soft.

# Scope
- In: defining a lightweight first hit-reaction FX posture for damaged combatants.
- Out: audio feedback, critical-hit variants, or layered cinematic combat effects.

```mermaid
%% logics-signature: backlog|define-a-first-hit-reaction-fx-posture-f|req-041-define-damage-reaction-fx-and-fl|damage-is-applied-mechanically-but-entit|ac1-the-slice-defines-a-lightweight
flowchart LR
    Req[Req 041 damage feedback] --> Gap[Hit confirmation is too weak]
    Gap --> Slice[Define first hit reaction FX]
    Slice --> Result[Damage events read immediately on the impacted entity]
```

# Acceptance criteria
- AC1: The slice defines a lightweight hit-reaction FX posture strongly enough to guide implementation.
- AC2: The slice keeps the treatment bounded and reusable across player and hostiles.
- AC3: The slice stays narrow and does not widen into a full combat-VFX system.
- AC4: The slice keeps the first effect readable and low-cost.

# Links
- Request: `req_041_define_damage_reaction_fx_and_floating_damage_numbers_for_runtime_combat`

# Notes
- Derived from request `req_041_define_damage_reaction_fx_and_floating_damage_numbers_for_runtime_combat`.
