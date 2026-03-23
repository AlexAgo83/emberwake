## item_229_define_a_transient_runtime_renderer_slice_for_weapon_traces_pulses_and_zone_markers - Define a transient runtime renderer slice for weapon traces pulses and zone markers
> From version: 0.4.0
> Status: Done
> Understanding: 100%
> Confidence: 98%
> Progress: 100%
> Complexity: Medium
> Theme: Rendering
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Even with an event seam, the runtime still needs a dedicated transient render layer for weapon feedback.
- The current entity renderer already separates stable entity visuals from overlays, but it does not yet own weapon traces, pulses, bursts, or temporary zone markers as first-class combat feedback.
- Without a dedicated renderer slice, first-wave weapon signatures will remain inconsistent or end up mixed into unrelated entity draw paths.

# Scope
- In: defining a bounded transient render layer for first-wave weapon feedback.
- In: supporting traces, slash ribbons, pulse arcs, bursts, and temporary zone markers.
- In: keeping the layer aligned with the current render-split posture and performance constraints.
- Out: full cinematic VFX framework, particle system expansion, or audio integration.

```mermaid
%% logics-signature: backlog|define-a-transient-runtime-renderer-slic|req-061-define-a-first-combat-skill-feed|even-with-an-event-seam-the|ac1-the-slice-defines-a-bounded
flowchart LR
    Req[Req 061 combat skill feedback wave] --> Need[Weapon feedback needs a transient render layer]
    Need --> Slice[Runtime traces pulses and zone markers]
    Slice --> Result[Readable skill feedback layer]
```

# Acceptance criteria
- AC1: The slice defines a bounded transient renderer for first-wave weapon feedback.
- AC2: The slice supports the core effect families needed by the first roster: traces, pulses, bursts, and short-lived area markers.
- AC3: The slice preserves the current render posture of stable entity geometry plus transient overlays.
- AC4: The slice avoids widening into a broad VFX-system rewrite.

# AC Traceability
- AC1 -> Scope: renderer slice exists. Proof target: dedicated render-layer implementation and wiring.
- AC2 -> Scope: first-wave effect families are covered. Proof target: supported feedback primitives.
- AC3 -> Scope: render architecture remains coherent. Proof target: layer placement and file ownership.
- AC4 -> Scope: wave stays bounded. Proof target: explicit exclusions and implementation notes.

# Decision framing
- Product framing: Required
- Product signals: readability, feel, combat expression
- Product follow-up: None.
- Architecture framing: Consider
- Architecture signals: runtime and boundaries
- Architecture follow-up: keep the layer consistent with `adr_038` and `adr_042`.

# Links
- Product brief(s): `prod_011_techno_shinobi_combat_skill_feedback_direction_for_first_playable_weapons`
- Architecture decision(s): `adr_038_split_entity_player_rendering_into_stable_geometry_and_transient_combat_overlays`, `adr_042_separate_weapon_simulation_from_transient_combat_skill_feedback_presentation`
- Request: `req_061_define_a_first_combat_skill_feedback_wave_for_playable_weapons`
- Primary task(s): `task_053_orchestrate_the_first_playable_combat_skill_feedback_wave`

# References
- `logics/product/prod_011_techno_shinobi_combat_skill_feedback_direction_for_first_playable_weapons.md`
- `logics/architecture/adr_042_separate_weapon_simulation_from_transient_combat_skill_feedback_presentation.md`
- `logics/request/req_061_define_a_first_combat_skill_feedback_wave_for_playable_weapons.md`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from request `req_061_define_a_first_combat_skill_feedback_wave_for_playable_weapons`.
- Source file: `logics/request/req_061_define_a_first_combat_skill_feedback_wave_for_playable_weapons.md`.
- Implemented through `src/game/render/CombatSkillFeedbackScene.tsx` and runtime-surface wiring so the transient feedback layer stays separate from stable entity geometry.
