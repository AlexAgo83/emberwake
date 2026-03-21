## item_155_define_a_reduced_wall_generation_density_for_runtime_world_chunks - Define a reduced wall-generation density for runtime world chunks
> From version: 0.2.3
> Status: Done
> Understanding: 100%
> Confidence: 100%
> Progress: 100%
> Complexity: Medium
> Theme: World generation
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Wall-like blocking zones currently appear more often than the desired softer traversal posture.
- Without an explicit density-reduction slice, map generation remains busier and harsher than intended.

# Scope
- In: defining reduced effective wall density in generated chunks.
- Out: terrain taxonomy redesign, handcrafted map authoring, or full generator replacement.

```mermaid
%% logics-signature: backlog|define-a-reduced-wall-generation-density|req-043-define-a-softer-and-more-cluster|wall-like-blocking-zones-currently-appea|ac1-the-slice-defines-a-reduced
flowchart LR
    Req[Req 043 softer generation posture] --> Gap[Wall density is too high]
    Gap --> Slice[Define reduced wall density]
    Slice --> Result[Generated chunks stay more open and readable]
```

# Acceptance criteria
- AC1: The slice defines a reduced effective wall density strongly enough to guide implementation.
- AC2: The slice targets about half the current effective obstacle frequency.
- AC3: The slice preserves deterministic generation while softening blocking density.
- AC4: The slice stays narrow and does not widen into full generator redesign.

# Links
- Request: `req_043_define_a_softer_and_more_clustered_blocking_and_surface_generation_posture`

# Notes
- Derived from request `req_043_define_a_softer_and_more_clustered_blocking_and_surface_generation_posture`.
- Implemented in `a27102c`.
- Obstacle density now targets a softer effective wall frequency across generated space.
