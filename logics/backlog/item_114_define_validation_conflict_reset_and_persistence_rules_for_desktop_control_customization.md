## item_114_define_validation_conflict_reset_and_persistence_rules_for_desktop_control_customization - Define validation, conflict, reset, and persistence rules for desktop control customization
> From version: 0.2.2
> Status: Done
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: UX
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Desktop-control customization is not complete without clear rules for invalid bindings, conflict handling, persistence, and recovery to sane defaults.
- Without a dedicated validation/reset slice, the settings feature risks becoming fragile, ambiguous, or hard to recover from after bad edits.

# Scope
- In: Defining validation and conflict rules for desktop remapping, persistence expectations for saved bindings, and explicit recovery actions such as revert and reset to defaults.
- Out: Redesigning the whole persistence architecture, expanding the feature to mobile controls, or merging player bindings with debug/operator bindings.

```mermaid
%% logics-signature: backlog|define-validation-conflict-reset-and-per|req-029-define-a-lightweight-settings-sc|desktop-control-customization-is-not-com|ac1-the-slice-defines-how-invalid
flowchart LR
    Req[Req 029 lightweight settings scene] --> Gap[Validation reset and persistence rules are missing]
    Gap --> Slice[Define validation conflict reset and persistence rules]
    Slice --> Result[Desktop remapping stays recoverable and understandable]
```

# Acceptance criteria
- AC1: The slice defines how invalid or conflicting desktop bindings are detected and communicated.
- AC2: The slice defines how desktop-control changes are persisted and reapplied across sessions.
- AC3: The slice defines a `Reset controls to defaults` action for desktop bindings and distinguishes it from reverting unsaved edits.
- AC4: The slice remains compatible with the current local-first settings persistence posture and shell-owned settings scene.

# AC Traceability
- AC1 -> Scope: Conflict and validation posture is explicit. Proof target: rule set, UI message model, or implementation report.
- AC2 -> Scope: Persistence expectations are explicit. Proof target: storage contract, settings model, or behavior summary.
- AC3 -> Scope: Reset vs revert behavior is explicit. Proof target: action taxonomy or settings interaction note.
- AC4 -> Scope: Existing local-first shell posture remains intact. Proof target: compatibility note or persistence summary.

# Decision framing
- Product framing: Primary
- Product signals: safety and trust
- Product follow-up: Make desktop remapping recoverable enough that users can experiment without fear.
- Architecture framing: Supporting
- Architecture signals: local-first settings persistence
- Architecture follow-up: Keep persistence bounded and explicit while supporting reset/recovery paths.

# Links
- Product brief(s): `prod_001_minimal_overlay_and_feedback_for_early_runtime`
- Architecture decision(s): `adr_007_isolate_runtime_input_from_browser_page_controls`, `adr_009_limit_persistence_to_local_versioned_frontend_storage`, `adr_016_define_shell_scene_state_and_meta_surface_ownership`
- Request: `req_029_define_a_lightweight_settings_scene_with_desktop_control_customization`

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from request `req_029_define_a_lightweight_settings_scene_with_desktop_control_customization`.
- Source file: `logics/request/req_029_define_a_lightweight_settings_scene_with_desktop_control_customization.md`.
- Delivered through `src/app/model/desktopControlBindings.ts`, `src/shared/lib/desktopControlBindingsStorage.ts`, and `src/app/hooks/useDesktopControlBindings.ts`.
