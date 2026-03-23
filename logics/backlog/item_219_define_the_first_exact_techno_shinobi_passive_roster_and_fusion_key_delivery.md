## item_219_define_the_first_exact_techno_shinobi_passive_roster_and_fusion_key_delivery - Define the first exact techno-shinobi passive roster and fusion key delivery
> From version: 0.4.0
> Status: Draft
> Understanding: 98%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The first playable build loop needs an exact passive roster, not just passive direction.
- The project now needs a bounded first-pass set that teaches cooldown, damage, area, duration, duplication, and economy support through techno-shinobi naming.
- Without this slice, fusions and level-up choices will lack stable passive anchors.

# Scope
- In: defining and delivering the first exact passive roster for `Overclock Seal`, `Hardlight Sheath`, `Wideband Coil`, `Echo Thread`, `Duplex Relay`, and `Vacuum Tabi`.
- In: locking each passive’s primary stat role and fusion-key family.
- In: keeping the passive set small, readable, and aligned with the first fusion map.
- Out: larger passive expansion, rarity layers, or meta unlock gating.

```mermaid
%% logics-signature: backlog|define-the-first-exact-techno-shinobi-pa|req-059-define-a-first-playable-techno-s|the-first-playable-build-loop-needs|ac1-the-slice-defines-the-first
flowchart LR
    Req[Req 059 first playable build wave] --> Need[Exact passive roster delivery]
    Need --> Slice[Passive roster and fusion keys]
    Slice --> Result[Stable first-pass support baseline]
```

# Acceptance criteria
- AC1: The slice defines the first exact passive roster with the six named techno-shinobi passives.
- AC2: The slice locks one primary role and one fusion-key family for each first-wave passive.
- AC3: The slice keeps the passive roster aligned with the first playable fusion set and level-up readability goals.
- AC4: The slice stays bounded to the first-pass passive set and does not widen into broader progression systems.

# AC Traceability
- AC1 -> Scope: six exact passives are fixed. Proof target: linked content definitions and roster references.
- AC2 -> Scope: passive identity is implementation-ready. Proof target: stat-role and fusion-key mapping.
- AC3 -> Scope: passive content supports fusion and readability. Proof target: cross-links to fusion and UI slices.
- AC4 -> Scope: slice remains bounded. Proof target: explicit exclusion of broader progression expansion.

# Decision framing
- Product framing: Required
- Product signals: readability, build shaping, support identity
- Product follow-up: None.
- Architecture framing: Optional
- Architecture signals: runtime and boundaries
- Architecture follow-up: None.

# Links
- Product brief(s): `prod_007_foundational_passive_item_direction_for_emberwake`, `prod_010_first_playable_techno_shinobi_build_content_and_progression_defaults`
- Architecture decision(s): `adr_040_use_curated_active_passive_fusions_as_the_foundational_build_payoff_layer`, `adr_041_lock_the_first_playable_survivor_content_wave_to_one_character_and_a_small_curated_techno_shinobi_roster`
- Request: `req_059_define_a_first_playable_techno_shinobi_build_content_wave`
- Primary task(s): `task_051_orchestrate_the_first_playable_techno_shinobi_build_content_wave`

# References
- `logics/product/prod_007_foundational_passive_item_direction_for_emberwake.md`
- `logics/product/prod_010_first_playable_techno_shinobi_build_content_and_progression_defaults.md`
- `logics/request/req_059_define_a_first_playable_techno_shinobi_build_content_wave.md`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from request `req_059_define_a_first_playable_techno_shinobi_build_content_wave`.
- Source file: `logics/request/req_059_define_a_first_playable_techno_shinobi_build_content_wave.md`.
