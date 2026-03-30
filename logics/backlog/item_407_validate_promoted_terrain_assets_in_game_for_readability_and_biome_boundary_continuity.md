## item_407_validate_promoted_terrain_assets_in_game_for_readability_and_biome_boundary_continuity - Validate promoted terrain assets in-game for readability and biome-boundary continuity
> From version: 0.7.2
> Schema version: 1.0
> Status: Ready
> Understanding: 100%
> Confidence: 97%
> Progress: 0%
> Complexity: Low
> Theme: Graphics
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Promoted terrain assets need real in-game validation because a texture that looks correct in isolation can still fail entity readability or produce hard biome-boundary cuts in the tiled world.
- Static file review is not sufficient — the tiling behavior and entity/pickup contrast must be confirmed in a live runtime scene.

# Scope
- In:
  - launch a runtime session on each of the three new biomes (Emberplain, Glowfen, Obsidian) and confirm entities and pickups remain legible against the new ground surface
  - navigate a world session that crosses a biome boundary and confirm the edge-continuity constraint holds — no hard visual cut line between adjacent terrain tiles
  - confirm the three biomes are visually distinguishable from each other in the world selection card (small representative crop)
  - if any asset fails validation, flag it for regeneration and re-run `item_406`
- Out:
  - fixing gameplay balance, entity behavior, or shell navigation
  - modifying the asset catalog, world profiles, or source code
  - validating Cinderfall Crown (it reuses Emberplain by design)

```mermaid
%% logics-kind: backlog
%% logics-signature: backlog|validate-promoted-terrain-assets-in-game|promoted-terrain-assets-need-real-in-gam|item-406-promotes-the-assets-item-407-va|ac1-the-slice-confirms-entity-and
flowchart LR
    Promoted[item 406 promoted assets] --> RuntimeCheck[In-game entity and pickup contrast]
    RuntimeCheck --> BoundaryCheck[Biome boundary continuity check]
    BoundaryCheck --> CardCheck[World selection card distinctness]
    CardCheck --> Pass{All pass?}
    Pass -->|Yes| Done[Wave complete]
    Pass -->|No| Regen[Flag asset for regeneration]
```

# Acceptance criteria
- AC1: The slice confirms that entities (player, hostiles) and pickups (crystals, gold, healing kit) remain legible against each of the three new terrain surfaces in a live runtime session.
- AC2: The slice confirms that a biome boundary in the world — where two different terrain tiles meet — does not produce a hard visual cut line that distracts from gameplay.
- AC3: The slice confirms that the three new biome terrains are visually distinguishable from each other and from Ashfield in the world selection card crop.
- AC4: Any asset that fails AC1, AC2, or AC3 is flagged and returns to `item_406` for regeneration rather than being accepted as a known regression.

# AC Traceability
- AC1 -> entity/pickup contrast. Proof: live session per biome, entities and pickups confirmed readable.
- AC2 -> boundary continuity. Proof: cross-biome traversal confirms no hard visual cut.
- AC3 -> world card distinctness. Proof: world selection screen reviewed, three biomes distinguishable.
- AC4 -> regeneration loop. Proof: failed assets returned to item_406, not accepted.

# Decision framing
- Product framing: Required
- Product signals: world readability, biome identity, player traversal experience
- Product follow-up: if all three pass, the terrain variation wave is complete and req_124 can close.
- Architecture framing: Optional
- Architecture signals: none — pure runtime and shell visual review
- Architecture follow-up: none expected.

# Links
- Product brief(s): `prod_017_graphical_asset_direction_for_runtime_readability_and_shell_identity`
- Architecture decision(s): `adr_052_adopt_a_content_driven_graphical_asset_pipeline_for_runtime_and_shell_surfaces`
- Request: `req_124_define_distinct_per_biome_terrain_asset_variation_for_emberplain_glowfen_and_obsidian`
- Primary task(s): `task_075_orchestrate_per_biome_terrain_asset_variation_generation_promotion_and_validation_wave`

# AI Context
- Summary: Validate the three promoted terrain assets in a live runtime session for entity/pickup contrast, biome-boundary continuity, and world selection card distinctness.
- Keywords: terrain validation, entity contrast, biome boundary, edge-continuity, world selection card, runtime review
- Use when: Use after terrain assets have been promoted and before closing req_124.
- Skip when: Skip when generation or promotion is not yet complete.

# References
- `src/assets/map/runtime/map.terrain.emberplain.runtime.webp`
- `src/assets/map/runtime/map.terrain.glowfen.runtime.webp`
- `src/assets/map/runtime/map.terrain.obsidian.runtime.webp`
- `src/assets/map/runtime/map.terrain.ashfield.runtime.webp`
- `logics/request/req_124_define_distinct_per_biome_terrain_asset_variation_for_emberplain_glowfen_and_obsidian.md`
