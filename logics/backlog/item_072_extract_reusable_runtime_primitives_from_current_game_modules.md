## item_072_extract_reusable_runtime_primitives_from_current_game_modules - Extract reusable runtime primitives from current game modules
> From version: 0.1.3
> Status: Done
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: Runtime
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The current `src/game` area contains several modules that behave like reusable runtime primitives, but they still live beside Emberwake-owned gameplay code.
- Until those stable primitives are extracted, the repository will keep coupling engine-grade functionality to one game's folder structure and assumptions.

# Scope
- In: Extraction of stable runtime primitives such as camera math, viewport transforms, generic runtime surface wiring, low-level input math, and similar engine candidates.
- Out: Emberwake gameplay rules, content data, scenario authoring, progression systems, or aggressive generalization of unstable systems.

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: The slice identifies which current modules qualify as reusable runtime primitives and which should not be promoted yet.
- AC2: Stable engine candidates such as camera math, world-view transforms, low-level input math, runtime surface ownership, and related technical helpers are extracted or relocated behind engine-owned boundaries.
- AC3: The extraction avoids moving obviously Emberwake-specific logic such as scenario content, game rules, or authored world flavor into engine-owned modules.
- AC4: The extracted primitives remain buildable and testable without introducing `engine -> game` dependencies.
- AC5: The extraction preserves current runtime behavior and keeps the refactor incremental rather than relying on a one-shot rewrite.

# AC Traceability
- AC1 -> Scope: Engine candidates are explicitly classified before or during extraction. Proof target: migration inventory, architecture notes, task report.
- AC2 -> Scope: Reusable primitives move under engine-owned boundaries. Proof target: extracted modules for camera, transforms, runtime surface, input math, and related tests.
- AC3 -> Scope: Emberwake-specific logic stays outside engine-owned modules. Proof target: game-owned modules for scenario data, gameplay simulation, and content.
- AC4 -> Scope: Dependency direction stays clean. Proof target: import graph review, lint or tests, updated package boundaries.
- AC5 -> Scope: Runtime behavior remains stable through staged moves. Proof target: `npm run ci`, `npm run test:browser:smoke`, migration commits.

# Decision framing
- Product framing: Consider
- Product signals: engagement loop
- Product follow-up: Avoid delaying gameplay work by extracting modules that are still too volatile to justify promotion.
- Architecture framing: Required
- Architecture signals: runtime and boundaries, contracts and integration
- Architecture follow-up: Use the engine-to-game contract item as the guardrail for what can be extracted safely.

# Links
- Product brief(s): `prod_000_initial_single_entity_navigation_loop`
- Architecture decision(s): `adr_000_adopt_feature_oriented_organic_frontend_structure`, `adr_003_define_coordinate_spaces_and_camera_contract`
- Request: `req_018_define_engine_and_gameplay_boundary_for_runtime_reuse`
- Primary task(s): `task_026_orchestrate_engine_gameplay_boundary_extraction_for_runtime_reuse`

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from request `req_018_define_engine_and_gameplay_boundary_for_runtime_reuse`.
- Source file: `logics/request/req_018_define_engine_and_gameplay_boundary_for_runtime_reuse.md`.
- Likely first engine candidates from current code include camera primitives, world-view transforms, virtual-stick math, runtime surface wiring, and related technical diagnostics.
- Implemented with reusable primitives promoted into `packages/engine-core` and `packages/engine-pixi`, including camera, world contracts, world-view math, virtual-stick geometry, runtime canvas composition, and viewport containers.
