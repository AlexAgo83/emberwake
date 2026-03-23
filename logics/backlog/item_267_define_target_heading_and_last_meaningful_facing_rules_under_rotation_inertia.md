## item_267_define_target_heading_and_last_meaningful_facing_rules_under_rotation_inertia - Define target heading and last meaningful facing rules under rotation inertia
> From version: 0.4.0
> Status: Draft
> Understanding: 95%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Rotation inertia needs explicit heading-target and idle-facing rules or it will remain ambiguous.

# Scope
- In: target heading resolution under steering.
- In: holding last meaningful facing while idle.
- Out: hostile-specific turning rules unless trivially reusable.

```mermaid
%% logics-signature: backlog|define-target-heading-and-last-meaningfu|req-071-define-a-bounded-entity-rotation|rotation-inertia-needs-explicit-heading-|ac1-the-slice-defines-target-heading-rul
flowchart LR
    Req[Req 071 rotation inertia] --> Need[Turning needs explicit heading rules]
    Need --> Slice[Target heading and idle facing]
    Slice --> Result[Turning remains readable and stable]
```

# Acceptance criteria
- AC1: The slice defines target-heading rules under rotation inertia.
- AC2: The slice defines holding last meaningful facing while idle.
- AC3: The slice keeps the posture compatible with the current movement model.

# Links
- Architecture decision(s): `adr_051_resolve_player_orientation_through_a_bounded_simulation_owned_turn_rate`
- Request: `req_071_define_a_bounded_entity_rotation_inertia_and_turn_rate_wave`

# Notes
- Derived from request `req_071_define_a_bounded_entity_rotation_inertia_and_turn_rate_wave`.
