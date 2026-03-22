## item_182_define_stateful_apply_revert_and_reset_action_rules_for_settings_controls - Define stateful apply, revert, and reset action rules for settings controls
> From version: 0.3.1
> Status: Draft
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: UX
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The `Settings` action row does not yet communicate a clear edit-state hierarchy.
- `Revert` and `Apply controls` can appear active even when there is no actionable settings delta.

# Scope
- In: equal-width `Revert` and `Reset defaults` on one row, full-width `Apply controls`, and enablement rules tied to actual draft-state changes.
- Out: rebinding logic redesign, new control categories, or settings-scene architecture changes.

```mermaid
%% logics-signature: backlog|define-stateful-apply-revert-and-reset-a|req-051-define-a-shell-surface-cleanup-a|the-settings-action-row-does|ac1-the-slice-defines-a
flowchart LR
    Req[Req 051 shell cleanup] --> Gap[Settings actions lack clear stateful hierarchy]
    Gap --> Slice[Stateful Apply Revert Reset rules]
    Slice --> Result[Clearer settings editing posture]
```

# Acceptance criteria
- AC1: The slice defines that `Revert` and `Reset defaults` share one row and split width evenly.
- AC2: The slice defines that `Apply controls` occupies full available width.
- AC3: The slice defines that `Revert` is enabled only when draft settings differ from persisted settings.
- AC4: The slice defines that `Apply controls` is enabled only when there is a valid unapplied change.
- AC5: The slice defines that `Reset defaults` remains available as a deterministic recovery action.

# Links
- Request: `req_051_define_a_shell_surface_cleanup_and_view_relative_movement_polish_wave`

# Notes
- Derived from request `req_051_define_a_shell_surface_cleanup_and_view_relative_movement_polish_wave`.
- Source file: `logics/request/req_051_define_a_shell_surface_cleanup_and_view_relative_movement_polish_wave.md`.
