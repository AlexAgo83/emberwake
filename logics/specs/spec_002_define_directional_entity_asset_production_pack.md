## spec_002_define_directional_entity_asset_production_pack - Define directional entity asset production pack
> Date: 2026-03-29
> Status: Accepted
> Related request: `req_096_define_cardinal_directional_runtime_assets_for_player_and_hostile_entities`
> Related backlog: `item_347_define_directional_entity_production_pack_and_generation_workflow`
> Related task: `task_068_orchestrate_directional_entity_presentation_and_runtime_sprite_separation`
> Related architecture: `adr_051_resolve_player_orientation_through_a_bounded_simulation_owned_turn_rate`, `adr_052_adopt_a_content_driven_graphical_asset_pipeline_for_runtime_and_shell_surfaces`
> Reminder: Update status, linked refs, directional roster, and prompt posture when the directional entity wave changes.

# Overview
This spec defines the operator-facing production pack for directional living entities. It supplements `spec_001` by turning one runtime entity asset into a bounded directional set:
- `right` remains the default authored facing
- `left` may reuse `right` through reviewed mirroring
- `up` and `down` should be treated as distinct authored facings for the families that benefit from four-facing presentation
- reviewed single-face exceptions such as `entity.hostile.needle.runtime` remain explicit rather than implicit

# Directional posture
- Use `right` as the default authored facing baseline.
- Produce `up` and `down` as separate authored assets for the families that need cardinal presentation.
- Allow `left` to mirror `right` by default unless a later wave decides a family needs a true dedicated left-facing asset.
- Keep reviewed exceptions explicit. `entity.hostile.needle.runtime` remains on a single rotation-safe asset for now.

# Directional roster
- `entity.player.primary.runtime`: `right` from approved base asset, generate `up` and `down`, mirror `left`
- `entity.hostile.anchor.runtime`: `right` from approved base asset, generate `up` and `down`, mirror `left`
- `entity.hostile.drifter.runtime`: `right` from approved base asset, generate `up` and `down`, mirror `left`
- `entity.hostile.rammer.runtime`: `right` from approved base asset, generate `up` and `down`, mirror `left`
- `entity.hostile.sentinel.runtime`: `right` from approved base asset, generate `up` and `down`, mirror `left`
- `entity.hostile.watcher.runtime`: `right` from approved base asset, generate `up` and `down`, mirror `left`
- `entity.hostile.needle.runtime`: reviewed single-face exception, keep current rotation-safe asset

# File contract
- base runtime asset remains `src/assets/entities/runtime/<assetId>.png`
- directional authored variant becomes `src/assets/entities/runtime/<assetId>.<facing>.png`
- generated candidates live under `output/imagegen/directional-entities/candidates/<assetId>/<facing>/variant-XX.png`
- curation lives in `output/imagegen/directional-entities/selection.json`

# Review posture
- Review directional sets per family, not as isolated images.
- A family is only directionally accepted when `up` and `down` remain recognizably the same hostile or player silhouette as the base `right`.
- If a generated facing is weak, the wave may keep the base runtime asset as fallback until a stronger directional variant exists.

# References
- `req_096_define_cardinal_directional_runtime_assets_for_player_and_hostile_entities`
- `item_346_define_directional_entity_asset_contract_and_runtime_facing_resolution`
- `item_347_define_directional_entity_production_pack_and_generation_workflow`
- `task_068_orchestrate_directional_entity_presentation_and_runtime_sprite_separation`
