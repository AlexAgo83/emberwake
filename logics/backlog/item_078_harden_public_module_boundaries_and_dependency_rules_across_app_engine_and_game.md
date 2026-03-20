## item_078_harden_public_module_boundaries_and_dependency_rules_across_app_engine_and_game - Harden public module boundaries and dependency rules across app engine and game
> From version: 0.1.2
> Status: Ready
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The repository topology is now clear, but package and module boundaries are still relatively soft in practice.
- Without stronger public-interface and dependency rules, cross-import drift will gradually erode the value of the `app / engine / game` split and make later growth costly.

# Scope
- In: Public entrypoint posture, dependency-direction rules, module ownership constraints, and practical enforcement or review mechanisms across app, engine, and game layers.
- Out: Publishing the engine as an external package, introducing a multi-repo split, or building a heavyweight internal platform.

```mermaid
%% logics-signature: backlog|harden-public-module-boundaries-and-depe|req-019-complete-runtime-convergence-and|the-repository-topology-is-now-clear|ac1-the-slice-defines-clearer-public-ent
flowchart LR
    Req[Req 019 convergence] --> Soft[Boundaries are still soft]
    Soft --> Rules[Harden public interfaces and import rules]
    Rules --> Durable[Keep app engine game split durable]
```

# Acceptance criteria
- AC1: The slice defines clearer public-entry posture for `engine-core`, `engine-pixi`, `games/emberwake`, and the app shell.
- AC2: Dependency rules remain explicit and continue to forbid `engine -> game` coupling.
- AC3: The slice reduces incidental cross-imports that bypass intended ownership boundaries.
- AC4: The work stays pragmatic, using lightweight rules or tooling appropriate to the project rather than a heavyweight package-governance system.
- AC5: The resulting boundary posture remains compatible with current build, test, and release workflows.

# AC Traceability
- AC1 -> Scope: Public interfaces are clearer and narrower. Proof target: package entrypoints, index modules, import-path conventions, architecture notes.
- AC2 -> Scope: Dependency direction is explicit and reviewable. Proof target: code review rules, lint or import checks if introduced, architecture docs.
- AC3 -> Scope: Cross-import drift is reduced. Proof target: import graph diff, updated module references, reduced deep-path coupling.
- AC4 -> Scope: Enforcement stays lightweight and maintainable. Proof target: chosen tooling or conventions, task notes, repository config.
- AC5 -> Scope: Boundary hardening stays release-safe. Proof target: `npm run ci`, `npm run test:browser:smoke`, build and typecheck results.

# Decision framing
- Product framing: Consider
- Product signals: engagement loop
- Product follow-up: Keep internal boundaries strong enough that new gameplay systems do not slow delivery with architectural churn.
- Architecture framing: Required
- Architecture signals: runtime and boundaries, contracts and integration, delivery and operations
- Architecture follow-up: Capture any durable dependency rules in an ADR or equivalent architecture note if they become part of the repository contract.

# Links
- Product brief(s): `prod_000_initial_single_entity_navigation_loop`, `prod_003_high_density_top_down_survival_action_direction`
- Architecture decision(s): `adr_014_adopt_a_modular_app_engine_game_topology_with_one_way_dependencies`, `adr_015_define_engine_to_game_runtime_contract_boundaries`
- Request: `req_019_complete_runtime_convergence_and_harden_modular_architecture_boundaries`

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from request `req_019_complete_runtime_convergence_and_harden_modular_architecture_boundaries`.
- Source file: `logics/request/req_019_complete_runtime_convergence_and_harden_modular_architecture_boundaries.md`.
- This slice is about making boundaries technically meaningful, not just semantically named.
