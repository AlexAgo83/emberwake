## item_085_define_render_pipeline_and_scene_composition_boundary_between_engine_pixi_and_game_visual_layers - Define render pipeline and scene composition boundary between engine Pixi and game visual layers
> From version: 0.1.2
> Status: Ready
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The runtime boundary is cleaner than before, but the render-pipeline and visual-composition ownership model still risks growing ad hoc as more layers, feedback, and visual systems appear.
- Without a dedicated render-composition architecture, scene modules can become another place where engine and game ownership blur again.

# Scope
- In: Visual-layer ownership, render-pipeline boundaries, engine-Pixi adapter responsibilities, game-owned scene composition responsibilities, and future layer posture for overlays, VFX, and feedback systems.
- Out: Full visual-system implementation, final art direction, or a heavyweight rendering framework.

```mermaid
%% logics-signature: backlog|define-render-pipeline-and-scene-composi|req-020-define-the-next-architecture-wav|the-runtime-boundary-is-cleaner-than|ac1-the-slice-defines-a-render-pipeline
flowchart LR
    Req[Req 020 architecture wave] --> Render[Visual ownership may drift]
    Render --> Layers[Define engine and game layer boundaries]
    Layers --> Scene[Grow scenes without boundary blur]
```

# Acceptance criteria
- AC1: The slice defines a render-pipeline or scene-composition architecture direction between engine-level Pixi adapters and game-owned visual layers.
- AC2: The slice defines where future layers such as world feedback, effects, overlays, and scene-specific composition should live.
- AC3: The resulting boundary remains compatible with the current engine-Pixi runtime primitives and the game-owned presentation model.
- AC4: The work avoids premature heavy abstraction while still preventing visual-layer ownership drift.
- AC5: The slice stays architectural and does not collapse into immediate full rendering implementation.

# AC Traceability
- AC1 -> Scope: Render ownership boundaries are explicit. Proof target: architecture notes, scene-composition model, backlog follow-ups.
- AC2 -> Scope: Future visual-layer posture is defined. Proof target: render-layer guidance, composition rules, engine/game ownership notes.
- AC3 -> Scope: The boundary fits current runtime primitives. Proof target: compatibility with engine-pixi components and game presentation outputs.
- AC4 -> Scope: The work stays pragmatic. Proof target: bounded scope, absence of unnecessary framework abstraction.
- AC5 -> Scope: The slice remains architecture-first. Proof target: scope statement, backlog split, implementation follow-up posture.

# Decision framing
- Product framing: Consider
- Product signals: engagement loop
- Product follow-up: Keep future visual richness compatible with runtime readability and maintainability.
- Architecture framing: Required
- Architecture signals: runtime and boundaries, contracts and integration
- Architecture follow-up: Clarify visual ownership before VFX and richer feedback start multiplying scene responsibilities.

# Links
- Product brief(s): `prod_002_readable_world_traversal_and_presence`, `prod_003_high_density_top_down_survival_action_direction`
- Architecture decision(s): `adr_002_separate_react_shell_from_pixi_runtime_ownership`, `adr_015_define_engine_to_game_runtime_contract_boundaries`
- Request: `req_020_define_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement`

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from request `req_020_define_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement`.
- Source file: `logics/request/req_020_define_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement.md`.
