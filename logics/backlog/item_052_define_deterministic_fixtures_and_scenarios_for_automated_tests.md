## item_052_define_deterministic_fixtures_and_scenarios_for_automated_tests - Define deterministic fixtures and scenarios for automated tests
> From version: 0.1.1
> Status: Done
> Understanding: 93%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Quality
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Automated tests need deterministic fixtures that match the runtime world model.
- This slice defines reusable test scenarios and fixtures so rendering, simulation, and player-loop tests stay reproducible.

# Scope
- In: Deterministic fixtures, seeded scenarios, and shared automated-test data contracts.
- Out: Test runner configuration or CI gating policy.

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: The request defines a dedicated testing strategy scope for the frontend project.
- AC2: The request distinguishes between at least some of the relevant test levels, such as unit, integration, browser, or scenario validation.
- AC3: The request treats camera or transform invariants, chunk-visibility logic, and deterministic simulation behavior as the first high-priority automated targets.
- AC4: The request includes lightweight browser smoke validation as an early part of the strategy.
- AC5: The request treats world or camera transform math as a higher early automation priority than the first player-loop browser scenario.
- AC6: Once the first controllable-entity loop exists, the strategy includes a browser-level check that validates directional input leading to visible entity movement.
- AC7: The request remains compatible with deterministic world or simulation behavior already anticipated in other requests.
- AC8: The request stays compatible with the future GitHub Actions CI pipeline.
- AC9: The request addresses testing concerns for rendering or coordinate logic at an appropriate level rather than treating the project as ordinary form-based UI only.
- AC10: The request does not require a disproportionate testing platform relative to the current project stage.

# AC Traceability
- AC1 -> Scope: Deterministic fixtures are part of the testing strategy rather than ad-hoc literals. Proof: `src/test/fixtures/runtimeFixtures.ts`.
- AC2 -> Scope: Fixtures are distinct from runtime logic and browser smoke implementation. Proof: `src/test/fixtures/runtimeFixtures.ts`, `scripts/testing/runBrowserSmoke.mjs`.
- AC3 -> Scope: Fixtures anchor deterministic world and simulation behavior. Proof: `src/test/fixtures/runtimeFixtures.ts`, `src/game/debug/data/officialDebugScenario.ts`.
- AC4 -> Scope: Browser smoke reuses the deterministic runtime posture. Proof: `src/test/fixtures/runtimeFixtures.ts`, `scripts/testing/runBrowserSmoke.mjs`.
- AC5 -> Scope: Fixtures support fast deterministic tests before browser automation. Proof: `src/test/fixtures/runtimeFixtures.test.ts`.
- AC6 -> Scope: The first player loop can be validated against fixture-backed expectations. Proof: `src/test/fixtures/runtimeFixtures.ts`, `scripts/testing/runBrowserSmoke.mjs`.
- AC7 -> Scope: Fixture data stays compatible with deterministic seed-driven runtime behavior. Proof: `src/game/debug/data/officialDebugScenario.ts`, `src/shared/lib/runtimeSessionStorage.ts`.
- AC8 -> Scope: Fixture-backed tests are CI-friendly. Proof: `package.json`, `.github/workflows/ci.yml`.
- AC9 -> Scope: Fixture coverage is aimed at runtime/rendering concerns rather than generic UI forms. Proof: `src/test/fixtures/runtimeFixtures.ts`.
- AC10 -> Scope: The fixture set remains small and proportionate. Proof: `src/test/fixtures/runtimeFixtures.ts`.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Required
- Architecture signals: data model and persistence, contracts and integration
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): `prod_000_initial_single_entity_navigation_loop`
- Architecture decision(s): `adr_005_make_world_identity_deterministic_from_seed_and_coordinates`, `adr_011_use_typed_typescript_as_the_initial_data_and_config_authoring_model`
- Request: `req_013_define_frontend_testing_strategy_for_rendering_simulation_and_world_logic`
- Primary task(s): `task_022_orchestrate_testing_browser_smoke_and_ci_execution_tiers`

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from request `req_013_define_frontend_testing_strategy_for_rendering_simulation_and_world_logic`.
- Source file: `logics/request/req_013_define_frontend_testing_strategy_for_rendering_simulation_and_world_logic.md`.
- Request context seeded into this backlog item from `logics/request/req_013_define_frontend_testing_strategy_for_rendering_simulation_and_world_logic.md`.
- Completed in `task_022_orchestrate_testing_browser_smoke_and_ci_execution_tiers`.
