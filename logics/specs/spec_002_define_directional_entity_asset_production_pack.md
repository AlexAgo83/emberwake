## spec_002_define_directional_entity_asset_production_pack - Define lateral entity asset production pack
> Date: 2026-03-29
> Status: Accepted
> Related request: `req_096_define_cardinal_directional_runtime_assets_for_player_and_hostile_entities`
> Related backlog: `item_347_define_directional_entity_production_pack_and_generation_workflow`
> Related task: `task_068_orchestrate_directional_entity_presentation_and_runtime_sprite_separation`
> Related architecture: `adr_051_resolve_player_orientation_through_a_bounded_simulation_owned_turn_rate`, `adr_052_adopt_a_content_driven_graphical_asset_pipeline_for_runtime_and_shell_surfaces`
> Reminder: Update status, linked refs, directional roster, and prompt posture when the entity-facing wave changes.

# Overview
This spec defines the operator-facing production pack for living-entity facing assets. It supplements `spec_001` by turning one runtime entity asset into a bounded lateral set:
- `right` remains the default authored facing
- `left` may reuse `right` through reviewed mirroring
- `up` and `down` are no longer produced as separate assets in the current posture
- reviewed single-face exceptions such as `entity.hostile.needle.runtime` remain explicit rather than implicit

# Facing posture
- Use `right` as the default authored facing baseline.
- Keep the runtime posture lateral-only: `right` and `left`.
- Allow `left` to mirror `right` by default unless a later wave decides a family needs a true dedicated left-facing asset.
- Keep reviewed exceptions explicit. `entity.hostile.needle.runtime` remains on a single rotation-safe asset for now.

# Directional roster
- `entity.player.primary.runtime`: `right` from approved base asset, mirror `left`
- `entity.hostile.anchor.runtime`: `right` from approved base asset, mirror `left`
- `entity.hostile.drifter.runtime`: `right` from approved base asset, mirror `left`
- `entity.hostile.rammer.runtime`: `right` from approved base asset, mirror `left`
- `entity.hostile.sentinel.runtime`: `right` from approved base asset, mirror `left`
- `entity.hostile.watcher.runtime`: `right` from approved base asset, mirror `left`
- `entity.hostile.needle.runtime`: reviewed single-face exception, keep current rotation-safe asset

# File contract
- base runtime asset remains `src/assets/entities/runtime/<assetId>.png`
- authored facing variant becomes `src/assets/entities/runtime/<assetId>.right.png`
- runtime `left` may be mirrored from `.right` or from the base runtime asset
- generated candidates live under `output/imagegen/directional-entities/candidates/<assetId>/<facing>/variant-XX.png`
- curation lives in `output/imagegen/directional-entities/selection.json`

# Review posture
- Review lateral presentation per family, not as isolated images.
- A family is accepted when `right` reads cleanly and runtime `left` remains credible under mirroring.
- No top/bottom authored variants are expected in the current posture.

# References
- `req_096_define_cardinal_directional_runtime_assets_for_player_and_hostile_entities`
- `item_346_define_directional_entity_asset_contract_and_runtime_facing_resolution`
- `item_347_define_directional_entity_production_pack_and_generation_workflow`
- `task_068_orchestrate_directional_entity_presentation_and_runtime_sprite_separation`
