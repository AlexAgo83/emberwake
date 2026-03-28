## prod_012_second_pass_combat_skill_feedback_polish_for_underexpressed_weapons - Second-pass combat skill feedback polish for underexpressed weapons
> Date: 2026-03-28
> Status: Validated
> Related request: `req_062_define_a_second_combat_skill_feedback_polish_wave_for_underexpressed_weapons`
> Related backlog: `item_233_define_a_non_hit_readability_posture_for_polished_weapon_feedback`, `item_234_define_a_stronger_cinder_arc_anticipation_and_travel_signature_without_full_projectiles`, `item_235_define_a_more_present_orbit_sutra_and_null_canister_spatial_ownership_signature`, `item_236_define_clearer_visual_role_separation_between_guided_senbon_and_shade_kunai`, `item_237_define_targeted_validation_for_second_pass_weapon_feedback_polish`
> Related task: `task_054_orchestrate_post_0_4_0_runtime_expression_and_progression_waves`
> Related architecture: `adr_042_separate_weapon_simulation_from_transient_combat_skill_feedback_presentation`, `adr_043_extend_transient_weapon_feedback_with_bounded_anticipation_and_linger_states`
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
The first combat-skill feedback wave made the first playable weapon roster visible, but not yet equally expressive. Some weapons still disappear too completely when they do not land immediate hits, and some role families still read too similarly under swarm pressure.

This brief defines the next product layer:

`make the first-wave arsenal consistently readable, not just nominally visible`

```mermaid
flowchart LR
    Problem[Product problem] --> Goals[Goals]
    Goals --> Decisions[Key product decisions]
    Decisions --> Guardrails[Scope and guardrails]
    Guardrails --> Signals[Success signals]
```


# Product problem
The current first-pass feedback solved the biggest gap, but left four weaker areas:
- some feedback is too hit-dependent
- `Cinder Arc` still under-communicates anticipation and travel
- `Orbit Sutra` and `Null Canister` still under-communicate owned space
- `Guided Senbon` and `Shade Kunai` are still too close in line-based silhouette

Without a second pass:
- some skills feel quieter than their gameplay importance
- delayed and zone-control roles are harder to learn by sight
- some low-contact moments still feel visually empty
- the roster feels less differentiated than it already is in simulation

# Goals
- Make under-expressed first-wave weapons readable even in lower-contact moments.
- Strengthen delayed, orbital, and field-control signatures.
- Increase silhouette separation between precision and burst-forward line weapons.
- Keep the techno-shinobi language disciplined and spatially legible.

# Non-goals
- Replacing the transient feedback seam with a projectile-owned simulation rewrite.
- Building final VFX polish, particles, or audio.
- Introducing a general-purpose full combat-effects framework.
- Reworking the entire first-wave roster from scratch.

# Direction
## Keep the first-wave seam
The first pass already chose the right architecture:
- simulation remains authoritative
- transient feedback remains presentation-owned

The second pass should deepen that seam, not replace it.

## Add bounded pre-hit and linger readability where roles need it
Not every weapon needs visible pre-hit or linger states. The second pass should apply them only where role comprehension depends on them:
- `Cinder Arc` needs anticipation/travel read
- `Orbit Sutra` needs stronger local presence
- `Null Canister` needs stronger field occupancy

## Separate precision from volley by silhouette, not just color
`Guided Senbon` and `Shade Kunai` should not rely on palette differences alone.
The player should feel:
- `Senbon`: surgical, reacquiring, precise
- `Kunai`: committed, fanned, burst-forward

# Theme guardrails
- The wave must stay `techno-shinobi`, not generic bullet-hell neon.
- Added cues should be brief and composed:
  - reticles
  - travel slashes
  - orbital traces
  - field seals
  - pulse lattices
- The second pass should add role clarity, not clutter.

# Success signals
- `Cinder Arc`, `Orbit Sutra`, and `Null Canister` become easier to read in motion.
- `Guided Senbon` and `Shade Kunai` are clearly distinct by silhouette and cadence.
- Some skills remain visually understandable even when a direct hit is not yet visible.
- The transient feedback layer remains cheap enough for current runtime budgets.

# Risks
- Over-adding feedback and making combat noisy.
- Sliding into a stealth projectile rewrite without proving it is needed.
- Letting non-hit feedback create false reads that misrepresent actual damage resolution.

# Open questions
- Which roles need attempt-time cues versus hit-time cues?
  Recommended default: only the roles whose spatial teaching depends on them.
- How much persistent presence can `Orbit Sutra` and `Null Canister` gain before they become visually heavy?
  Recommended default: add just enough occupancy to teach space ownership, not permanent spectacle.
