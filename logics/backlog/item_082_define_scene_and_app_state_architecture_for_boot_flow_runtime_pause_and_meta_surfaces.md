## item_082_define_scene_and_app_state_architecture_for_boot_flow_runtime_pause_and_meta_surfaces - Define scene and app state architecture for boot flow runtime pause and meta surfaces
> From version: 0.1.2
> Status: Done
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The runtime core is now converged, but the application still lacks an explicit scene or app-state architecture for non-trivial flow around the core game loop.
- Without a dedicated structure for `boot`, `runtime`, `pause`, `failure`, `settings`, and similar meta-surfaces, `AppShell` risks becoming the next oversized orchestration hub.

# Scope
- In: Scene or app-state ownership model, runtime-entry flow, transitions between core runtime and meta-surfaces, and shell-level orchestration boundaries.
- Out: Full implementation of every future scene, broad UX redesign, or gameplay-system definition.

```mermaid
%% logics-signature: backlog|define-scene-and-app-state-architecture-|req-020-define-the-next-architecture-wav|the-runtime-core-is-now-converged|ac1-the-slice-defines-an-explicit
flowchart LR
    Req[Req 020 architecture wave] --> State[App state is still implicit]
    State --> Scenes[Define scene and shell flow]
    Scenes --> Shell[Keep AppShell from bloating]
```

# Acceptance criteria
- AC1: The slice defines an explicit scene or app-state architecture covering at least `boot`, `runtime`, `pause`, `failure`, `settings`, and equivalent meta-surfaces.
- AC2: The slice defines which layer owns scene transitions and high-level app state versus gameplay runtime state.
- AC3: The slice remains compatible with the existing engine-owned runtime runner and game-module posture.
- AC4: The resulting architecture reduces the risk of `AppShell` becoming an oversized cross-cutting controller.
- AC5: The work stays architectural and does not expand into full implementation of every scene or surface.

# AC Traceability
- AC1 -> Scope: A scene/app-state model is documented and usable. Proof target: architecture notes, backlog follow-ups, app-shell flow definitions.
- AC2 -> Scope: Ownership between shell state and gameplay state is explicit. Proof target: state model docs, app architecture notes, task report.
- AC3 -> Scope: The scene architecture fits the converged runtime. Proof target: references to runtime runner, game-module boundary, shell integration plan.
- AC4 -> Scope: `AppShell` growth risk is reduced structurally. Proof target: architecture diagrams, planned module split, orchestration rules.
- AC5 -> Scope: The work stays focused on architecture framing. Proof target: bounded scope, absence of broad scene implementation churn.

# Decision framing
- Product framing: Required
- Product signals: navigation and discoverability, engagement loop
- Product follow-up: Use the scene model to support future player-facing surfaces without reopening runtime ownership questions.
- Architecture framing: Required
- Architecture signals: runtime and boundaries, contracts and integration
- Architecture follow-up: Capture the app-state ownership model clearly before more meta-surfaces are added.

# Links
- Product brief(s): `prod_000_initial_single_entity_navigation_loop`
- Architecture decision(s): `adr_002_separate_react_shell_from_pixi_runtime_ownership`, `adr_015_define_engine_to_game_runtime_contract_boundaries`, `adr_016_define_shell_scene_state_and_meta_surface_ownership`
- Request: `req_020_define_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement`
- Primary task(s): `task_028_orchestrate_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from request `req_020_define_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement`.
- Source file: `logics/request/req_020_define_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement.md`.
- Implemented through `task_028_orchestrate_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement`.
