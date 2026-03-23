## item_266_define_a_simulation_owned_turn_rate_contract_for_player_entity_facing - Define a simulation-owned turn-rate contract for player entity facing
> From version: 0.4.0
> Status: Done
> Understanding: 95%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Player facing still snaps too directly to the latest movement vector.

# Scope
- In: simulation-owned turn-rate contract for player orientation.
- In: bounded turn responsiveness instead of instant snaps.
- Out: broad physics rewrite or renderer-only fake smoothing.

```mermaid
%% logics-signature: backlog|define-a-simulation-owned-turn-rate-cont|req-071-define-a-bounded-entity-rotation|player-facing-still-snaps-too-directly|ac1-the-slice-defines-a-simulation-owned
flowchart LR
    Req[Req 071 rotation inertia] --> Need[Player facing still snaps]
    Need --> Slice[Turn-rate contract]
    Slice --> Result[Facing changes become bounded and readable]
```

# Acceptance criteria
- AC1: The slice defines a simulation-owned turn-rate contract for player facing.
- AC2: The slice removes instant orientation snaps under ordinary steering.
- AC3: The slice stays deterministic and compatible with pseudo-physical movement.

# Links
- Architecture decision(s): `adr_051_resolve_player_orientation_through_a_bounded_simulation_owned_turn_rate`
- Request: `req_071_define_a_bounded_entity_rotation_inertia_and_turn_rate_wave`

# Notes
- Derived from request `req_071_define_a_bounded_entity_rotation_inertia_and_turn_rate_wave`.
