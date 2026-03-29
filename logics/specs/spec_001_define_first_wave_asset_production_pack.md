## spec_001_define_first_wave_asset_production_pack - Define first-wave asset production pack
> Date: 2026-03-29
> Status: Accepted
> Related request: `req_094_define_asset_production_specifications_and_prompt_packs_for_the_first_graphical_wave`
> Related backlog: `item_343_define_asset_production_specifications_and_prompt_packs_for_the_first_graphical_wave`
> Related task: `task_066_orchestrate_first_wave_asset_production_specifications_and_prompt_packs`
> Related architecture: `adr_052_adopt_a_content_driven_graphical_asset_pipeline_for_runtime_and_shell_surfaces`
> Reminder: Update status, linked refs, asset entries, and prompt posture when the first-wave roster or file contract changes.

# Overview
This spec defines the operator-facing production pack for Emberwake's first graphical wave. It translates the runtime asset strategy into concrete per-asset instructions so the next operator can generate, commission, or hand-author assets without guessing the technical format or visual posture.

The pack covers:
- a shared first-wave style guide
- the reusable asset production sheet format
- the first-wave asset roster
- copy-paste prompt packs for each asset

# First-wave posture
The first wave stays readability-first and bounded. It covers:
- player runtime silhouette
- core hostile family silhouettes
- pickup silhouettes
- terrain chunk art surfaces

The first wave does not try to finalize:
- every shell scene
- every codex illustration
- every biome variation
- advanced animation or frame packs

# Shared style guide
## Runtime entities and pickups
- Primary goal: fast silhouette recognition at small runtime sizes.
- Background: transparent mandatory.
- Framing: one centered subject with 10 to 14 percent safe margin.
- Facing: `right` is the default authored facing for runtime entities unless the subject is radial.
- Detail level: medium, not noisy; interior cuts are allowed, tiny texture clutter is not.
- Lighting: crisp emissive accents, restrained shading, no photoreal rendering.
- Line of action: stable, combat-readable, no dramatic perspective warp.
- Avoid:
  - text
  - frames
  - baked background
  - long cast shadows
  - cinematic camera angles
  - clutter that breaks readability at icon or runtime scale

## Terrain surfaces
- Primary goal: biome identity without reducing obstacle readability.
- Background: opaque allowed.
- Framing: seamless-ish texture panel, no horizon line, no camera perspective.
- Detail level: broad patterning and surface motif, not storytelling illustration.
- Avoid:
  - landmarks that obviously tile badly
  - perspective floors
  - high-contrast focal objects
  - bright noise that competes with pickups or enemies

# Production sheet template
Use this format for every asset entry.

- `assetId`:
- `surface`:
- `role`:
- `delivery format`:
- `transparency`:
- `recommended source canvas`:
- `destination runtime path`:
- `composition guidance`:
- `style guidance`:
- `avoid list`:
- `sidecar metadata`:
- `copy-paste prompt`:

# First-wave asset roster
## Runtime entities

### `entity.player.primary.runtime`
- `surface`: runtime entity
- `role`: primary player avatar
- `delivery format`: `png`
- `transparency`: required
- `recommended source canvas`: `1024x1024`
- `destination runtime path`: `src/assets/entities/runtime/entity.player.primary.runtime.<ext>`
- `composition guidance`: centered single subject, readable core silhouette, right-facing, safe margin around the outer energy fins
- `style guidance`: techno-shinobi ember core, compact heroic silhouette, luminous but controlled
- `avoid list`: no background, no weapon trail, no floor shadow, no cinematic perspective
- `sidecar metadata`: not needed unless the visual center is intentionally offset
- `copy-paste prompt`:
```text
Create a single-subject runtime game asset for a techno-shinobi action game: the player core avatar, centered on a transparent background, right-facing, crisp readable silhouette, compact ember reactor body with shard-like fins and controlled luminous accents, graphic and stylized rather than photoreal, medium detail, strong interior separation, readable at small scale, no text, no frame, no environment, no floor, no cast shadow, no perspective distortion.
```

### `entity.hostile.anchor.runtime`
- `surface`: runtime entity
- `role`: heavy anchor hostile
- `delivery format`: `png`
- `transparency`: required
- `recommended source canvas`: `1024x1024`
- `destination runtime path`: `src/assets/entities/runtime/entity.hostile.anchor.runtime.<ext>`
- `composition guidance`: centered, broad and weighty, right-facing, grounded silhouette
- `style guidance`: techno-shinobi brute shell, armored anchor posture, heavy mass read
- `avoid list`: no tiny mechanical clutter, no background FX, no gore, no side view
- `sidecar metadata`: not needed by default
- `copy-paste prompt`:
```text
Create a transparent-background runtime enemy asset for a techno-shinobi survival game: a heavy anchor hostile, centered, right-facing, broad armored silhouette with stable weight and industrial shrine-tech geometry, medium detail, readable at small scale, strong outer shape, graphic stylization, no text, no background, no ground plane, no cinematic perspective, no clutter.
```

### `entity.hostile.drifter.runtime`
- `surface`: runtime entity
- `role`: loose drift-line hostile
- `delivery format`: `png`
- `transparency`: required
- `recommended source canvas`: `1024x1024`
- `destination runtime path`: `src/assets/entities/runtime/entity.hostile.drifter.runtime.<ext>`
- `composition guidance`: centered, lighter asymmetrical silhouette, right-facing
- `style guidance`: scavenger-like techno ghost frame, agile and unstable, readable fins and trailing mass
- `avoid list`: no smoke cloud background, no extreme motion blur, no realistic anatomy
- `sidecar metadata`: not needed by default
- `copy-paste prompt`:
```text
Create a transparent-background runtime enemy asset for a techno-shinobi survival game: a drifter hostile, centered, right-facing, agile asymmetrical silhouette with scavenger-tech shards and flowing body mass, stylized and readable, medium detail, clean silhouette first, no environment, no text, no cinematic blur, no perspective distortion.
```

### `entity.hostile.needle.runtime`
- `surface`: runtime entity
- `role`: fast skirmish hostile
- `delivery format`: `png`
- `transparency`: required
- `recommended source canvas`: `1024x1024`
- `destination runtime path`: `src/assets/entities/runtime/entity.hostile.needle.runtime.<ext>`
- `composition guidance`: centered, narrow spear-like silhouette, right-facing, aggressive forward point
- `style guidance`: shard-tech assassin frame, fast and precise, minimal volume but high readability
- `avoid list`: no background trail, no realistic weapon prop separate from the body, no tiny filigree
- `sidecar metadata`: not needed by default
- `copy-paste prompt`:
```text
Create a transparent-background runtime enemy asset for a techno-shinobi survival game: a needle hostile, centered, right-facing, narrow spear-like silhouette with shard-tech fins and a sharp forward attack profile, highly readable at small scale, stylized, medium detail, no text, no background, no floor, no cinematic effects.
```

### `entity.hostile.rammer.runtime`
- `surface`: runtime entity
- `role`: telegraphed charge brute
- `delivery format`: `png`
- `transparency`: required
- `recommended source canvas`: `1024x1024`
- `destination runtime path`: `src/assets/entities/runtime/entity.hostile.rammer.runtime.<ext>`
- `composition guidance`: centered, wedge-forward silhouette, right-facing, clear front-loaded impact posture
- `style guidance`: shock ram frame, aggressive plated geometry, charge readability over ornament
- `avoid list`: no debris burst, no background, no rear-facing pose, no overbusy surface detailing
- `sidecar metadata`: not needed by default
- `copy-paste prompt`:
```text
Create a transparent-background runtime enemy asset for a techno-shinobi survival game: a rammer hostile, centered, right-facing, wedge-like armored silhouette with charge-brute posture and impact-focused front geometry, stylized, readable at small scale, medium detail, no environment, no text, no cinematic effects.
```

### `entity.hostile.sentinel.runtime`
- `surface`: runtime entity
- `role`: frontline pursuit hostile
- `delivery format`: `png`
- `transparency`: required
- `recommended source canvas`: `1024x1024`
- `destination runtime path`: `src/assets/entities/runtime/entity.hostile.sentinel.runtime.<ext>`
- `composition guidance`: centered, shield-like vertical silhouette, right-facing
- `style guidance`: disciplined pursuit shell, husk-like armor, stable combat readability
- `avoid list`: no banner shapes, no background glow cloud, no fine insignia
- `sidecar metadata`: not needed by default
- `copy-paste prompt`:
```text
Create a transparent-background runtime enemy asset for a techno-shinobi survival game: a sentinel hostile, centered, right-facing, shield-like armored silhouette with disciplined pursuit posture and husk-like frame design, stylized and clean, medium detail, readable at small size, no text, no background, no cinematic camera.
```

### `entity.hostile.watcher.runtime`
- `surface`: runtime entity
- `role`: survey and higher-order hostile silhouette
- `delivery format`: `png`
- `transparency`: required
- `recommended source canvas`: `1024x1024`
- `destination runtime path`: `src/assets/entities/runtime/entity.hostile.watcher.runtime.<ext>`
- `composition guidance`: centered, eye-like radial silhouette, readable outer fins, right-facing bias allowed
- `style guidance`: watchglass drone shell, surveillant and uncanny, controlled emissive core
- `avoid list`: no realistic eyeball rendering, no background lens flare, no horror gore
- `sidecar metadata`: not needed by default
- `copy-paste prompt`:
```text
Create a transparent-background runtime enemy asset for a techno-shinobi survival game: a watcher hostile, centered, survey-drone silhouette with eye-like radial framing and a controlled emissive core, stylized not realistic, readable at small scale, medium detail, no text, no background, no lens flare, no horror gore.
```

## Pickups

### `entity.pickup.cache.runtime`
- `surface`: runtime pickup
- `role`: cache reward pickup
- `delivery format`: `png`
- `transparency`: required
- `recommended source canvas`: `768x768`
- `destination runtime path`: `src/assets/entities/runtime/entity.pickup.cache.runtime.<ext>`
- `composition guidance`: centered icon-object, stable box silhouette, slightly top-down
- `style guidance`: shrine-tech cache case, compact and legible
- `avoid list`: no ground, no opened lid, no background particles
- `sidecar metadata`: not needed by default
- `copy-paste prompt`:
```text
Create a transparent-background runtime pickup asset for a techno-shinobi survival game: a compact cache pickup, centered, slightly top-down, shrine-tech storage case silhouette, stylized, readable at small scale, medium detail, no text, no background, no floor, no cinematic lighting.
```

### `entity.pickup.crystal.runtime`
- `surface`: runtime pickup
- `role`: xp crystal pickup
- `delivery format`: `png`
- `transparency`: required
- `recommended source canvas`: `768x768`
- `destination runtime path`: `src/assets/entities/runtime/entity.pickup.crystal.runtime.<ext>`
- `composition guidance`: centered, single crystal shard, vertical emphasis
- `style guidance`: energy crystal, sharp and clean, strong read
- `avoid list`: no background aura cloud, no realistic cave rock base
- `sidecar metadata`: not needed by default
- `copy-paste prompt`:
```text
Create a transparent-background runtime pickup asset for a techno-shinobi survival game: a single energy crystal pickup, centered, stylized shard silhouette with clean facets, readable at small scale, medium detail, no text, no background, no floor, no cinematic effects.
```

### `entity.pickup.gold.runtime`
- `surface`: runtime pickup
- `role`: gold reward pickup
- `delivery format`: `png`
- `transparency`: required
- `recommended source canvas`: `768x768`
- `destination runtime path`: `src/assets/entities/runtime/entity.pickup.gold.runtime.<ext>`
- `composition guidance`: centered, coin-like or token-like icon-object, simple outline
- `style guidance`: techno coin or bounty token, readable shape over micro-detail
- `avoid list`: no treasure pile, no hand, no background glimmer cloud
- `sidecar metadata`: not needed by default
- `copy-paste prompt`:
```text
Create a transparent-background runtime pickup asset for a techno-shinobi survival game: a gold pickup token, centered, compact coin-like silhouette with subtle techno engraving cues, stylized, readable at small scale, no text, no background, no pile of coins, no cinematic lighting.
```

### `entity.pickup.healing-kit.runtime`
- `surface`: runtime pickup
- `role`: healing recovery pickup
- `delivery format`: `png`
- `transparency`: required
- `recommended source canvas`: `768x768`
- `destination runtime path`: `src/assets/entities/runtime/entity.pickup.healing-kit.runtime.<ext>`
- `composition guidance`: centered, compact kit silhouette, medical symbol integrated into body
- `style guidance`: techno field med-kit, practical and readable
- `avoid list`: no realistic blood, no background particles, no open case
- `sidecar metadata`: not needed by default
- `copy-paste prompt`:
```text
Create a transparent-background runtime pickup asset for a techno-shinobi survival game: a compact healing kit pickup, centered, readable med-kit silhouette with subtle futuristic field-tech cues, stylized, medium detail, no gore, no text, no background, no floor.
```

### `entity.pickup.hourglass.runtime`
- `surface`: runtime pickup
- `role`: time-stop utility pickup
- `delivery format`: `png`
- `transparency`: required
- `recommended source canvas`: `768x768`
- `destination runtime path`: `src/assets/entities/runtime/entity.pickup.hourglass.runtime.<ext>`
- `composition guidance`: centered hourglass object, symmetrical silhouette, readable neck
- `style guidance`: shrine-tech hourglass, elegant but clear, time-control motif
- `avoid list`: no background sand storm, no ornate frame clutter
- `sidecar metadata`: not needed by default
- `copy-paste prompt`:
```text
Create a transparent-background runtime pickup asset for a techno-shinobi survival game: a time-stop hourglass pickup, centered, symmetrical and highly readable silhouette with shrine-tech styling, stylized, medium detail, no text, no background, no floor, no cinematic particle cloud.
```

### `entity.pickup.magnet.runtime`
- `surface`: runtime pickup
- `role`: crystal-attraction utility pickup
- `delivery format`: `png`
- `transparency`: required
- `recommended source canvas`: `768x768`
- `destination runtime path`: `src/assets/entities/runtime/entity.pickup.magnet.runtime.<ext>`
- `composition guidance`: centered magnet silhouette, compact and unmistakable
- `style guidance`: futuristic magnet relic, simple and readable
- `avoid list`: no floating crystal swarm baked into the asset, no background field lines
- `sidecar metadata`: not needed by default
- `copy-paste prompt`:
```text
Create a transparent-background runtime pickup asset for a techno-shinobi survival game: a magnet pickup, centered, compact and unmistakable magnet silhouette with subtle futuristic relic styling, stylized, readable at small scale, no text, no background, no floor, no particle swarm.
```

## Terrain

### `map.terrain.ashfield.runtime`
- `surface`: runtime terrain
- `role`: ashfield chunk backdrop
- `delivery format`: `webp`
- `transparency`: not required
- `recommended source canvas`: `512x512`
- `destination runtime path`: `src/assets/map/runtime/map.terrain.ashfield.runtime.<ext>`
- `composition guidance`: seamless or near-seamless panel, dark industrial ashfield patterning
- `style guidance`: muted charcoal field with warm ember accents, low-noise pattern
- `avoid list`: no horizon, no large props, no perspective floor lines, no text
- `sidecar metadata`: not needed by default
- `copy-paste prompt`:
```text
Create a square terrain texture panel for a techno-shinobi survival game: ashfield biome, 512 by 512, seamless or near seamless, dark industrial ash-charcoal surface with restrained warm ember accents, stylized graphic texture, low noise, no horizon, no props, no text, no perspective camera.
```

### `map.terrain.emberplain.runtime`
- `surface`: runtime terrain
- `role`: emberplain chunk backdrop
- `delivery format`: `webp`
- `transparency`: not required
- `recommended source canvas`: `512x512`
- `destination runtime path`: `src/assets/map/runtime/map.terrain.emberplain.runtime.<ext>`
- `composition guidance`: seamless or near-seamless panel, warm fractured field pattern
- `style guidance`: ember-lit plain with controlled lava-like warmth but not full molten chaos
- `avoid list`: no flames, no landmarks, no text, no perspective
- `sidecar metadata`: not needed by default
- `copy-paste prompt`:
```text
Create a square terrain texture panel for a techno-shinobi survival game: emberplain biome, 512 by 512, seamless or near seamless, warm fractured field surface with ember energy lines and dark volcanic undertones, stylized and readable, low clutter, no props, no horizon, no text, no perspective.
```

### `map.terrain.glowfen.runtime`
- `surface`: runtime terrain
- `role`: glowfen chunk backdrop
- `delivery format`: `webp`
- `transparency`: not required
- `recommended source canvas`: `512x512`
- `destination runtime path`: `src/assets/map/runtime/map.terrain.glowfen.runtime.<ext>`
- `composition guidance`: seamless or near-seamless panel, cool luminous wetland-tech pattern
- `style guidance`: cyan-biased glowfen surface, damp and electric, clean pattern bands
- `avoid list`: no reeds, no scenery illustration, no text, no high-frequency sparkle noise
- `sidecar metadata`: not needed by default
- `copy-paste prompt`:
```text
Create a square terrain texture panel for a techno-shinobi survival game: glowfen biome, 512 by 512, seamless or near seamless, cool luminous wetland-tech surface with cyan energy traces and dark teal base, stylized, controlled noise, no props, no horizon, no text, no perspective.
```

### `map.terrain.obsidian.runtime`
- `surface`: runtime terrain
- `role`: obsidian chunk backdrop
- `delivery format`: `webp`
- `transparency`: not required
- `recommended source canvas`: `512x512`
- `destination runtime path`: `src/assets/map/runtime/map.terrain.obsidian.runtime.<ext>`
- `composition guidance`: seamless or near-seamless panel, obsidian fracture pattern with violet accents
- `style guidance`: dark crystalline field, disciplined glow lines, no over-noise
- `avoid list`: no huge crystal monolith, no camera perspective, no text
- `sidecar metadata`: not needed by default
- `copy-paste prompt`:
```text
Create a square terrain texture panel for a techno-shinobi survival game: obsidian biome, 512 by 512, seamless or near seamless, dark crystalline surface with restrained violet fracture accents, stylized and readable, low clutter, no props, no horizon, no text, no perspective.
```

# Open questions
- Should the second wave revisit shell-facing illustration surfaces such as `bestiary` or `grimoire` after the gameplay readability pack is stronger?
- Which first-wave assets will eventually need animation sidecars rather than static runtime images?
- Should future prompt packs include model-specific negative prompt variants, or stay model-agnostic by default?

# References
- `req_093_define_a_first_graphical_asset_integration_strategy_for_runtime_and_shell_surfaces`
- `item_342_define_a_first_graphical_asset_integration_strategy_for_runtime_and_shell_surfaces`
- `task_065_orchestrate_the_first_graphical_asset_integration_strategy_and_delivery_plan`
- `req_094_define_asset_production_specifications_and_prompt_packs_for_the_first_graphical_wave`
- `item_343_define_asset_production_specifications_and_prompt_packs_for_the_first_graphical_wave`
- `task_066_orchestrate_first_wave_asset_production_specifications_and_prompt_packs`
- `prod_017_graphical_asset_direction_for_runtime_readability_and_shell_identity`
- `adr_052_adopt_a_content_driven_graphical_asset_pipeline_for_runtime_and_shell_surfaces`
