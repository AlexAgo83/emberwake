## adr_042_separate_weapon_simulation_from_transient_combat_skill_feedback_presentation - Separate weapon simulation from transient combat skill feedback presentation
> Date: 2026-03-23
> Status: Proposed
> Drivers: The first playable weapon roster now exists in simulation, but combat signatures are not legible enough on screen; the project needs visible skill feedback without prematurely converting every weapon into a heavy persistent projectile system.
> Related request: `req_061_define_a_first_combat_skill_feedback_wave_for_playable_weapons`
> Related backlog: `TBD after request approval`
> Related task: `TBD after request approval`
> Related architecture: `adr_019_keep_engine_pixi_as_adapter_and_game_as_runtime_scene_composer`, `adr_028_budget_player_runtime_and_debug_visuals_as_separate_render_modes`, `adr_038_split_entity_player_rendering_into_stable_geometry_and_transient_combat_overlays`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
The first wave of weapon visuals in `Emberwake` should be built around transient combat feedback events emitted by weapon resolution, not around an immediate rewrite toward fully simulated projectile entities for every skill.

# Context
The current runtime already supports:
- deterministic combat resolution
- active/passive/fusion build state
- floating damage numbers
- transient combat overlays
- bounded render hot-path posture

What it does not yet support is a strong presentation contract for weapon-specific feedback.

If the project tries to solve that by immediately turning every first-wave weapon into:
- a long-lived projectile entity
- with bespoke collision ownership
- with separate lifecycle simulation

it will take on too much architecture and runtime churn before proving that the weapon roster is visually readable.

The project already has a cleaner seam available:
- weapon logic resolves when and where hits happen
- presentation can consume a compact attack-event stream
- the renderer can draw short-lived techno-shinobi signatures from those events

# Decision
- Introduce a transient combat-skill feedback layer that is fed by runtime attack events.
- Keep first-wave weapon gameplay resolution authoritative in the current combat simulation.
- Add a presentation-facing contract that can describe:
  - source
  - origin
  - targets or impact points
  - weapon identity
  - timing/lifetime
  - effect shape kind
- Render those events in a dedicated transient feedback layer rather than overloading entity ownership or immediately creating persistent projectile actors.
- Allow some weapons to gain temporary markers or pulses with short bounded lifetimes, but keep that still within presentation-owned transient feedback unless gameplay truly requires persistent simulation later.

# Alternatives considered
- Convert every first-wave weapon to real projectile entities immediately.
  Rejected because it adds too much simulation and renderer complexity before the core readability problem is solved.
- Keep only floating damage numbers and HUD indicators.
  Rejected because it does not make weapon identity visible enough.
- Hardcode visual behavior inside each combat rule without a shared event contract.
  Rejected because it creates coupling and makes later expansion harder.

# Consequences
- The first weapon visual wave can land quickly and visibly.
- Simulation remains simpler and more deterministic in the short term.
- The renderer gains a clearer transient-effects seam for future growth.
- Some future weapons may still require real projectile gameplay objects, but that decision can be made later weapon by weapon instead of being forced now for the whole roster.

# Migration and rollout
- Define the combat-skill feedback event contract.
- Emit first-wave events from the current attack-resolution path.
- Add a transient render layer for attack traces, pulses, bursts, and temporary zone markers.
- Differentiate fused states through event parameters rather than separate simulation stacks where possible.
- Revisit projectile-owned gameplay only if a later weapon or mechanic cannot be expressed cleanly through this seam.

# References
- `prod_010_first_playable_techno_shinobi_build_content_and_progression_defaults`
- `prod_011_techno_shinobi_combat_skill_feedback_direction_for_first_playable_weapons`
- `adr_038_split_entity_player_rendering_into_stable_geometry_and_transient_combat_overlays`

# Follow-up work
- Define the first bounded combat-skill feedback wave for playable weapons.
- Split backlog slices between event contract, transient renderer, first-wave weapon signatures, and validation.
- Reassess whether any later skill truly needs persistent projectile simulation instead of transient feedback.
