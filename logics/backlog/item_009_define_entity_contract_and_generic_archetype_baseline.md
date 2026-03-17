## item_009_define_entity_contract_and_generic_archetype_baseline - Define entity contract and generic archetype baseline
> From version: 0.1.0
> Status: Ready
> Understanding: 92%
> Confidence: 89%
> Progress: 0%
> Complexity: High
> Theme: Entities
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The entity layer needs a minimum shared entity contract before movement, rendering, and lifecycle systems can diverge.
- The first implementation should start from one generic movable archetype rather than prematurely locking several gameplay-specific families.
- Entity identity, footprint, orientation, mutable state, and explicit render ordering need to be part of the baseline contract.

# Scope
- In:
- Minimum entity fields and shared contract
- One generic movable archetype baseline
- Footprint or radius model and orientation field
- Explicit render ordering or layer priority in the entity contract
- Out:
- Movement simulation rules
- Chunk indexing and visibility policy
- Selection, inspection, and debug scenario behavior

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: The entity layer defines a minimum shared contract that includes at least stable identity, world position, orientation, visual representation, and mutable state.
- AC2: The first implementation starts from one generic movable archetype rather than multiple gameplay-specialized families.
- AC3: Entities include a simple footprint model such as a radius or equivalent size indicator.
- AC4: Entity orientation is part of the baseline contract and is available for rendering and later movement-facing behavior.
- AC5: Render ordering or layer priority for entities is explicit enough to avoid unstable draw order.
- AC6: This baseline contract is suitable for later movement, chunk indexing, and inspection slices without being replaced.

# AC Traceability
- AC1 -> Scope: Minimum shared entity contract is explicit. Proof: TODO.
- AC2 -> Scope: One generic movable archetype is the default baseline. Proof: TODO.
- AC3 -> Scope: Footprint or radius model exists. Proof: TODO.
- AC4 -> Scope: Orientation is part of the baseline contract. Proof: TODO.
- AC5 -> Scope: Render ordering is explicit. Proof: TODO.
- AC6 -> Scope: Contract remains reusable for later movement, indexing, and inspection work. Proof: TODO.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Required
- Architecture signals: contracts and integration, delivery and operations
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_002_render_evolving_world_entities_on_the_map`
- Primary task(s): `task_XXX_example`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from request `req_002_render_evolving_world_entities_on_the_map`.
- Source file: `logics/request/req_002_render_evolving_world_entities_on_the_map.md`.
- Request context seeded into this backlog item from `logics/request/req_002_render_evolving_world_entities_on_the_map.md`.
- This slice defines the baseline entity model that all later entity work depends on.
