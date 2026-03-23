## item_226_remove_desktop_control_settings_from_the_mobile_shell_surface - Remove desktop control settings from the mobile shell surface
> From version: 0.4.0
> Status: Draft
> Understanding: 98%
> Confidence: 97%
> Progress: 0%
> Complexity: Low
> Theme: UX
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The mobile settings surface still exposes desktop-only control editing, even though those controls are not relevant on mobile.
- Keeping desktop-control settings visible on mobile creates clutter and misleading affordances.
- The shell should hide that section entirely on mobile instead of pretending it is a usable surface there.

# Scope
- In: removing or hiding the desktop-control settings panel on mobile.
- In: ensuring the mobile settings surface only exposes relevant mobile-facing controls.
- Out: redesigning all settings content or introducing a new mobile controls configuration system.

```mermaid
%% logics-signature: backlog|remove-desktop-control-settings-from-the|req-029-define-a-lightweight-settings-sc|the-mobile-settings-surface-still-expose|ac1-the-slice-defines-removal-or
flowchart LR
    Req[Req 060 movement and mobile fit wave] --> Need[Desktop controls clutter mobile settings]
    Need --> Slice[Hide desktop controls on mobile]
    Slice --> Result[Cleaner mobile settings surface]
```

# Acceptance criteria
- AC1: The slice defines removal or hiding of desktop-control settings on mobile.
- AC2: The slice keeps desktop-control editing available on desktop where it still belongs.
- AC3: The slice reduces misleading mobile settings affordances without widening into broader settings redesign.

# AC Traceability
- AC1 -> Scope: desktop-control panel is absent on mobile. Proof target: settings-surface behavior and runtime verification.
- AC2 -> Scope: desktop behavior remains intact. Proof target: desktop settings verification.
- AC3 -> Scope: slice remains bounded. Proof target: limited settings changes.

# Decision framing
- Product framing: Required
- Product signals: usability, navigation and discoverability
- Product follow-up: use `logics-ui-steering` when reshaping the mobile settings surface so the removal stays coherent with the shell’s UI language.
- Architecture framing: Optional
- Architecture signals: boundaries
- Architecture follow-up: None.

# Links
- Product brief(s): `prod_001_minimal_overlay_and_feedback_for_early_runtime`
- Architecture decision(s): `adr_016_define_shell_scene_state_and_meta_surface_ownership`
- Request: `req_060_define_a_smoother_movement_inertia_and_mobile_shell_fit_wave`
- Primary task(s): `task_052_orchestrate_movement_inertia_and_mobile_shell_fit_cleanup`

# References
- `logics/request/req_060_define_a_smoother_movement_inertia_and_mobile_shell_fit_wave.md`
- `logics/request/req_029_define_a_lightweight_settings_scene_with_desktop_control_customization.md`

# Priority
- Impact: Medium
- Urgency: High

# Notes
- Derived from request `req_060_define_a_smoother_movement_inertia_and_mobile_shell_fit_wave`.
- Source file: `logics/request/req_060_define_a_smoother_movement_inertia_and_mobile_shell_fit_wave.md`.
- Settings-surface UI changes in this slice should explicitly lean on `logics-ui-steering`.
