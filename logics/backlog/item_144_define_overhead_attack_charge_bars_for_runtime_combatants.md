## item_144_define_overhead_attack_charge_bars_for_runtime_combatants - Define overhead attack-charge bars for runtime combatants
> From version: 0.2.3
> Status: Draft
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Attack cadence exists mechanically, but the next available attack window is still too hard to read in live combat.
- Without overhead charge bars, the rhythm of player and hostile attacks stays more implicit than necessary.

# Scope
- In: defining overhead attack-charge bars that indicate readiness for the next available attack.
- Out: stamina systems, damage-over-time bars, or broader combat-timing UI redesign.

```mermaid
%% logics-signature: backlog|define-overhead-attack-charge-bars-for-r|req-039-define-overhead-health-and-attac|attack-cadence-exists-mechanically-but-t|ac1-the-slice-defines-overhead-attack-ch
flowchart LR
    Req[Req 039 overhead combat bars] --> Gap[Attack readiness is too implicit]
    Gap --> Slice[Define overhead charge bars]
    Slice --> Result[Next attack timing reads directly in world space]
```

# Acceptance criteria
- AC1: The slice defines overhead attack-charge bars strongly enough to guide implementation.
- AC2: The slice defines the bar as a readiness indicator that fills toward attack availability.
- AC3: The slice keeps the target scope bounded to player and hostile combatants.
- AC4: The slice stays narrow and does not reopen broader combat-resource systems.

# Links
- Request: `req_039_define_overhead_health_and_attack_charge_bars_for_runtime_combatants`

# Notes
- Derived from request `req_039_define_overhead_health_and_attack_charge_bars_for_runtime_combatants`.
