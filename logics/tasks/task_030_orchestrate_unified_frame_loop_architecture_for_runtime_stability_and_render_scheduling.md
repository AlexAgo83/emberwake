## task_030_orchestrate_unified_frame_loop_architecture_for_runtime_stability_and_render_scheduling - Orchestrate unified frame loop architecture for runtime stability and render scheduling
> From version: 0.5.0
> Status: Done
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog items `item_090_define_the_target_master_frame_loop_between_runtime_runner_presentation_and_pixi_render_submission`, `item_091_define_hot_path_state_publication_rules_between_runtime_shell_and_diagnostics_surfaces`, and `item_092_define_frame_pacing_profiling_and_validation_for_unified_runtime_scheduling`.
- Related request(s): `req_022_define_a_unified_frame_loop_architecture_for_runtime_stability_and_render_scheduling`.
- The repository now has a converged runtime runner, shell-owned runtime boundary, startup-performance budgets, and explicit gameplay-system seams, but mild frame-pacing instability can still emerge because update and render cadence are not yet owned by one explicit scheduling model.
- This orchestration task groups the master frame-loop decision, hot-path state-publication rules, and frame-pacing proof posture into one coherent architecture wave so runtime smoothness work does not devolve into isolated local optimizations.

# Dependencies
- Blocking: `task_029_orchestrate_runtime_performance_product_meta_flow_and_gameplay_system_architecture`.
- Unblocks: unified runtime scheduling, cleaner hot-path publication boundaries, and measurable frame-pacing validation for future rendering and gameplay-density growth.

```mermaid
%% logics-signature: task|orchestrate-unified-frame-loop-architect|item-090-define-the-target-master-frame-|1-define-the-target-master-frame|npm-run-ci
flowchart LR
    Master[item_090 master frame loop] --> Wave[Unified frame loop wave]
    HotPath[item_091 hot path publication] --> Wave
    Pacing[item_092 frame pacing validation] --> Wave
```

# Plan
- [x] 1. Define the target master frame loop between the runtime runner, presentation derivation, and Pixi render submission, including authoritative clock ownership and fixed-step compatibility.
- [x] 2. Define hot-path state-publication rules between runtime state, shell surfaces, and diagnostics so loop unification is not undermined by avoidable React publication churn.
- [x] 3. Define frame-pacing profiling and validation posture so the repository can compare the current dual-loop runtime against the target unified scheduling model with repeatable evidence.
- [x] 4. Split the resulting architecture wave into implementation-ready follow-up backlog or task slices where needed, and update linked Logics docs with the chosen posture.
- [x] 5. Validate the resulting architecture docs and any implementation-safe outputs against current repository constraints and delivery posture.
- [x] FINAL: Create a dedicated git commit for this orchestration scope.

# AC Traceability
- `item_090` -> The target master frame loop is explicit. Proof target: frame-phase model, ownership notes, scheduling decision.
- `item_091` -> Hot-path state-publication rules are explicit. Proof target: shell-versus-runtime consumer matrix, publication guidance, diagnostics posture.
- `item_092` -> Frame-pacing profiling and validation posture is explicit. Proof target: profiling strategy, evidence targets, repeatable validation path.

# Request AC Traceability
- req_022_define_a_unified_frame_loop_architecture_for_runtime_stability_and_render_scheduling coverage: AC1, AC2, AC3, AC4, AC5, AC6. Proof: `task_030_orchestrate_unified_frame_loop_architecture_for_runtime_stability_and_render_scheduling` closes the linked request chain for `req_022_define_a_unified_frame_loop_architecture_for_runtime_stability_and_render_scheduling` and carries the delivery evidence for `item_092_define_frame_pacing_profiling_and_validation_for_unified_runtime_scheduling`.


# Decision framing
- Product framing: Required
- Product signals: engagement loop
- Product follow-up: Use this wave to improve runtime smoothness before denser gameplay systems, richer overlays, and more expensive visual composition arrive.
- Architecture framing: Required
- Architecture signals: runtime and boundaries, contracts and integration, delivery and operations
- Architecture follow-up: Keep scheduling ownership, hot-path publication, and performance proof aligned so loop unification remains a coherent architecture move rather than a set of isolated tweaks.

# Links
- Product brief(s): `prod_000_initial_single_entity_navigation_loop`, `prod_003_high_density_top_down_survival_action_direction`
- Architecture decision(s): `adr_015_define_engine_to_game_runtime_contract_boundaries`, `adr_017_lazy_load_pixi_runtime_behind_a_shell_owned_boot_boundary`, `adr_019_keep_engine_pixi_as_adapter_and_game_as_runtime_scene_composer`, `adr_021_define_runtime_performance_budgets_and_profiling_at_the_shell_to_runtime_boundary`, `adr_022_keep_product_meta_flow_shell_owned_while_runtime_state_remains_game_preserved`, `adr_023_model_gameplay_systems_as_game_owned_state_slices_around_the_game_module`, `adr_024_drive_live_runtime_from_the_pixi_visual_frame_while_engine_keeps_fixed_step_authority`, `adr_025_keep_shell_chrome_event_driven_and_sample_diagnostics_off_the_runtime_hot_path`, `adr_026_validate_unified_runtime_scheduling_with_frame_pacing_telemetry_and_browser_smoke`
- Backlog item(s): `item_090_define_the_target_master_frame_loop_between_runtime_runner_presentation_and_pixi_render_submission`, `item_091_define_hot_path_state_publication_rules_between_runtime_shell_and_diagnostics_surfaces`, `item_092_define_frame_pacing_profiling_and_validation_for_unified_runtime_scheduling`
- Request(s): `req_022_define_a_unified_frame_loop_architecture_for_runtime_stability_and_render_scheduling`

# Validation
- `npm run ci`
- `npm run test:browser:smoke`
- `npm run release:ready:advisory`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Done (DoD)
- [x] Covered backlog items are implemented or explicitly split further with updated traceability.
- [x] The repository has a coherent architecture direction for unified frame scheduling, hot-path publication boundaries, and frame-pacing validation.
- [x] The resulting architecture wave remains compatible with the current shell-scene posture, runtime runner, `GameModule` contract, Pixi-adapter ownership, static frontend posture, and release discipline.
- [x] Linked request, backlog, task, and architecture docs are updated with proofs and status.
- [x] A dedicated git commit has been created for the completed orchestration scope.
- [x] Status is `Done` and progress is `100%`.

# Report
- Added a Pixi frame-loop bridge in `packages/engine-pixi/src/components/RuntimeFrameLoopBridge.tsx` and rewired the live runtime so the mounted scene advances from Pixi visual ticks while the engine runner keeps fixed-step authority.
- Extended `packages/engine-core/src/runtime/runtimeRunner.ts` with scheduler and frame-loop metrics, making the live scheduler mode, frame counts, catch-up counts, and cumulative simulation-step behavior explicit.
- Reworked `src/game/entities/hooks/useEntitySimulation.ts` and the runtime-surface plumbing so the live mounted runtime no longer starts an additional independent rAF loop.
- Added `src/app/model/runtimePublicationContract.ts`, `src/app/hooks/useSampledValue.ts`, stabilized shell callbacks in app hooks, and memoized shell chrome plus diagnostics components so menu and meta surfaces stay event-driven while diagnostics consume sampled runtime data.
- Added `src/app/hooks/useRuntimeTelemetryBridge.ts` and extended `scripts/testing/runBrowserSmoke.mjs` so browser smoke now validates unified scheduler mode and bounded frame-pacing behavior after runtime interaction.
- Added accepted ADRs `adr_024` through `adr_026` so live frame transport ownership, shell publication posture, and frame-pacing validation are explicit repository decisions.
- Validation completed with:
  `npm run ci`
  `npm run test:browser:smoke`
  `npm run release:ready:advisory`
  `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Delivery was split across staged commits:
  `44a21a8 Unify live runtime under Pixi frame loop`
  `0403cd6 Reduce shell hot path publication churn`
  `42d3fc5 Add frame pacing telemetry and smoke validation`
