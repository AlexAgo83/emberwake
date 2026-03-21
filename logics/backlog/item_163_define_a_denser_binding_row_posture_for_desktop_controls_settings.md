## item_163_define_a_denser_binding_row_posture_for_desktop_controls_settings - Define a denser binding-row posture for desktop-controls settings
> From version: 0.2.3
> Status: Draft
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: UX
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Each binding row occupies too much vertical space.
- The current posture makes the settings panel heavier and slower to scan than necessary.

# Scope
- In: row density, spacing, chip grouping, and binding-line compaction.
- Out: shell-wide visual redesign or control-contract changes.

```mermaid
%% logics-signature: backlog|define-a-denser-binding-row-posture-for-|req-045-define-a-clearer-and-more-compac|each-binding-row-occupies-too-much|ac1-the-slice-defines-a-denser
flowchart LR
    Req[Req 045 desktop-controls polish] --> Gap[Rows are too tall]
    Gap --> Slice[Denser binding posture]
    Slice --> Result[Lower vertical cost and faster reading]
```

# Acceptance criteria
- AC1: The slice defines a denser row posture for desktop control bindings.
- AC2: The slice keeps binding readability while reducing vertical weight.
- AC3: The slice keeps alternate bindings visually grouped per action.
- AC4: The slice stays narrowly focused on layout density.

# Links
- Request: `req_045_define_a_clearer_and_more_compact_desktop_controls_settings_surface`

# Notes
- Derived from request `req_045_define_a_clearer_and_more_compact_desktop_controls_settings_surface`.
