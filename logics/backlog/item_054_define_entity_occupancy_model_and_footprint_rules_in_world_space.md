## item_054_define_entity_occupancy_model_and_footprint_rules_in_world_space - Define entity occupancy model and footprint rules in world space
> From version: 0.1.2
> Status: Done
> Understanding: 94%
> Confidence: 91%
> Progress: 100%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Entities need a shared rule for how they occupy and reference world space.
- This slice defines footprints and occupancy semantics so later movement and interaction rules have a stable base, using a simple circular-radius baseline first.

# Scope
- In: Entity footprints, occupancy meaning, and world-space placement rules.
- Out: Overlap policy details, terrain traversal richness, or full physics.

```mermaid
%% logics-signature: backlog|define-entity-occupancy-model-and-footpr|req-014-define-world-occupancy-navigatio|entities-need-a-shared-rule-for|ac1-the-request-defines-a-dedicated
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: The request defines a dedicated spatial-rules scope connecting entities and world space.
- AC2: The request addresses occupancy expectations for entities in relation to tiles or world coordinates, starting from a simple circular-radius footprint baseline.
- AC3: The request treats world space as continuous by default, with grid or tile structure used as a helper rather than the only movement model.
- AC4: The request addresses baseline navigation or traversal rules at a product or architecture level.
- AC5: The request remains compatible with the chunked world model and entity footprint expectations already defined elsewhere.
- AC6: The request allows early overlap situations to be tolerated and diagnosed before a fuller resolution model exists.
- AC7: The request does not overreach into advanced AI, combat, or full physics systems.
- AC8: The request remains compatible with future interaction and simulation requests.

# AC Traceability
- AC1 -> Scope: A dedicated occupancy contract now connects entities and world space. Proof: `src/game/entities/model/entityOccupancy.ts`.
- AC2 -> Scope: Occupancy is expressed through world-space footprints. Proof: `src/game/entities/model/entityContract.ts`, `src/game/entities/model/entityOccupancy.ts`.
- AC3 -> Scope: World space remains continuous, with chunks as helpers only. Proof: `src/game/entities/model/entityOccupancy.ts`.
- AC4 -> Scope: Baseline traversal posture is explicit. Proof: `src/game/entities/model/entityOccupancy.ts`, `README.md`.
- AC5 -> Scope: The contract stays compatible with chunked world and entity footprints. Proof: `src/game/entities/model/entityOccupancy.ts`, `src/game/world/model/worldContract.ts`.
- AC6 -> Scope: Overlaps are tolerated and diagnosed. Proof: `src/game/entities/model/entityOccupancy.ts`, `src/game/entities/model/entityOccupancy.test.ts`, `src/game/debug/ShellDiagnosticsPanel.tsx`.
- AC7 -> Scope: The model avoids advanced physics or combat. Proof: `src/game/entities/model/entityOccupancy.ts`.
- AC8 -> Scope: The contract remains forward-compatible with future navigation and simulation work. Proof: `src/game/entities/model/entityOccupancy.ts`.

# Decision framing
- Product framing: Consider
- Product signals: navigation and discoverability
- Product follow-up: Review whether a product brief is needed before scope becomes harder to change.
- Architecture framing: Consider
- Architecture signals: contracts and integration
- Architecture follow-up: Review whether an architecture decision is needed before implementation becomes harder to reverse.

# Links
- Product brief(s): `prod_002_readable_world_traversal_and_presence`
- Architecture decision(s): `adr_003_define_coordinate_spaces_and_camera_contract`
- Request: `req_014_define_world_occupancy_navigation_and_interaction_rules`
- Primary task(s): `task_023_orchestrate_world_occupancy_continuity_and_release_operations`

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from request `req_014_define_world_occupancy_navigation_and_interaction_rules`.
- Source file: `logics/request/req_014_define_world_occupancy_navigation_and_interaction_rules.md`.
- Request context seeded into this backlog item from `logics/request/req_014_define_world_occupancy_navigation_and_interaction_rules.md`.
- Completed in `task_023_orchestrate_world_occupancy_continuity_and_release_operations`.
