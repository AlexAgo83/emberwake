## item_205_define_a_bounded_chunk_visual_reuse_strategy_for_player_runtime_world_rendering - Define a bounded chunk visual reuse strategy for player-runtime world rendering
> From version: 0.3.2
> Status: Done
> Understanding: 96%
> Confidence: 93%
> Progress: 100%
> Complexity: High
> Theme: Performance
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The player-facing world layer still redraws chunk base visuals tile by tile inside the steady-state frame loop.
- That posture is acceptable at the current content scale, but it is an obvious scalability limit as visible chunk count, tile richness, or camera churn grows.
- This slice is needed to move static world visuals out of the expensive redraw path without widening into a renderer rewrite.

# Scope
- In: defining how chunk base visuals should be reused, prerendered, or cached so the default player runtime does not rebuild them tile by tile every frame.
- In: defining cache bounds, invalidation rules, and the seam between chunk-authored visual data and runtime-owned render resources.
- Out: combat/entity rendering changes, debug overlay policy beyond what is needed for chunk reuse, or speculative renderer replacement.

```mermaid
%% logics-signature: backlog|define-a-bounded-chunk-visual-reuse-stra|req-056-define-a-runtime-render-hot-path|the-player-facing-world-layer-still-redr|ac1-the-slice-defines-a-bounded
flowchart LR
    Req[Req 056 render hot path wave] --> Gap[Player runtime redraws chunk tiles each frame]
    Gap --> Slice[Bounded chunk visual reuse strategy]
    Slice --> Result[Cheaper steady-state world rendering]
```

# Acceptance criteria
- AC1: The slice defines a bounded strategy that removes tile-by-tile chunk base redraw from the steady-state player frame loop.
- AC2: The slice defines how chunk visuals are prepared, reused, and invalidated without blurring ownership between game data and Pixi resources.
- AC3: The slice defines explicit cache bounds or lifecycle rules so chunk reuse does not become an unbounded memory sink.
- AC4: The slice preserves current world appearance and deterministic chunk identity while changing the render posture.
- AC5: The slice stays focused on world/chunk rendering and does not absorb unrelated entity or shell optimizations.

# AC Traceability
- AC1 -> Scope: steady-state player rendering no longer rebuilds chunk tiles each frame. Proof target: `src/game/world/render/WorldScene.tsx`, chunk visual reuse implementation.
- AC2 -> Scope: preparation/reuse ownership stays explicit. Proof target: render-layer contracts, adapter seams, linked ADR text.
- AC3 -> Scope: cache lifecycle is bounded. Proof target: cache limit rules, invalidation policy, profiling validation notes.
- AC4 -> Scope: deterministic world identity and current visual output remain intact. Proof target: world appearance checks and chunk-id ownership references.
- AC5 -> Scope: world reuse remains isolated from other optimizations. Proof target: backlog/task boundaries and changed files.

# Decision framing
- Product framing: Optional
- Product signals: experience scope
- Product follow-up: No product brief required unless the visual result changes beyond technical equivalence.
- Architecture framing: Required
- Architecture signals: runtime and boundaries, data model, performance and scalability
- Architecture follow-up: Create or link an ADR before implementation broadens the render-resource lifecycle.

# Links
- Product brief(s): `prod_002_readable_world_traversal_and_presence`
- Architecture decision(s): `adr_005_make_world_identity_deterministic_from_seed_and_coordinates`, `adr_019_keep_engine_pixi_as_adapter_and_game_as_runtime_scene_composer`, `adr_028_budget_player_runtime_and_debug_visuals_as_separate_render_modes`, `adr_037_reuse_player_runtime_chunk_base_visuals_through_a_bounded_prerender_cache`
- Request: `req_056_define_a_runtime_render_hot_path_optimization_wave_for_world_and_entity_drawing`
- Primary task(s): `task_048_orchestrate_runtime_render_hot_path_optimization_for_world_and_entity_drawing`

# References
- `src/game/world/render/WorldScene.tsx`
- `src/game/world/hooks/useVisibleChunkSet.ts`
- `src/game/render/RuntimeSurface.tsx`
- `output/playwright/long-session/traversal-baseline-2026-03-23T01-47-40-693Z.json`

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from request `req_056_define_a_runtime_render_hot_path_optimization_wave_for_world_and_entity_drawing`.
- Source file: `logics/request/req_056_define_a_runtime_render_hot_path_optimization_wave_for_world_and_entity_drawing.md`.
- Implemented in `task_048_orchestrate_runtime_render_hot_path_optimization_for_world_and_entity_drawing` through local-space chunk rendering with stable retained draw callbacks in `src/game/world/render/WorldScene.tsx`.
- The more aggressive off-screen `cacheAsTexture` warm-cache attempt was rejected in this slice because it regressed `eastbound-drift`; the accepted first rollout keeps the lower-risk retained-chunk posture instead.
