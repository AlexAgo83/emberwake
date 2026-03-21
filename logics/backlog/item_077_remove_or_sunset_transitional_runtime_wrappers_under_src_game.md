## item_077_remove_or_sunset_transitional_runtime_wrappers_under_src_game - Remove or sunset transitional runtime wrappers under src game
> From version: 0.1.2
> Status: Done
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The repository still contains transitional wrappers under `src/game/*` that only re-export engine or game-owned modules.
- Those wrappers helped the migration, but if they remain indefinite they will obscure ownership, prolong import ambiguity, and make future refactors harder to reason about.

# Scope
- In: Inventory and cleanup of pure re-export wrappers, sunset rules for any temporary adapters that must remain, and import-path simplification toward true ownership boundaries.
- Out: Rewriting stable engine or gameplay modules without reason, or forcing all adapters to disappear in one unsafe pass.

```mermaid
%% logics-signature: backlog|remove-or-sunset-transitional-runtime-wr|req-019-complete-runtime-convergence-and|the-repository-still-contains-transition|ac1-pure-re-export-wrappers-under-src
flowchart LR
    Req[Req 019 convergence] --> Wrappers[Transitional wrappers blur ownership]
    Wrappers --> Cleanup[Remove or bound adapters]
    Cleanup --> Clear[Imports show true ownership]
```

# Acceptance criteria
- AC1: Pure re-export wrappers under `src/game/*` are either removed or explicitly marked as temporary migration adapters with a bounded purpose.
- AC2: Runtime imports become clearer about whether they target `@engine`, `@engine-pixi`, `@game`, or the app shell.
- AC3: Any adapters that remain after the slice have an explicit sunset posture rather than becoming a silent permanent layer.
- AC4: Cleanup remains compatible with the current runtime and does not create broad import churn unrelated to ownership clarity.
- AC5: The result reduces boundary ambiguity without reintroducing `engine -> game` coupling.

# AC Traceability
- AC1 -> Scope: Wrapper cleanup is explicit and bounded. Proof target: `src/game`, import graph review, remaining adapter comments or migration notes.
- AC2 -> Scope: Import ownership becomes easier to read. Proof target: updated imports across `src`, `games`, and `packages`.
- AC3 -> Scope: Remaining adapters are intentionally temporary. Proof target: inline TODO boundaries, task notes, backlog follow-up references if needed.
- AC4 -> Scope: The change stays focused on ownership clarity. Proof target: limited file scope, import diff review, preserved runtime behavior.
- AC5 -> Scope: Cleanup does not weaken the modular split. Proof target: import-boundary review, engine/game module relationships, CI validation.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No direct product decision follow-up is expected if the cleanup remains internal and low risk.
- Architecture framing: Required
- Architecture signals: runtime and boundaries
- Architecture follow-up: Use wrapper removal to make ownership visible in code, not only in directory names.

# Links
- Product brief(s): `prod_000_initial_single_entity_navigation_loop`
- Architecture decision(s): `adr_014_adopt_a_modular_app_engine_game_topology_with_one_way_dependencies`
- Request: `req_019_complete_runtime_convergence_and_harden_modular_architecture_boundaries`
- Primary task(s): `task_027_orchestrate_runtime_convergence_and_modular_boundary_hardening`

# Priority
- Impact: Medium
- Urgency: High

# Notes
- Derived from request `req_019_complete_runtime_convergence_and_harden_modular_architecture_boundaries`.
- Source file: `logics/request/req_019_complete_runtime_convergence_and_harden_modular_architecture_boundaries.md`.
- Recommended default from the request: remove pure re-export wrappers first and keep only adapters that still absorb active migration risk.
- Implemented through `task_027_orchestrate_runtime_convergence_and_modular_boundary_hardening`.
