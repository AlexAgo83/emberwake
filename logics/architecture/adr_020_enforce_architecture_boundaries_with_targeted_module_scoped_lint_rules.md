## adr_020_enforce_architecture_boundaries_with_targeted_module_scoped_lint_rules - Enforce architecture boundaries with targeted module scoped lint rules
> Date: 2026-03-21
> Status: Accepted
> Drivers: Keep the modular topology durable under ongoing delivery; reduce reliance on reviewer memory; catch architecture drift near the import site instead of after broad refactors land.
> Related request: `req_020_define_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement`
> Related backlog: `item_086_define_boundary_enforcement_strategy_for_public_modules_import_rules_and_architecture_regression_checks`
> Related task: `task_028_orchestrate_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
Architecture boundary enforcement should stay lightweight and local to the repo. Targeted lint rules are the primary enforcement mechanism, complemented by CI and focused tests where the signal is strong.

# Context
The repository already had healthier boundaries after runtime convergence, but that posture still depended too much on convention:
- content modules could still drift toward runtime or renderer dependencies
- shell modules could bypass the intended runtime-render boundary and import Pixi adapters directly
- presentation contracts could grow implementation detail instead of staying descriptive

That kind of drift is cheap to introduce and expensive to reverse once several changes build on top of it.

# Decision
- Use module-scoped `no-restricted-imports` rules as the first line of architecture regression prevention.
- Keep the rules targeted to high-value boundaries instead of building a large governance system.
- Protect content modules from app-shell, Pixi-adapter, runtime-orchestration, and legacy adapter imports.
- Protect game presentation contracts from app-shell and Pixi-adapter imports so they remain descriptive.
- Protect app-shell modules from direct Pixi-adapter imports so runtime rendering continues to flow through dedicated game-render boundaries.
- Keep these lint checks in the default repo `lint` and CI path so regressions fail early.

# Alternatives considered
- Rely only on reviewer discipline. Rejected because boundary drift is easiest to catch mechanically.
- Build custom architecture tooling immediately. Rejected because current repo size does not justify heavier internal platform work.
- Encode every architecture rule as a test. Rejected because import-boundary failures are better handled by lint.

# Consequences
- Boundary regressions fail close to the source change.
- The repo gets stronger architectural durability without large process overhead.
- Some existing helpers may need to move to better ownership zones when the rules become explicit, which is desirable.
- CI remains the enforcement path, so the rules stay visible in ordinary developer workflows.

# Migration and rollout
- Add targeted lint rules for the highest-value boundaries first.
- Fix or move modules that violate the new rules instead of weakening the rule set.
- Expand boundary checks only when new ownership seams prove unstable in practice.

# References
- `req_020_define_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement`
- `item_086_define_boundary_enforcement_strategy_for_public_modules_import_rules_and_architecture_regression_checks`
- `task_028_orchestrate_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement`
- `adr_014_adopt_a_modular_app_engine_game_topology_with_one_way_dependencies`
- `adr_015_define_engine_to_game_runtime_contract_boundaries`

# Follow-up work
- Add stronger public-entrypoint checks only if deep-path import drift becomes a recurring problem.
- Keep architecture-specific tests focused on runtime contracts and content validation rather than duplicating import-boundary lint logic.
