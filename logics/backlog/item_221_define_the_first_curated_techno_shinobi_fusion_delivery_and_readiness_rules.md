## item_221_define_the_first_curated_techno_shinobi_fusion_delivery_and_readiness_rules - Define the first curated techno-shinobi fusion delivery and readiness rules
> From version: 0.4.0
> Status: Draft
> Understanding: 97%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Gameplay
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The first playable wave now has a concrete fusion map, but the project still needs a dedicated slice that turns those named pairings into explicit payoff rules.
- Fusion must feel like a readable techno-shinobi escalation, not a vague hidden upgrade.
- Without a dedicated fusion slice, the first build loop could ship content and progression but miss its main payoff layer.

# Scope
- In: defining and delivering the first `4` curated fusions `Redline Ribbon`, `Choir of Pins`, `Blackfile Volley`, and `Temple Circuit`.
- In: defining readiness rules that combine owned active, owned passive key, and sufficient upgrade investment.
- In: defining restrained player-facing readiness indicators for the first pass.
- Out: broad fusion-matrix expansion or fully explicit recipe encyclopedia UX.

```mermaid
%% logics-signature: backlog|define-the-first-curated-techno-shinobi-|req-059-define-a-first-playable-techno-s|the-first-playable-wave-now-has|ac1-the-slice-defines-and-delivers
flowchart LR
    Req[Req 059 first playable build wave] --> Need[Concrete fusion payoff layer]
    Need --> Slice[Curated fusion delivery]
    Slice --> Result[Readable mid-run payoff]
```

# Acceptance criteria
- AC1: The slice defines and delivers the first four curated techno-shinobi fusions from `prod_010`.
- AC2: The slice defines explicit readiness rules for when a fusion path can resolve.
- AC3: The slice defines a restrained first-pass readiness communication posture aligned with techno-shinobi presentation.
- AC4: The slice keeps fusion scope bounded and does not widen into a combinatorial system.

# AC Traceability
- AC1 -> Scope: first fusion set is fixed. Proof target: fusion definitions and pairing references.
- AC2 -> Scope: readiness logic is explicit. Proof target: threshold and trigger references.
- AC3 -> Scope: communication posture is covered. Proof target: readiness marker references and UI links.
- AC4 -> Scope: slice remains bounded. Proof target: explicit exclusion of wider matrix expansion.

# Decision framing
- Product framing: Required
- Product signals: payoff, readability, build identity
- Product follow-up: None.
- Architecture framing: Required
- Architecture signals: runtime and boundaries
- Architecture follow-up: keep readiness rules aligned with ADR `040`.

# Links
- Product brief(s): `prod_008_active_passive_fusion_direction_for_emberwake`, `prod_010_first_playable_techno_shinobi_build_content_and_progression_defaults`
- Architecture decision(s): `adr_040_use_curated_active_passive_fusions_as_the_foundational_build_payoff_layer`, `adr_041_lock_the_first_playable_survivor_content_wave_to_one_character_and_a_small_curated_techno_shinobi_roster`
- Request: `req_059_define_a_first_playable_techno_shinobi_build_content_wave`
- Primary task(s): `task_051_orchestrate_the_first_playable_techno_shinobi_build_content_wave`

# References
- `logics/product/prod_008_active_passive_fusion_direction_for_emberwake.md`
- `logics/product/prod_010_first_playable_techno_shinobi_build_content_and_progression_defaults.md`
- `logics/request/req_059_define_a_first_playable_techno_shinobi_build_content_wave.md`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from request `req_059_define_a_first_playable_techno_shinobi_build_content_wave`.
- Source file: `logics/request/req_059_define_a_first_playable_techno_shinobi_build_content_wave.md`.
