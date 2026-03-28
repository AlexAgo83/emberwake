## task_028_orchestrate_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement - Orchestrate the next architecture wave for app state loading content rendering and boundary enforcement
> From version: 0.5.0
> Status: Done
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog items `item_082_define_scene_and_app_state_architecture_for_boot_flow_runtime_pause_and_meta_surfaces`, `item_083_define_runtime_loading_and_performance_architecture_for_pixi_mobile_startup_and_chunk_strategy`, `item_084_define_content_authoring_and_validation_architecture_for_gameplay_world_and_entity_data`, `item_085_define_render_pipeline_and_scene_composition_boundary_between_engine_pixi_and_game_visual_layers`, and `item_086_define_boundary_enforcement_strategy_for_public_modules_import_rules_and_architecture_regression_checks`.
- Related request(s): `req_020_define_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement`.
- The runtime core is now converged, but the next architecture risks have shifted outward into app-state structure, loading posture, content contracts, render-layer ownership, and boundary-regression prevention.
- This orchestration task groups those five architecture points into one coherent follow-up wave so the next implementation slices can build on a consistent direction instead of ad hoc local decisions.

# Dependencies
- Blocking: `task_027_orchestrate_runtime_convergence_and_modular_boundary_hardening`.
- Unblocks: future player-facing scene work, runtime-loading optimization, richer content systems, render-layer growth, and stronger architecture-regression prevention across app, engine, and game modules.

```mermaid
%% logics-signature: task|orchestrate-the-next-architecture-wave-f|item-082-define-scene-and-app-state-arch|1-define-a-scene-and-app-state|npm-run-ci
flowchart LR
    State[item_082 scene or app state] --> Wave[Next architecture wave]
    Loading[item_083 loading and performance] --> Wave
    Content[item_084 content authoring and validation] --> Wave
    Render[item_085 render pipeline and scene composition] --> Wave
    Enforcement[item_086 boundary enforcement] --> Wave
```

# Plan
- [x] 1. Define a scene and app-state architecture for `boot`, `runtime`, `pause`, `failure`, `settings`, and equivalent meta-surfaces, with explicit ownership between shell state and gameplay runtime state.
- [x] 2. Define a runtime-loading and performance architecture for Pixi startup, chunk or lazy-loading boundaries, and mobile-sensitive startup constraints.
- [x] 3. Define a content-authoring and validation architecture for gameplay, world, entity, and scenario data, including id/reference posture and validation direction.
- [x] 4. Define a render-pipeline and scene-composition boundary between engine-level Pixi adapters and game-owned visual layers.
- [x] 5. Define a stronger boundary-enforcement strategy for public modules, import rules, and architecture-regression checks.
- [x] 6. Split the resulting architecture wave into implementation-ready follow-up backlog or task slices where needed, and update linked Logics docs with the chosen posture.
- [x] 7. Validate the resulting architecture docs and any implementation-safe outputs against current repository constraints and delivery posture.
- [x] FINAL: Create a dedicated git commit for this orchestration scope.

# AC Traceability
- `item_082` -> Scene/app-state ownership is explicit for runtime and meta-surfaces. Proof target: architecture notes, scene model, app-shell ownership guidance.
- `item_083` -> Loading and startup posture are defined architecturally. Proof target: loading strategy docs, chunk or lazy-boundary guidance, mobile-startup constraints.
- `item_084` -> Content-authoring and validation posture are explicit. Proof target: content contracts, id/reference guidance, validation direction.
- `item_085` -> Render-layer ownership between engine and game is explicit. Proof target: render-pipeline notes, scene-composition model, visual-layer guidance.
- `item_086` -> Boundary-enforcement strategy is explicit and durable. Proof target: import-rule strategy, regression-check guidance, architecture-enforcement notes.

# Request AC Traceability
- req_020_define_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement coverage: AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8, AC9. Proof: `task_028_orchestrate_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement` closes the linked request chain for `req_020_define_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement` and carries the delivery evidence for `item_086_define_boundary_enforcement_strategy_for_public_modules_import_rules_and_architecture_regression_checks`.


# Decision framing
- Product framing: Required
- Product signals: navigation and discoverability, conversion journey, engagement loop
- Product follow-up: Use this wave to keep future player-facing systems additive rather than structurally disruptive.
- Architecture framing: Required
- Architecture signals: runtime and boundaries, contracts and integration, delivery and operations
- Architecture follow-up: Keep the five architecture points coordinated so scene, loading, content, render, and enforcement decisions do not contradict one another.

# Links
- Product brief(s): `prod_000_initial_single_entity_navigation_loop`, `prod_003_high_density_top_down_survival_action_direction`
- Architecture decision(s): `adr_002_separate_react_shell_from_pixi_runtime_ownership`, `adr_004_run_simulation_on_a_fixed_timestep`, `adr_014_adopt_a_modular_app_engine_game_topology_with_one_way_dependencies`, `adr_015_define_engine_to_game_runtime_contract_boundaries`, `adr_016_define_shell_scene_state_and_meta_surface_ownership`, `adr_017_lazy_load_pixi_runtime_behind_a_shell_owned_boot_boundary`, `adr_018_validate_emberwake_content_as_a_typed_cross_catalog_graph`, `adr_019_keep_engine_pixi_as_adapter_and_game_as_runtime_scene_composer`, `adr_020_enforce_architecture_boundaries_with_targeted_module_scoped_lint_rules`
- Backlog item(s): `item_082_define_scene_and_app_state_architecture_for_boot_flow_runtime_pause_and_meta_surfaces`, `item_083_define_runtime_loading_and_performance_architecture_for_pixi_mobile_startup_and_chunk_strategy`, `item_084_define_content_authoring_and_validation_architecture_for_gameplay_world_and_entity_data`, `item_085_define_render_pipeline_and_scene_composition_boundary_between_engine_pixi_and_game_visual_layers`, `item_086_define_boundary_enforcement_strategy_for_public_modules_import_rules_and_architecture_regression_checks`
- Request(s): `req_020_define_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement`

# Validation
- `npm run ci`
- `npm run test:browser:smoke`
- `npm run release:ready:advisory`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Done (DoD)
- [x] Covered backlog items are implemented or explicitly split further with updated traceability.
- [x] The repository has a coherent next-phase architecture direction for scene state, loading posture, content contracts, render-layer ownership, and boundary enforcement.
- [x] The resulting architecture wave remains compatible with the current runtime runner, game-module contract, static frontend posture, and release discipline.
- [x] Linked request, backlog, task, and architecture docs are updated with proofs and status.
- [x] A dedicated git commit has been created for the completed orchestration scope.
- [x] Status is `Done` and progress is `100%`.

# Report
- Added a shell-owned app-scene contract in `src/app/model/appScene.ts` and `src/app/hooks/useAppScene.ts`, so the shell now has an explicit vocabulary for `boot`, `runtime`, `failure`, and future `pause` or `settings` surfaces without moving gameplay state into the app layer.
- Added a shell-owned runtime boundary in `src/app/components/RuntimeSceneBoundary.tsx` and rewired `src/app/AppShell.tsx` to lazy load the Pixi runtime behind a boot or failure surface instead of importing the runtime surface eagerly from the shell.
- Added `games/emberwake/src/content/contentAuthoring.ts` plus `games/emberwake/src/content/contentAuthoring.test.ts`, establishing a game-owned cross-catalog validation pass for assets, terrain references, archetype defaults, scenario ids, and entity ids.
- Added `games/emberwake/src/presentation/emberwakeRenderLayers.ts` and rewired `src/game/render/RuntimeSurface.tsx` so runtime layer order is now declared by the game module while Pixi adapter ownership stays outside the game layer.
- Hardened boundary enforcement in `eslint.config.js`, including new restrictions for `games/emberwake/src/content`, `games/emberwake/src/presentation`, and `src/app`.
- Fixed a real architecture leak uncovered by those lint rules by moving the debug-entity helper from `games/emberwake/src/content/scenarios/entityDebugScenario.ts` to `games/emberwake/src/runtime/debugEntities.ts`.
- Added accepted ADRs `adr_016` through `adr_020` so the scene-state, loading, content, render, and enforcement postures are now explicit repository decisions rather than local implementation choices.
- Validation completed with:
  `npm run ci`
  `npm run test:browser:smoke`
  `npm run release:ready:advisory`
  `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Delivery was split across staged commits:
  `dd5a025 Add app scene shell and lazy runtime boundary`
  `b4dbbe8 Add content validation and render layer contracts`
  `2c842f3 Harden architecture boundary enforcement`
