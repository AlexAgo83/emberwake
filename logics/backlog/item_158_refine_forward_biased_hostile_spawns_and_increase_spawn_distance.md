## item_158_refine_forward_biased_hostile_spawns_and_increase_spawn_distance - Refine forward-biased hostile spawns and increase spawn distance
> From version: 0.2.3
> Status: Draft
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Hostile spawns still read as too rear-biased when the player is moving.
- Spawn distance is still too short to reliably let the player see threats arriving before pressure starts.

# Scope
- In: correcting forward-biased hostile spawn posture, preserving deterministic fallback sectors, and increasing hostile spawn distance.
- Out: encounter-director systems, cinematic spawning, or broader hostile-AI redesign.

```mermaid
%% logics-signature: backlog|refine-forward-biased-hostile-spawns-and|req-044-refine-spawn-bootstrap-pause-sur|hostile-spawns-still-read-as-too|ac1-the-slice-defines-a-clearer
flowchart LR
    Req[Req 044 spawn and shell polish] --> Gap[Spawn pressure still feels misdirected]
    Gap --> Slice[Refine forward-biased spawns]
    Slice --> Result[Threats appear earlier and more visibly ahead]
```

# Acceptance criteria
- AC1: The slice defines a clearer front-first hostile spawn posture strongly enough to guide implementation.
- AC2: The slice defines increased hostile spawn distance while preserving safety and traversability checks.
- AC3: The slice preserves deterministic side and rear fallback behavior when preferred sectors fail.
- AC4: The slice stays narrow and does not widen into encounter-direction or hostile-combat redesign.

# Links
- Request: `req_044_refine_spawn_bootstrap_pause_surface_and_escape_navigation_behaviors`

# Notes
- Derived from request `req_044_refine_spawn_bootstrap_pause_surface_and_escape_navigation_behaviors`.
