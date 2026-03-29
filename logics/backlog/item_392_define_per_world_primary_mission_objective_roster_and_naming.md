## item_392_define_per_world_primary_mission_objective_roster_and_naming - Define per-world primary mission objective roster and naming
> From version: 0.6.1+c2d57bc
> Schema version: 1.0
> Status: Done
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: Small
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- `req_115` needs explicit world-specific mission objective rosters and names before runtime placement changes begin.
- Without that framing, world missions remain generic even if positions later differ.

# Scope
- In:
- define each world’s objective trio or equivalent roster
- define player-facing names per world
- define the minimum authored identity expected for those names
- Out:
- objective placement/runtime guidance integration
- side quests or narrative scripting

```mermaid
%% logics-kind: backlog
%% logics-signature: backlog|define-per-world-primary-mission-objecti|req-102-define-a-primary-map-mission-loo|req-115-needs-explicit-world-specific-mi|ac1-the-slice-defines-a-per-world
flowchart LR
    Request[req 115] --> Roster[Define per-world objective rosters]
    Roster --> Names[Define per-world objective names]
    Names --> Acceptance[AC1 to AC4]
    Acceptance --> Task[Execution task]
```

# Acceptance criteria
- AC1: The slice defines a per-world primary mission roster.
- AC2: The slice defines player-facing objective names per world.
- AC3: The slice defines the minimum authored identity expected from those names.
- AC4: The slice stays bounded to roster/naming framing.

# AC Traceability
- AC1 -> Scope: per-world roster. Proof: world-specific objective sets explicit.
- AC2 -> Scope: naming. Proof: player-facing names explicit.
- AC3 -> Scope: authored identity. Proof: naming posture stated.
- AC4 -> Scope: bounded framing. Proof: no placement/guidance creep.

# Decision framing
- Product framing: Required
- Product signals: world-specific mission identity
- Product follow-up: later lore flavor can deepen names if needed.
- Architecture framing: Optional
- Architecture signals: world-profile mission metadata shape
- Architecture follow-up: none unless mission data model expands heavily.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_115_define_unique_per_world_primary_mission_objectives_with_distinct_names_and_positions`
- Primary task(s): `task_073_orchestrate_boss_cleanup_seed_archive_and_crystal_persistence_wave`

# AI Context
- Summary: Define the per-world mission objective roster and naming posture for req 115.
- Keywords: world missions, objective names, roster, authored identity
- Use when: Use when preparing world-specific mission work.
- Skip when: Skip when already implementing positions and runtime guidance.

# References
- `src/shared/model/worldProfiles.ts`
- `logics/request/req_102_define_a_primary_map_mission_loop_with_three_target_zones_bosses_and_key_items.md`
