## item_043_define_system_overlay_ownership_and_fullscreen_install_prompt_behavior - Define system overlay ownership and fullscreen install prompt behavior
> From version: 0.1.1
> Status: Done
> Understanding: 93%
> Confidence: 91%
> Progress: 100%
> Complexity: Medium
> Theme: UX
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The early runtime needs clear ownership for fullscreen and install prompts.
- This slice defines system-overlay behavior so browser and platform prompts do not leak into the world layer.

# Scope
- In: DOM-owned system overlays, fullscreen prompt rules, and install prompt behavior.
- Out: Player-facing onboarding copy or inspection panels.

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
- AC5: The request addresses mobile and desktop overlay behavior at a product level.
- AC6: The request favors contextual overlays first and keeps permanent HUD expectations intentionally light.
- AC7: The request stays compatible with debug diagnostics, selection or inspection surfaces, and future gameplay HUD needs.
- AC8: The request does not prematurely lock final art direction or every future menu flow.

# AC Traceability
- AC1 -> Scope: System overlay ownership is explicit in the shell layer. Proof: `src/app/AppShell.tsx`.
- AC2 -> Scope: World-space and screen-space overlay ownership are separated. Proof: `src/game/render/RuntimeSurface.tsx`, `src/app/AppShell.tsx`.
- AC3 -> Scope: Fullscreen and install prompts remain DOM-owned. Proof: `src/app/components/FullscreenToggleButton.tsx`, `src/app/hooks/useInstallPrompt.ts`, `src/app/AppShell.tsx`.
- AC4 -> Scope: Overlay behavior stays compatible with the fullscreen shell. Proof: `src/app/AppShell.tsx`, `src/app/styles/app.css`.
- AC5 -> Scope: Mobile and desktop overlay behavior stays in the same shell contract. Proof: `src/app/styles/app.css`, `src/app/AppShell.tsx`.
- AC6 -> Scope: Permanent player HUD remains light while system controls stay contextual. Proof: `src/app/components/PlayerHudCard.tsx`, `src/app/AppShell.tsx`.
- AC7 -> Scope: System overlays coexist with debug and inspection surfaces without ownership bleed. Proof: `src/game/debug/ShellDiagnosticsPanel.tsx`, `src/app/components/EntityInspectionPanel.tsx`, `src/app/AppShell.tsx`.
- AC8 -> Scope: Implementation stays structural rather than final-menu driven. Proof: `src/app/AppShell.tsx`.

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
