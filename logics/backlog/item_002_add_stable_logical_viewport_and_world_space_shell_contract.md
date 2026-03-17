## item_002_add_stable_logical_viewport_and_world_space_shell_contract - Add stable logical viewport and world-space shell contract
> From version: 0.1.3
> Status: Ready
> Understanding: 97%
> Confidence: 94%
> Progress: 10%
> Complexity: Medium
> Theme: Rendering
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The shell needs a stable logical viewport contract so rendering scale and world position do not drift across device classes or responsive modes.
- The default sizing strategy should preserve a stable logical `fit` contract rather than behave like an aggressive cover-style crop.
- The runtime must establish world-space-ready coordinate assumptions before map and entity work begins.
- The shell should carry the shared technical vocabulary and performance baseline that later world and entity requests depend on.

# Scope
- In:
- Logical viewport sizing rules and stable fit-style coordinate assumptions independent from raw pixels
- Mobile and large-screen responsive modes around the `900px` breakpoint
- Future-scrollable-world readiness and world-space compatibility
- Shared technical vocabulary for world space, chunk space, screen space, camera state, entity state, and render layers
- Lightweight shell performance expectation for later layers
- Out:
- Fullscreen mechanics and input isolation
- Debug overlay tooling and runtime fallbacks
- Map rendering, camera controls, and entity systems

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: The shell defines explicit logical viewport rules that remain stable across mobile and large-screen layouts, with a fit-style baseline rather than cover-style cropping.
- AC2: Viewport changes do not arbitrarily alter logical scale or world position.
- AC3: The shell is explicitly compatible with a future large or unbounded scrollable world and does not assume fixed screen-sized gameplay space.
- AC4: Shared technical vocabulary is documented and consistent for later shell, world, and entity work.
- AC5: The shell sets a lightweight performance expectation that later map and entity slices can inherit.
- AC6: This slice leaves map rendering, camera controls, and entity logic out of scope while making them possible without a shell rewrite.

# AC Traceability
- AC1 -> Scope: Logical viewport rules are explicit across mobile and large-screen layouts. Proof: TODO.
- AC2 -> Scope: Logical scale and world position remain stable across viewport changes. Proof: TODO.
- AC3 -> Scope: Shell remains compatible with future large or unbounded world space. Proof: TODO.
- AC4 -> Scope: Shared vocabulary for later layers is established. Proof: TODO.
- AC5 -> Scope: Lightweight performance expectation is set for later layers. Proof: TODO.
- AC6 -> Scope: Slice is limited to shell contract and not map or entity implementation. Proof: TODO.

# Decision framing
- Product framing: Required
- Product signals: pricing and packaging, experience scope
- Product follow-up: Create or link a product brief before implementation moves deeper into delivery.
- Architecture framing: Required
- Architecture signals: data model and persistence, contracts and integration, runtime and boundaries, state and sync, security and identity, delivery and operations
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): `adr_003_define_coordinate_spaces_and_camera_contract`
- Request: `req_000_bootstrap_fullscreen_2d_react_pwa_shell`
- Primary task(s): `task_002_add_stable_logical_viewport_and_world_space_shell_contract`

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from request `req_000_bootstrap_fullscreen_2d_react_pwa_shell`.
- Source file: `logics/request/req_000_bootstrap_fullscreen_2d_react_pwa_shell.md`.
- Request context seeded into this backlog item from `logics/request/req_000_bootstrap_fullscreen_2d_react_pwa_shell.md`.
- This slice defines the shell contract that later map and entity work should assume.
