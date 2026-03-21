## task_034_orchestrate_session_first_shell_command_deck_hierarchy - Orchestrate session-first shell command-deck hierarchy
> From version: 0.2.1
> Status: Draft
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: UX
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog items `item_106_define_session_as_the_single_primary_shell_menu_section`, `item_107_define_nested_view_controls_within_session_without_reopening_camera_ownership`, and `item_108_define_nested_tools_controls_within_session_without_reintroducing_menu_clutter`.
- Related request(s): `req_027_restructure_the_shell_command_deck_around_a_primary_session_section`.
- The repository already has a stateful command deck and a converged tactical-console visual direction, but the current shell menu still exposes `Session`, `View`, and `Tools` as peer top-level families.
- This orchestration task groups the next menu IA refinement so the shell becomes more compact and session-first without reopening the settled shell model or tactical-console posture.

# Dependencies
- Blocking: `task_032_orchestrate_command_deck_shell_menu_option_b_for_runtime_controls`, `task_033_orchestrate_tactical_console_visual_direction_for_shell_controls_and_menus`.
- Unblocks: a more compact top-level deck structure, clearer session-first hierarchy, and a cleaner mobile command surface.

```mermaid
%% logics-signature: task|orchestrate-session-first-shell-command-|item-106-define-session-as-the-single-pr|1-define-and-implement-session-as|npm-run-ci
flowchart LR
    Session[item_106 primary Session section] --> Wave[Session-first shell deck wave]
    View[item_107 nested View controls] --> Wave
    Tools[item_108 nested Tools controls] --> Wave
```

# Plan
- [ ] 1. Define and implement `Session` as the only first-level shell section beneath the always-visible current action.
- [ ] 2. Define and implement `View` as a nested subordinate group inside `Session` while preserving reset-camera and camera-mode reachability.
- [ ] 3. Define and implement `Tools` as a nested subordinate group inside `Session` while preserving inspecteur, diagnostics, and install access without reintroducing clutter.
- [ ] 4. Update linked request, backlog, task, and any supporting UX notes needed to keep the session-first navigation wave traceable.
- [ ] 5. Validate the resulting shell IA refinement against current repository delivery constraints and responsive shell behavior.
- [ ] FINAL: Create dedicated git commit(s) for this orchestration scope.

# AC Traceability
- `item_106` -> Session-first top-level hierarchy is explicit. Proof target: menu IA update or implementation report.
- `item_107` -> Nested View group is explicit. Proof target: nested structure or interaction notes for camera controls.
- `item_108` -> Nested Tools group is explicit. Proof target: nested structure or interaction notes for utility controls.

# Decision framing
- Product framing: Required
- Product signals: clarity, compactness, and control prioritization
- Product follow-up: Use this wave to make the command deck read like one coherent session-control surface rather than a set of parallel peer sections.
- Architecture framing: Supporting
- Architecture signals: shell menu IA and responsive shell posture
- Architecture follow-up: Preserve current shell ownership, tactical-console direction, and action inventory while tightening grouping hierarchy.

# Links
- Product brief(s): `prod_001_minimal_overlay_and_feedback_for_early_runtime`
- Architecture decision(s): `adr_002_separate_react_shell_from_pixi_runtime_ownership`, `adr_016_define_shell_scene_state_and_meta_surface_ownership`, `adr_025_keep_shell_chrome_event_driven_and_sample_diagnostics_off_the_runtime_hot_path`
- Backlog item(s): `item_106_define_session_as_the_single_primary_shell_menu_section`, `item_107_define_nested_view_controls_within_session_without_reopening_camera_ownership`, `item_108_define_nested_tools_controls_within_session_without_reintroducing_menu_clutter`
- Request(s): `req_027_restructure_the_shell_command_deck_around_a_primary_session_section`

# Validation
- `npm run ci`
- `npm run test:browser:smoke`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Done (DoD)
- [ ] Covered backlog items are implemented or explicitly split further with updated traceability.
- [ ] The shell exposes `Session` as the single first-level section below the current action.
- [ ] `View` and `Tools` are re-presented as subordinate nested groups without losing access to the current action inventory.
- [ ] The resulting shell IA refinement remains compatible with the existing shell-owned command deck and tactical-console direction.
- [ ] Linked request, backlog, task, and related docs are updated with proofs and status.
- [ ] Dedicated git commit(s) have been created for the completed orchestration scope.
- [ ] Status is `Done` and progress is `100%`.

# Report
- Pending.
