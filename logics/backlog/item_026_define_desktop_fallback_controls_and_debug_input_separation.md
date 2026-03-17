## item_026_define_desktop_fallback_controls_and_debug_input_separation - Define desktop fallback controls and debug input separation
> From version: 0.1.2
> Status: Done
> Understanding: 94%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Desktop support must remain practical without redefining the mobile-first product loop.
- This slice defines fallback controls and separates them from developer-facing debug input paths.

# Scope
- In: Keyboard fallback controls, debug-input separation, and desktop interaction posture.
- Out: Primary mobile steering rules or inspection panel behavior.

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: The request defines a player interaction scope dedicated to world and entity interactions rather than leaving input behavior implicit across rendering requests.
- AC2: The request defines the first interaction verbs relevant to the project, including at least selecting, inspecting, commanding, and camera-related interactions where ownership matters.
- AC3: The request treats direct control of a single entity as the primary first interaction layer, while selection and inspection stay secondary and debug-friendly in the first loop.
- AC4: The request remains compatible with a first mobile-first direct-control slice in which a single entity is steered through the world using a touch drag input similar to a virtual joypad.
- AC5: The request treats the primary touch-drag gesture in the first player loop as entity steering rather than camera dragging.
- AC6: The request defines a visible virtual-stick baseline with a small dead zone and clamped proportional magnitude for the first mobile control scheme.
- AC7: The request keeps the first player-facing movement gesture model single-finger and avoids conflicting concurrent gesture ownership for movement.
- AC8: The request distinguishes between interactions targeting the world, interactions targeting entities, and interactions targeting UI or system overlays.
- AC9: The request covers both desktop and mobile interaction expectations at a product level, with `WASD` or arrow-key movement treated as the preferred desktop fallback and direct gestures favored for movement on mobile.
- AC10: The request stays compatible with the camera pan or zoom or rotation model defined in `req_001_render_top_down_infinite_chunked_world_map` while allowing free camera manipulation to remain debug-oriented in the first loop.
- AC11: The request remains compatible with the entity rendering and inspection expectations defined in `req_002_render_evolving_world_entities_on_the_map`.
- AC12: The request avoids prematurely locking in advanced gameplay systems that belong to later requests.

# AC Traceability
- AC1 -> Scope: Player interaction ownership is explicit across steering, camera debug, and overlays. Proof: `src/game/input/hooks/useSingleEntityControl.ts`, `src/game/camera/hooks/useCameraController.ts`, `src/app/AppShell.tsx`.
- AC2 -> Scope: Movement, selection, inspection, and camera-debug ownership are all represented. Proof: `src/game/input/hooks/useSingleEntityControl.ts`, `src/game/entities/hooks/useEntityWorld.ts`, `src/app/AppShell.tsx`.
- AC3 -> Scope: Direct control of a single entity remains primary while inspection stays secondary. Proof: `src/game/input/hooks/useSingleEntityControl.ts`, `src/app/components/EntityInspectionPanel.tsx`.
- AC4 -> Scope: Desktop fallback stays compatible with the mobile-first direct-control slice. Proof: `src/game/input/hooks/useSingleEntityControl.ts`, `src/app/components/PlayerHudCard.tsx`.
- AC5 -> Scope: Touch drag remains reserved for entity steering. Proof: `src/game/input/hooks/useSingleEntityControl.ts`, `src/game/input/hooks/useMobileVirtualStick.ts`.
- AC6 -> Scope: Virtual-stick baseline is already reflected in the player HUD and steering hook. Proof: `src/game/input/hooks/useMobileVirtualStick.ts`, `src/app/components/PlayerHudCard.tsx`.
- AC7 -> Scope: Single-finger movement ownership remains intact. Proof: `src/game/input/hooks/useMobileVirtualStick.ts`.
- AC8 -> Scope: World, entity, and UI targets remain distinct. Proof: `src/game/world/hooks/useWorldInteractionDiagnostics.ts`, `src/game/entities/hooks/useEntityWorld.ts`, `src/app/AppShell.tsx`.
- AC9 -> Scope: WASD or arrows remain the preferred desktop fallback. Proof: `src/game/input/hooks/useSingleEntityControl.ts`, `src/app/components/PlayerHudCard.tsx`.
- AC10 -> Scope: Free camera manipulation remains debug-oriented and gated by the debug modifier. Proof: `src/game/camera/hooks/useCameraController.ts`, `src/app/AppShell.tsx`.
- AC11 -> Scope: Desktop fallback remains compatible with rendered and inspectable entities. Proof: `src/game/entities/render/EntityScene.tsx`, `src/app/components/EntityInspectionPanel.tsx`.
- AC12 -> Scope: The slice stays focused on input posture rather than advanced gameplay. Proof: `src/game/input/hooks/useSingleEntityControl.ts`.

# Decision framing
- Product framing: Consider
- Product signals: navigation and discoverability
- Product follow-up: Review whether a product brief is needed before scope becomes harder to change.
- Architecture framing: Consider
- Architecture signals: contracts and integration
- Architecture follow-up: Review whether an architecture decision is needed before implementation becomes harder to reverse.

# Links
- Product brief(s): `prod_000_initial_single_entity_navigation_loop`
- Architecture decision(s): `adr_007_isolate_runtime_input_from_browser_page_controls`
- Request: `req_006_define_player_interactions_for_world_and_entities`
- Primary task(s): `task_010_define_single_entity_control_contract_and_input_ownership_boundaries`, `task_011_define_mobile_virtual_stick_steering_model_for_the_first_player_loop`, `task_017_orchestrate_player_facing_interaction_feedback_and_overlay_surfaces`

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from request `req_006_define_player_interactions_for_world_and_entities`.
- Source file: `logics/request/req_006_define_player_interactions_for_world_and_entities.md`.
- Request context seeded into this backlog item from `logics/request/req_006_define_player_interactions_for_world_and_entities.md`.
- Completed across `task_010_define_single_entity_control_contract_and_input_ownership_boundaries`, `task_011_define_mobile_virtual_stick_steering_model_for_the_first_player_loop`, and `task_017_orchestrate_player_facing_interaction_feedback_and_overlay_surfaces`.
