## item_045_define_contextual_inspection_panels_across_mobile_and_desktop - Define contextual inspection panels across mobile and desktop
> From version: 0.1.2
> Status: Done
> Understanding: 94%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: UX
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Inspection needs a screen-space presentation model that works on both mobile and desktop.
- This slice defines contextual inspection surfaces without turning the runtime into a panel-heavy app, using a light bottom-sheet posture on mobile as the baseline.

# Scope
- In: Inspection panel form factor, mobile vs desktop presentation, and contextual reveal behavior.
- Out: Debug-only panels or final menu architecture.

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: The request defines a dedicated UI or HUD or overlay scope rather than leaving overlay behavior implicit inside rendering requests.
- AC2: The request distinguishes between world-space visuals and screen-space UI or system overlays.
- AC3: The request treats fullscreen entry prompts, system prompts, and debug or inspection panels as DOM-owned by default.
- AC4: The request remains compatible with the fullscreen shell and thin DOM overlay direction already established.
- AC5: The request addresses mobile and desktop overlay behavior at a product level, with a light bottom sheet as the baseline mobile inspection surface.
- AC6: The request favors contextual overlays first and keeps permanent HUD expectations intentionally light.
- AC7: The request stays compatible with debug diagnostics, selection or inspection surfaces, and future gameplay HUD needs.
- AC8: The request does not prematurely lock final art direction or every future menu flow.

# AC Traceability
- AC1 -> Scope: Inspection lives in a dedicated DOM panel rather than the world renderer. Proof: `src/app/components/EntityInspectionPanel.tsx`, `src/app/AppShell.tsx`.
- AC2 -> Scope: Inspection remains screen-space. Proof: `src/app/AppShell.tsx`.
- AC3 -> Scope: Inspection stays DOM-owned alongside system overlays. Proof: `src/app/components/EntityInspectionPanel.tsx`, `src/app/AppShell.tsx`.
- AC4 -> Scope: Panel posture stays compatible with the thin overlay shell. Proof: `src/app/styles/app.css`.
- AC5 -> Scope: Mobile bottom-sheet and desktop card postures are both implemented. Proof: `src/app/styles/app.css`, `src/app/components/EntityInspectionPanel.tsx`.
- AC6 -> Scope: Inspection remains contextual and lightweight. Proof: `src/app/components/EntityInspectionPanel.tsx`.
- AC7 -> Scope: Inspection coexists with debug and player feedback surfaces. Proof: `src/game/debug/ShellDiagnosticsPanel.tsx`, `src/app/components/PlayerHudCard.tsx`, `src/app/AppShell.tsx`.
- AC8 -> Scope: The slice avoids overcommitting to full menu architecture. Proof: `src/app/components/EntityInspectionPanel.tsx`.

# Decision framing
- Product framing: Consider
- Product signals: navigation and discoverability
- Product follow-up: Review whether a product brief is needed before scope becomes harder to change.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): `prod_001_minimal_overlay_and_feedback_for_early_runtime`
- Architecture decision(s): `adr_002_separate_react_shell_from_pixi_runtime_ownership`
- Request: `req_011_define_ui_hud_and_overlay_system`
- Primary task(s): `task_017_orchestrate_player_facing_interaction_feedback_and_overlay_surfaces`

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from request `req_011_define_ui_hud_and_overlay_system`.
- Source file: `logics/request/req_011_define_ui_hud_and_overlay_system.md`.
- Request context seeded into this backlog item from `logics/request/req_011_define_ui_hud_and_overlay_system.md`.
- Completed in `task_017_orchestrate_player_facing_interaction_feedback_and_overlay_surfaces`.
