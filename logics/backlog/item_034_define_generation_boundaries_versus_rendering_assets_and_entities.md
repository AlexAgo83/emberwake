## item_034_define_generation_boundaries_versus_rendering_assets_and_entities - Define generation boundaries versus rendering assets and entities
> From version: 0.1.1
> Status: Done
> Understanding: 93%
> Confidence: 92%
> Progress: 100%
> Complexity: High
> Theme: World
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- World generation must not silently absorb rendering and entity responsibilities.
- This slice defines the generation boundary so terrain rules, asset choice, and entity logic stay decoupled.

# Scope
- In: Generation-system boundaries relative to rendering assets and entities.
- Out: Generation algorithm details or runtime rendering implementation.

```mermaid
%% logics-signature: backlog|define-generation-boundaries-versus-rend|req-008-define-infinite-chunked-world-ge|world-generation-must-not-silently-absor|ac1-the-request-defines-a-dedicated
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: The request defines a dedicated world-generation scope rather than leaving chunk content as an informal rendering concern.
- AC2: The request defines deterministic expectations for chunk content generation.
- AC3: The request treats identical seed and coordinate inputs as producing identical world results.
- AC4: The request addresses the role of chunk coordinates and a future global seed in generation.
- AC5: The request remains compatible with the chunked streaming model and top-down rendering model already defined.
- AC6: The request treats a simple terrain-layer baseline as sufficient for the first generation model while anticipating later richness such as extra layers or biome-like variation.
- AC7: The request does not conflate generation rules with final visual assets or entity logic.

# AC Traceability
- AC1 -> Scope: Generation no longer lives as an informal render concern. Proof: `src/game/world/model/worldGeneration.ts`.
- AC2 -> Scope: Deterministic generation is explicit. Proof: `src/game/world/model/worldGeneration.ts`.
- AC3 -> Scope: Same inputs still produce same outputs. Proof: `src/game/world/model/worldGeneration.test.ts`.
- AC4 -> Scope: Seed and coordinates remain generation inputs only. Proof: `src/game/world/model/worldGeneration.ts`.
- AC5 -> Scope: Generation output remains compatible with the current render model. Proof: `src/game/world/model/chunkDebugData.ts`, `src/game/world/render/WorldScene.tsx`.
- AC6 -> Scope: The first terrain-layer baseline remains simple. Proof: `src/game/world/model/worldGeneration.ts`.
- AC7 -> Scope: Generation excludes render colors, assets, and entity logic. Proof: `src/game/world/model/worldGeneration.ts`, `src/game/world/model/worldGeneration.test.ts`.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Required
- Architecture signals: data model and persistence, contracts and integration
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): `adr_005_make_world_identity_deterministic_from_seed_and_coordinates`
- Request: `req_008_define_infinite_chunked_world_generation_model`
- Primary task(s): `task_019_orchestrate_deterministic_world_generation_foundation`

# Priority
- Impact: Medium
- Urgency: Low

# Notes
- Derived from request `req_008_define_infinite_chunked_world_generation_model`.
- Source file: `logics/request/req_008_define_infinite_chunked_world_generation_model.md`.
- Request context seeded into this backlog item from `logics/request/req_008_define_infinite_chunked_world_generation_model.md`.
- Completed in `task_019_orchestrate_deterministic_world_generation_foundation`.
