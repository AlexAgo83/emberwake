## item_164_define_a_clearer_action_hierarchy_between_apply_reset_revert_and_back_navigation - Define a clearer action hierarchy between apply, reset, revert, and back navigation
> From version: 0.2.3
> Status: Draft
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: UX
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- `Apply controls`, `Reset defaults`, `Revert`, and `Back to menu` currently compete too much in the same visual field.
- The primary content action is not distinguished sharply enough from secondary actions and navigation.

# Scope
- In: CTA hierarchy, secondary-action grouping, and separation of navigation from editing actions.
- Out: control-binding logic or broader shell-button redesign.

```mermaid
%% logics-signature: backlog|define-a-clearer-action-hierarchy-betwee|req-045-define-a-clearer-and-more-compac|apply-controls-reset-defaults-revert-and|ac1-the-slice-defines-apply-controls
flowchart LR
    Req[Req 045 desktop-controls polish] --> Gap[Actions compete visually]
    Gap --> Slice[Clearer action hierarchy]
    Slice --> Result[Primary CTA and navigation read correctly]
```

# Acceptance criteria
- AC1: The slice defines `Apply controls` as the primary CTA.
- AC2: The slice defines `Reset defaults` and `Revert` as secondary actions.
- AC3: The slice defines `Back to menu` as clearly navigational rather than as a competing primary CTA.
- AC4: The slice stays narrow and presentation-focused.

# Links
- Request: `req_045_define_a_clearer_and_more_compact_desktop_controls_settings_surface`

# Notes
- Derived from request `req_045_define_a_clearer_and_more_compact_desktop_controls_settings_surface`.
