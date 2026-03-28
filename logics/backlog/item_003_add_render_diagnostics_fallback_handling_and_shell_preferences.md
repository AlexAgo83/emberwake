## item_003_add_render_diagnostics_fallback_handling_and_shell_preferences - Add render diagnostics fallback handling and shell preferences
> From version: 0.1.3
> Status: Done
> Understanding: 97%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: Rendering
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The shell needs a single standard debug entry point so render diagnostics do not get scattered across later map and entity work.
- The runtime must remain diagnosable when Pixi, WebGL, or fullscreen fail or degrade.
- Shell-level preferences such as debug visibility and fullscreen preference should persist locally without becoming gameplay persistence.

# Scope
- In:
- Standard debug entry point for shell-level rendering diagnostics
- Dev and preview availability rules for diagnostics, with dev-time mounting and shortcut-based visibility control
- Controlled fallback behavior and visible diagnostics when rendering capabilities fail
- Local persistence of shell-only preferences such as debug visibility and fullscreen preference
- Out:
- Base project scaffold
- Viewport ownership and input isolation
- Logical world-space contract and map or entity diagnostics

```mermaid
%% logics-signature: backlog|add-render-diagnostics-fallback-handling|req-000-bootstrap-fullscreen-2d-react-pw|the-shell-needs-a-single-standard|ac1-a-single-standard-shell-level-debug
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: A single standard shell-level debug entry point exists for rendering diagnostics and is mounted by default in development without becoming visually noisy.
- AC2: Shell-level diagnostics are available in development and preview environments, can be toggled through a shortcut or equivalent control, and are hidden or disabled by default in production builds.
- AC3: If Pixi, WebGL, or true fullscreen cannot initialize correctly, the shell fails in a controlled and diagnosable way rather than silently.
- AC4: Local shell preferences such as fullscreen preference and debug visibility can be persisted without expanding into gameplay-state persistence.
- AC5: This slice keeps later map and entity diagnostics compatible with one shared debug workflow instead of fragmenting tooling.
- AC6: Fallback and preference behavior remain limited to shell concerns and do not pull in gameplay features.

# AC Traceability
- AC1 -> Scope: One standard shell-level debug entry point exists. Proof: `src/game/debug/ShellDiagnosticsPanel.tsx`, `src/game/debug/hooks/useDebugPanelHotkey.ts`.
- AC2 -> Scope: Diagnostics are available in dev and preview but not exposed by default in production. Proof: `src/shared/config/appConfig.ts`, `src/app/AppShell.tsx`.
- AC3 -> Scope: Render and fullscreen failures remain visible and diagnosable. Proof: `src/app/hooks/useRendererHealth.ts`, `src/app/hooks/useFullscreenController.ts`, `src/game/render/RuntimeSurfaceBoundary.tsx`.
- AC4 -> Scope: Shell-only preferences persist locally without gameplay persistence. Proof: `src/app/hooks/useShellPreferences.ts`, `src/shared/lib/shellPreferencesStorage.ts`.
- AC5 -> Scope: Debug workflow remains shared for later map and entity slices. Proof: `src/game/debug/ShellDiagnosticsPanel.tsx`, `src/shared/constants/runtimeContract.ts`.
- AC6 -> Scope: Slice is limited to shell-level diagnostics, fallbacks, and preferences. Proof: `src/app/AppShell.tsx`.

# Decision framing
- Product framing: Required
- Product signals: pricing and packaging, experience scope
- Product follow-up: Create or link a product brief before implementation moves deeper into delivery.
- Architecture framing: Required
- Architecture signals: data model and persistence, contracts and integration, runtime and boundaries, state and sync, security and identity, delivery and operations
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): `adr_006_standardize_debug_first_runtime_instrumentation`, `adr_009_limit_persistence_to_local_versioned_frontend_storage`
- Request: `req_000_bootstrap_fullscreen_2d_react_pwa_shell`
- Primary task(s): `task_003_add_render_diagnostics_fallback_handling_and_shell_preferences`

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from request `req_000_bootstrap_fullscreen_2d_react_pwa_shell`.
- Source file: `logics/request/req_000_bootstrap_fullscreen_2d_react_pwa_shell.md`.
- Request context seeded into this backlog item from `logics/request/req_000_bootstrap_fullscreen_2d_react_pwa_shell.md`.
- This slice provides the shared debug workflow that later map and entity slices can plug into.
