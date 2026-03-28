## item_081_add_engine_to_game_integration_tests_for_runtime_contract_flow - Add engine to game integration tests for runtime contract flow
> From version: 0.5.0
> Status: Done
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Quality
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The project has good unit coverage and browser smoke validation, but it still lacks strong integration validation around the engine-to-game runtime contract itself.
- Without explicit contract-flow tests, regressions can slip through where input normalization, action mapping, update progression, and presentation output drift apart while isolated helpers still pass.

# Scope
- In: Integration tests around `input -> mapInput -> update -> present`, contract-flow validation posture, and compatibility with current unit and smoke-test coverage.
- Out: End-to-end scenario expansion in the browser for every runtime detail, or replacement of existing unit tests with only large integration suites.

```mermaid
%% logics-signature: backlog|add-engine-to-game-integration-tests-for|req-019-complete-runtime-convergence-and|the-project-has-good-unit-coverage|ac1-the-slice-adds-or-defines
flowchart LR
    Req[Req 019 convergence] --> Gap[Contract chain lacks integration tests]
    Gap --> Tests[Validate input to present flow]
    Tests --> Trust[Refactor boundary with more confidence]
```

# Acceptance criteria
- AC1: The slice adds or defines integration validation around the `input -> mapInput -> update -> present` runtime chain.
- AC2: The tests sit close to the engine-to-game boundary rather than depending on the full browser shell for every assertion.
- AC3: The new validation complements rather than replaces existing unit and browser-smoke coverage.
- AC4: The tests remain compatible with the current deterministic single-entity runtime slice and any staged convergence work.
- AC5: The resulting test posture improves confidence in runtime-contract refactors without creating an excessively heavy test suite.

# AC Traceability
- AC1 -> Scope: Runtime contract flow is validated as an integrated chain. Proof target: integration test files, test scripts, runtime contract fixtures.
- AC2 -> Scope: Tests are placed near the boundary they validate. Proof target: test module location, imports, scope of assertions.
- AC3 -> Scope: Test coverage remains layered instead of duplicated blindly. Proof target: `package.json`, test organization, validation notes.
- AC4 -> Scope: The tests support current staged convergence. Proof target: deterministic fixtures, runtime module tests, preserved smoke coverage.
- AC5 -> Scope: The suite stays valuable and maintainable. Proof target: targeted integration cases, execution time, task validation notes.

# Request AC Traceability
- req_019_complete_runtime_convergence_and_harden_modular_architecture_boundaries coverage: AC1, AC10, AC2, AC3, AC4, AC5, AC6, AC7, AC8, AC9. Proof: `item_081_add_engine_to_game_integration_tests_for_runtime_contract_flow` remains the request-closing backlog slice for `req_019_complete_runtime_convergence_and_harden_modular_architecture_boundaries` and stays linked to `task_027_orchestrate_runtime_convergence_and_modular_boundary_hardening` for delivered implementation evidence.


# Decision framing
- Product framing: Consider
- Product signals: engagement loop
- Product follow-up: Use stronger contract tests to keep future gameplay delivery from being slowed by architecture regressions.
- Architecture framing: Required
- Architecture signals: contracts and integration, delivery and operations
- Architecture follow-up: Treat boundary-level integration tests as a durable part of the modular architecture, not a temporary migration crutch.

# Links
- Product brief(s): `prod_000_initial_single_entity_navigation_loop`
- Architecture decision(s): `adr_015_define_engine_to_game_runtime_contract_boundaries`
- Request: `req_019_complete_runtime_convergence_and_harden_modular_architecture_boundaries`
- Primary task(s): `task_027_orchestrate_runtime_convergence_and_modular_boundary_hardening`

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from request `req_019_complete_runtime_convergence_and_harden_modular_architecture_boundaries`.
- Source file: `logics/request/req_019_complete_runtime_convergence_and_harden_modular_architecture_boundaries.md`.
- Recommended default from the request: place contract-level integration tests close to the engine-to-game boundary so they validate runtime flow without depending on the full browser shell.
- Implemented through `task_027_orchestrate_runtime_convergence_and_modular_boundary_hardening`.
