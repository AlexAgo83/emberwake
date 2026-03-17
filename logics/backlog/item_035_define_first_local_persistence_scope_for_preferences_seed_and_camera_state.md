## item_035_define_first_local_persistence_scope_for_preferences_seed_and_camera_state - Define first local persistence scope for preferences seed and camera state
> From version: 0.1.1
> Status: Done
> Understanding: 93%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Data
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Local persistence needs a narrow first boundary instead of feature-by-feature drift.
- This slice fixes the initial save scope so preferences, seed, and camera state persist predictably in the static app.

# Scope
- In: First persisted categories, local-only storage boundary, and minimal save ownership.
- Out: Cloud sync, full world snapshots, or multi-device continuity.

```mermaid
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
- AC1 -> Scope: Local persistence has an explicit frontend-only boundary. Proof: `src/shared/lib/runtimeSessionStorage.ts`, `src/shared/lib/shellPreferencesStorage.ts`.
- AC2 -> Scope: Persisted state is separated from transient runtime state. Proof: `src/shared/lib/runtimeSessionStorage.ts`, `README.md`.
- AC3 -> Scope: Preferences, world seed, and camera state are the first persisted set. Proof: `src/shared/lib/shellPreferencesStorage.ts`, `src/shared/lib/runtimeSessionStorage.ts`, `README.md`.
- AC4 -> Scope: Persistence stays compatible with deterministic seed-driven world generation. Proof: `src/shared/lib/runtimeSessionStorage.ts`, `src/game/world/model/worldGeneration.ts`.
- AC5 -> Scope: Save-version handling exists from the start. Proof: `src/shared/lib/shellPreferencesStorage.ts`, `src/shared/lib/runtimeSessionStorage.ts`.
- AC6 -> Scope: The model remains frontend-only. Proof: `src/shared/lib/runtimeSessionStorage.ts`.
- AC7 -> Scope: The model stays compatible with the PWA/static-hosting direction. Proof: `README.md`, `src/shared/lib/runtimeSessionStorage.ts`.

# Decision framing
- Product framing: Consider
- Product signals: experience scope
- Product follow-up: Review whether a product brief is needed before scope becomes harder to change.
- Architecture framing: Required
- Architecture signals: data model and persistence, state and sync, delivery and operations
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): `adr_009_limit_persistence_to_local_versioned_frontend_storage`
- Request: `req_009_define_local_persistence_and_save_strategy`
- Primary task(s): `task_020_orchestrate_persistence_and_reconstruction_boundaries`

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from request `req_009_define_local_persistence_and_save_strategy`.
- Source file: `logics/request/req_009_define_local_persistence_and_save_strategy.md`.
- Request context seeded into this backlog item from `logics/request/req_009_define_local_persistence_and_save_strategy.md`.
- Completed in `task_020_orchestrate_persistence_and_reconstruction_boundaries`.
