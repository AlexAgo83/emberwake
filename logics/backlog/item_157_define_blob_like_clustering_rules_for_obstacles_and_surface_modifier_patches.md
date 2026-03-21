## item_157_define_blob_like_clustering_rules_for_obstacles_and_surface_modifier_patches - Define blob-like clustering rules for obstacles and surface-modifier patches
> From version: 0.2.3
> Status: Draft
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: World generation
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Obstacles and modifier zones currently risk reading as isolated dots or thin streaks rather than coherent patches.
- Without explicit clustering rules, generated space can feel noisy instead of intentional.

# Scope
- In: defining compact blob-like clustering for obstacle patches and surface-modifier patches as separate concerns.
- Out: full procedural-noise framework replacement or biome-level world redesign.

```mermaid
%% logics-signature: backlog|define-blob-like-clustering-rules-for-ob|req-043-define-a-softer-and-more-cluster|obstacles-and-modifier-zones-currently-r|ac1-the-slice-defines-compact-patch
flowchart LR
    Req[Req 043 softer generation posture] --> Gap[Features need better clustering]
    Gap --> Slice[Define blob-like clustering]
    Slice --> Result[Walls and modifier zones read as grouped patches]
```

# Acceptance criteria
- AC1: The slice defines compact patch/blot clustering strongly enough to guide implementation.
- AC2: The slice defines that obstacles and modifier zones cluster independently.
- AC3: The slice defines a preference for blobs over isolated points or thin line artifacts.
- AC4: The slice stays narrow and does not widen into a full generator rewrite.

# Links
- Request: `req_043_define_a_softer_and_more_clustered_blocking_and_surface_generation_posture`

# Notes
- Derived from request `req_043_define_a_softer_and_more_clustered_blocking_and_surface_generation_posture`.
