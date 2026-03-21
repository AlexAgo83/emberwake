## item_143_define_overhead_health_bars_for_runtime_combatants - Define overhead health bars for runtime combatants
> From version: 0.2.3
> Status: Draft
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Combatants can lose health, but that state is still too implicit at entity level during live play.
- Without overhead health bars, target prioritization and combat readability remain weaker than they should be.

# Scope
- In: defining overhead health bars for player and hostile combatants in runtime.
- Out: pickups, support entities, armor/shield layers, or long-form inspection overlays.

```mermaid
%% logics-signature: backlog|define-overhead-health-bars-for-runtime-|req-039-define-overhead-health-and-attac|combatants-can-lose-health-but-that|ac1-the-slice-defines-overhead-health
flowchart LR
    Req[Req 039 overhead combat bars] --> Gap[Combat health is too implicit]
    Gap --> Slice[Define overhead health bars]
    Slice --> Result[Combat survivability reads directly above entities]
```

# Acceptance criteria
- AC1: The slice defines overhead health bars strongly enough to guide implementation.
- AC2: The slice defines the target scope around player and hostile combatants.
- AC3: The slice defines the bars as world-space runtime overlays above the entity.
- AC4: The slice stays narrow and does not reopen broader HUD or status-effect work.

# Links
- Request: `req_039_define_overhead_health_and_attack_charge_bars_for_runtime_combatants`

# Notes
- Derived from request `req_039_define_overhead_health_and_attack_charge_bars_for_runtime_combatants`.
