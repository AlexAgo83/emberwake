## item_073_separate_emberwake_specific_gameplay_content_and_scenarios_from_runtime_code - Separate Emberwake specific gameplay content and scenarios from runtime code
> From version: 0.1.3
> Status: Done
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Several current runtime modules still blend Emberwake-specific simulation rules, scenario data, and presentation assumptions into areas that will otherwise be treated as reusable runtime code.
- If those game-specific parts are not isolated deliberately, the repository will keep leaking Emberwake fiction and rules into engine-owned code even after partial extraction work.

# Scope
- In: Separation of Emberwake-owned gameplay rules, scenario data, content definitions, world flavor, and player-facing game presentation from reusable runtime code.
- Out: Full gameplay redesign, new combat systems, or a final reusable content pipeline for many games.

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: The slice identifies which current modules are explicitly Emberwake-owned and should remain in the game layer.
- AC2: Emberwake-specific scenario data, gameplay simulation rules, content definitions, and authored world flavor are moved behind game-owned boundaries rather than remaining mixed with engine candidates.
- AC3: Game-owned modules become the only place where Emberwake-specific entity states, content meaning, and future progression rules are allowed to live.
- AC4: The separation remains compatible with current player-facing runtime behavior and does not require a finished second game to justify the boundary.
- AC5: The slice keeps enough local structure inside the Emberwake game layer that the game can continue evolving rapidly after the extraction.

# AC Traceability
- AC1 -> Scope: Emberwake-owned modules are explicitly classified. Proof target: migration inventory, game-layer structure, updated docs.
- AC2 -> Scope: Scenario data and gameplay rules move under game-owned boundaries. Proof target: Emberwake gameplay modules, content folders, scenario definitions.
- AC3 -> Scope: Game-specific meaning is no longer stored in engine modules. Proof target: entity state ownership, gameplay rules, authored content modules.
- AC4 -> Scope: The current runtime still behaves coherently after the separation. Proof target: runtime tests, browser smoke, task validation report.
- AC5 -> Scope: The game layer stays practical to extend. Proof target: `games/emberwake` or equivalent structure, local ownership patterns, updated architecture notes.

# Decision framing
- Product framing: Required
- Product signals: engagement loop, navigation and discoverability
- Product follow-up: Preserve gameplay iteration speed and readability while the architecture boundary is tightened.
- Architecture framing: Required
- Architecture signals: runtime and boundaries, contracts and integration
- Architecture follow-up: Keep the game layer explicit enough that later new game systems land there by default instead of drifting back into engine modules.

# Links
- Product brief(s): `prod_000_initial_single_entity_navigation_loop`, `prod_002_readable_world_traversal_and_presence`, `prod_003_high_density_top_down_survival_action_direction`
- Architecture decision(s): `adr_000_adopt_feature_oriented_organic_frontend_structure`
- Request: `req_018_define_engine_and_gameplay_boundary_for_runtime_reuse`
- Primary task(s): `task_026_orchestrate_engine_gameplay_boundary_extraction_for_runtime_reuse`

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from request `req_018_define_engine_and_gameplay_boundary_for_runtime_reuse`.
- Source file: `logics/request/req_018_define_engine_and_gameplay_boundary_for_runtime_reuse.md`.
- Likely Emberwake-owned modules include gameplay simulation rules, debug scenario content, world generation flavor, player-facing HUD meaning, and future survival or progression systems.
- Implemented with Emberwake-owned content and rules moved into `games/emberwake/src/content`, `games/emberwake/src/input`, and `games/emberwake/src/runtime`, while legacy `src/game/*` modules remain as migration shims or shell-facing adapters where needed.
