## item_044_define_minimal_player_facing_runtime_feedback_and_onboarding_surfaces - Define minimal player facing runtime feedback and onboarding surfaces
> From version: 0.1.2
> Status: Done
> Understanding: 94%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: UX
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The first player loop needs just enough on-screen feedback to be understandable without clutter.
- This slice defines the minimal onboarding and runtime feedback surfaces that support the first-minute experience, including a hint that can disappear once the player has actually moved.

# Scope
- In: Short onboarding hinting, minimal player-facing runtime feedback, and contextual visibility rules.
- Out: Permanent HUD bars, debug overlays, or full menu systems.

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
- AC6: The request favors contextual overlays first, keeps permanent HUD expectations intentionally light, and allows the first onboarding hint to remain visible until the first successful movement before persisting its dismissal locally.
- AC7: The request stays compatible with debug diagnostics, selection or inspection surfaces, and future gameplay HUD needs.
- AC8: The request does not prematurely lock final art direction or every future menu flow.

# AC Traceability
- AC1 -> Scope: Player-facing runtime feedback is implemented in dedicated shell surfaces. Proof: `src/app/components/PlayerHudCard.tsx`, `src/app/AppShell.tsx`.
- AC2 -> Scope: Runtime feedback stays screen-space and out of the world canvas. Proof: `src/app/AppShell.tsx`.
- AC3 -> Scope: Player feedback coexists with DOM-owned fullscreen and inspection surfaces. Proof: `src/app/AppShell.tsx`.
- AC4 -> Scope: Feedback stays compatible with the fullscreen shell contract. Proof: `src/app/styles/app.css`, `src/app/AppShell.tsx`.
- AC5 -> Scope: Control messaging adapts between desktop and mobile. Proof: `src/app/components/PlayerHudCard.tsx`.
- AC6 -> Scope: Onboarding remains visible until first successful movement, then persists dismissal locally. Proof: `src/app/hooks/useShellPreferences.ts`, `src/shared/lib/shellPreferencesStorage.ts`, `src/app/AppShell.tsx`.
- AC7 -> Scope: Player-facing feedback remains compatible with debug and inspection surfaces. Proof: `src/game/debug/ShellDiagnosticsPanel.tsx`, `src/app/components/EntityInspectionPanel.tsx`, `src/app/AppShell.tsx`.
- AC8 -> Scope: The slice remains lightweight and not tied to a full HUD system. Proof: `src/app/components/PlayerHudCard.tsx`.

# Decision framing
- Product framing: Required
- Product signals: conversion journey, navigation and discoverability
- Product follow-up: Create or link a product brief before implementation moves deeper into delivery.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): `prod_001_minimal_overlay_and_feedback_for_early_runtime`, `prod_000_initial_single_entity_navigation_loop`
- Architecture decision(s): `adr_002_separate_react_shell_from_pixi_runtime_ownership`
- Request: `req_011_define_ui_hud_and_overlay_system`
- Primary task(s): `task_017_orchestrate_player_facing_interaction_feedback_and_overlay_surfaces`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from request `req_011_define_ui_hud_and_overlay_system`.
- Source file: `logics/request/req_011_define_ui_hud_and_overlay_system.md`.
- Request context seeded into this backlog item from `logics/request/req_011_define_ui_hud_and_overlay_system.md`.
- Completed in `task_017_orchestrate_player_facing_interaction_feedback_and_overlay_surfaces`.
