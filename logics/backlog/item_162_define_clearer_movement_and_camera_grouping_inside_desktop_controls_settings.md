## item_162_define_clearer_movement_and_camera_grouping_inside_desktop_controls_settings - Define clearer movement and camera grouping inside desktop-controls settings
> From version: 0.2.3
> Status: Draft
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: UX
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The desktop-controls surface currently reads as one long flat list.
- Movement and camera bindings are not grouped strongly enough for fast scanning.

# Scope
- In: explicit grouping for `Movement` and `Camera` bindings within the settings surface.
- Out: rebinding logic changes, persistence changes, or new control categories.

```mermaid
%% logics-signature: backlog|define-clearer-movement-and-camera-group|req-045-define-a-clearer-and-more-compac|the-desktop-controls-surface-currently-r|ac1-the-slice-defines-a-visible
flowchart LR
    Req[Req 045 desktop-controls polish] --> Gap[Bindings read as one flat list]
    Gap --> Slice[Movement and Camera grouping]
    Slice --> Result[Faster visual scanning]
```

# Acceptance criteria
- AC1: The slice defines a visible `Movement` group.
- AC2: The slice defines a visible `Camera` group.
- AC3: The slice improves hierarchy without reopening binding behavior or settings architecture.
- AC4: The slice stays narrow and presentation-focused.

# Links
- Request: `req_045_define_a_clearer_and_more_compact_desktop_controls_settings_surface`

# Notes
- Derived from request `req_045_define_a_clearer_and_more_compact_desktop_controls_settings_surface`.
