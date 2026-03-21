## item_166_define_blob_first_sampling_rules_for_non_base_tile_clusters - Define blob-first sampling rules for non-base tile clusters
> From version: 0.2.3
> Status: Done
> Understanding: 100%
> Confidence: 98%
> Progress: 100%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Non-base tiles are not clustered strongly enough into 2D patches.
- Local generation still permits too many thin runs instead of blobs.

# Scope
- In: blob-first sampling rules and cluster-thickness posture for special tiles.
- Out: decorative prop generation, biome content redesign, or collision redesign.

```mermaid
%% logics-signature: backlog|define-blob-first-sampling-rules-for-non|req-046-define-a-non-linear-tile-generat|non-base-tiles-are-not-clustered-strongl|ac1-the-slice-defines-blob-first-or
flowchart LR
    Req[Req 046 anti-stripe generation] --> Gap[Clusters are too thin]
    Gap --> Slice[Blob-first sampling]
    Slice --> Result[Grouped tile patches]
```

# Acceptance criteria
- AC1: The slice defines blob-first or patch-first clustering rules for special tiles.
- AC2: The slice defines thickness in both axes as a desired result.
- AC3: The slice keeps irregular patch edges rather than perfect geometric regions.
- AC4: The slice stays deterministic and runtime-safe.

# Links
- Request: `req_046_define_a_non_linear_tile_generation_posture_that_avoids_stripes_and_columns`

# Notes
- Derived from request `req_046_define_a_non_linear_tile_generation_posture_that_avoids_stripes_and_columns`.
- Delivered in `task_043_orchestrate_runtime_memory_structure_generation_and_settings_polish_wave`.
