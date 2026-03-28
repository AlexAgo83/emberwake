## item_037_define_deterministic_world_reconstruction_versus_persisted_state_boundaries - Define deterministic world reconstruction versus persisted state boundaries
> From version: 0.1.1
> Status: Done
> Understanding: 93%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Data
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The project needs a rule for what is regenerated deterministically versus what is actually saved.
- This slice keeps persistence aligned with seed-based world identity instead of persisting unnecessary opaque state.

# Scope
- In: Reconstructible world state, persisted deltas, and save-vs-regenerate boundaries.
- Out: Storage engine implementation or full save UI.

```mermaid
%% logics-signature: backlog|define-deterministic-world-reconstructio|req-009-define-local-persistence-and-sav|the-project-needs-a-rule-for|ac1-the-request-defines-a-dedicated
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: The request defines a dedicated local persistence scope suitable for a static frontend application.
- AC2: The request identifies the first categories of data that may need persistence and distinguishes them from transient runtime state.
- AC3: The request treats preferences, world seed, and camera state as the intended first persistence scope before richer world or entity state.
- AC4: The request remains compatible with deterministic world or seed-driven behavior already anticipated elsewhere.
- AC5: The request addresses versioning or evolution concerns for saved local data at an appropriate level, with explicit save-version handling expected from the start.
- AC6: The request remains frontend-only and does not assume accounts, backend storage, or cloud sync.
- AC7: The request stays compatible with the PWA and static-hosting direction.

# AC Traceability
- AC1 -> Scope: Reconstruction boundaries are explicit in the persistence layer. Proof: `src/shared/lib/runtimeSessionStorage.ts`, `README.md`.
- AC2 -> Scope: Persisted state is kept narrower than transient/generated state. Proof: `README.md`.
- AC3 -> Scope: Only preferences, seed, and camera state are persisted first. Proof: `src/shared/lib/runtimeSessionStorage.ts`, `src/shared/lib/shellPreferencesStorage.ts`.
- AC4 -> Scope: The rule stays compatible with deterministic world generation. Proof: `src/game/world/model/worldGeneration.ts`, `src/shared/lib/runtimeSessionStorage.ts`.
- AC5 -> Scope: Versioned reconstruction remains explicit. Proof: `src/shared/lib/runtimeSessionStorage.ts`, `src/shared/lib/runtimeSessionStorage.test.ts`.
- AC6 -> Scope: The model remains frontend-only. Proof: `src/shared/lib/runtimeSessionStorage.ts`.
- AC7 -> Scope: The model remains compatible with static/PWA delivery. Proof: `README.md`.

# Decision framing
- Product framing: Consider
- Product signals: experience scope
- Product follow-up: Review whether a product brief is needed before scope becomes harder to change.
- Architecture framing: Required
- Architecture signals: data model and persistence, state and sync, delivery and operations
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): `adr_005_make_world_identity_deterministic_from_seed_and_coordinates`, `adr_009_limit_persistence_to_local_versioned_frontend_storage`
- Request: `req_009_define_local_persistence_and_save_strategy`
- Primary task(s): `task_020_orchestrate_persistence_and_reconstruction_boundaries`

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from request `req_009_define_local_persistence_and_save_strategy`.
- Source file: `logics/request/req_009_define_local_persistence_and_save_strategy.md`.
- Request context seeded into this backlog item from `logics/request/req_009_define_local_persistence_and_save_strategy.md`.
- Completed in `task_020_orchestrate_persistence_and_reconstruction_boundaries`.
