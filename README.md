# Emberwake

Emberwake is a TypeScript + React top-down survival action prototype built around a shell-owned game flow, a PixiJS runtime, and a deterministic chunked world.

[![CI](https://github.com/AlexAgo83/emberwake/actions/workflows/ci.yml/badge.svg)](https://github.com/AlexAgo83/emberwake/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/AlexAgo83/emberwake)](LICENSE)
[![Live Demo](https://img.shields.io/badge/live%20demo-Render-46E3B7?logo=render&logoColor=white)](https://emberwake.onrender.com/)
![Version](https://img.shields.io/badge/version-v0.4.0-4C8BF5)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react&logoColor=black)

## Overview

Emberwake currently includes:

- A shell-owned `Main menu`, `New game`, `Load game`, `Settings`, and `Game over` flow.
- A deterministic infinite world rendered in PixiJS with chunk-based generation.
- Pseudo-physics foundations with blocking obstacles, slow surfaces, and slippery surfaces.
- A first hostile combat loop with pursuit, contact damage, automatic player cone attacks, health, and defeat recap.
- Nearby pickups with healing kits and gold collection.
- Desktop control remapping, mobile virtual-stick control, and shell/runtime feedback surfaces.
- Local-first single-slot save/load and shell preference persistence.
- A planning and delivery workflow tracked in `logics/`.

```mermaid
flowchart TD
    Shell[Shell-owned flow] --> Runtime[Pixi runtime]
    Runtime --> World[Chunked deterministic world]
    Runtime --> Combat[Hostiles and combat]
    Runtime --> Loot[Pickups and gold]
    Shell --> Persistence[Local save/load]
    Shell --> Planning[Logics workflow]
```

## Current Status

Current release target:

- `v0.4.0`

What `main` reflects today:

- The project has moved beyond a navigation-only slice into a first playable survival/combat loop.
- Runtime ownership is split between a React shell, reusable engine packages, a Pixi adapter, and Emberwake-specific gameplay modules.
- The latest wave rebuilt the shell-owned menus under a `Techno-shinobi` direction, tightened runtime shell defaults, and brought the HUD and changelog surfaces back into a cleaner player-facing posture.
- The repo now also includes a scripted long-session profiling harness plus a first targeted runtime render hot-path optimization pass that reduced memory pressure under realistic traversal scenarios while keeping the profiling workflow reproducible under `output/playwright/long-session/`.

```mermaid
flowchart LR
    Release[v0.4.0 target] --> Main[main branch]
    Main --> Playable[Playable survival loop]
    Main --> Modular[Modular runtime ownership]
    Main --> Next[Perf, generation, settings, structure]
```

## Current Gameplay Slice

- Start or load a run from a shell-owned main menu.
- Name the player character before entering runtime.
- Open the `Command deck` during live runtime to pause safely without dropping the current run.
- Traverse an infinite world with deterministic terrain, obstacles, and movement modifiers.
- Fight hostile entities that spawn around the player, pursue, and deal contact damage.
- Trigger the player attack automatically with a forward cone.
- Collect healing kits and gold.
- Lose the run into a `Game over` recap, then return to the main menu.

## Tuning Contracts

- `games/emberwake/src/config/gameplayTuning.json` is the editable balance surface for hostile, player, pickup, progression, and hostile-spawn values.
- `games/emberwake/src/config/systemTuning.json` is the editable technical tuning surface for input feel, viewport sizing, runtime presentation, pathfinding, and movement-surface response.
- Both JSON files are consumed through validated TypeScript adapters before runtime systems read them; new retunable numbers should default to one of these contracts instead of reappearing as local literals.

```mermaid
flowchart LR
    GameplayJSON[gameplayTuning.json] --> GameplayTS[validated adapter]
    SystemJSON[systemTuning.json] --> SystemTS[validated adapter]
    GameplayTS --> Runtime[Runtime systems]
    SystemTS --> Runtime
```

```mermaid
flowchart LR
    Menu[Main menu] --> NewGame[New game or load]
    NewGame --> Runtime[Explore and survive]
    Runtime --> Combat[Auto cone attack vs hostiles]
    Combat --> Loot[Pickups]
    Runtime --> GameOver[Game over recap]
    GameOver --> Menu
```

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Rendering:** PixiJS, `@pixi/react`
- **PWA:** `vite-plugin-pwa`
- **Testing:** Vitest, Testing Library, Playwright
- **Quality:** ESLint, TypeScript typecheck, runtime budget checks, browser smoke, long-session profiling runner
- **Hosting:** Render static hosting

```mermaid
flowchart TD
    React[React + TypeScript + Vite] --> Shell[Shell UI]
    Pixi[PixiJS + @pixi/react] --> Runtime[Runtime render]
    PWA[vite-plugin-pwa] --> Delivery[Static delivery]
    Tests[Vitest + Playwright] --> Quality[Quality gates]
    Render[Render] --> Hosting[Live demo]
```

## Repository Topology

- `apps/emberwake-web`: web entrypoint and boot wiring
- `packages/engine-core`: reusable runtime contracts, math, camera, world, and simulation primitives
- `packages/engine-pixi`: reusable Pixi runtime composition
- `games/emberwake`: Emberwake gameplay rules, world content, combat, generation, and runtime adapters
- `src`: shell, frontend services, shared config, assets, and app-facing adapters
- `logics`: requests, backlog items, tasks, product briefs, ADRs, and specs
- `scripts`: performance, release, and test helpers
- `changelogs`: curated release notes

```mermaid
flowchart TD
    Repo[emberwake]
    Repo --> Apps[apps/emberwake-web]
    Repo --> Engine[packages/engine-core]
    Repo --> Pixi[packages/engine-pixi]
    Repo --> Game[games/emberwake]
    Repo --> Shell[src]
    Repo --> Logics[logics]
    Repo --> Scripts[scripts]
    Repo --> Changelogs[changelogs]
```

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/AlexAgo83/emberwake.git
cd emberwake
```

2. Initialize the `logics` skill submodule:

```bash
git submodule update --init --recursive
```

3. Install dependencies:

```bash
npm ci
```

4. Start the app locally:

```bash
npm run dev
```

```mermaid
flowchart LR
    Clone[Clone repo] --> Submodule[Init submodules]
    Submodule --> Install[npm ci]
    Install --> Dev[npm run dev]
```

## Useful Commands

```bash
npm run dev
npm run build
npm run test
npm run ci
npm run ci:full
npm run test:browser:smoke
npm run test:browser:profile:long -- --scenario traversal-baseline --duration 120s
npm run performance:validate
npm run logics:lint
npm run release:ready:advisory
```

## Long-Session Memory Profiling

The repeatable memory-pressure scenario we use most often right now is `left-right-pendulum`.
It alternates the player `5s` right / `5s` left in a loop, runs under Playwright, auto-picks level-up choices, forces runtime simulation to `4x`, and writes JSON plus heap snapshots under `output/playwright/long-session/`.

Quick rerun:

```bash
npm run test:browser:profile:pendulum
```

Generic runner:

```bash
npm run test:browser:profile:long -- --scenario left-right-pendulum --duration 120s --loop
```

Artifacts to inspect after a run:

- `output/playwright/long-session/latest.json`
- `output/playwright/long-session/*-heap-start.heapsnapshot`
- `output/playwright/long-session/*-heap-mid.heapsnapshot`
- `output/playwright/long-session/*-heap-end.heapsnapshot`

## Controls

- **Mobile:** virtual stick for direct movement.
- **Desktop:** remappable movement and rotation controls from `Settings > Desktop controls`.
- **View-relative movement:** desktop movement always follows the player view, even when the camera is rotated.
- **Shell shortcuts:** `Escape` is used for shell navigation and menu/back behavior depending on the active surface.

```mermaid
flowchart LR
    Mobile[Virtual stick] --> Move[Direct movement]
    Desktop[Desktop controls] --> Rebind[Remappable bindings]
    Escape[Escape] --> ShellNav[Menu or back navigation]
```

## Persistence

Current persistence is intentionally local-first:

- Single-slot save/load for the active runtime session
- Shell preferences persisted locally
- Desktop control bindings persisted locally
- Runtime world reconstructed from deterministic seed and state rather than large opaque world snapshots

There is currently no backend runtime or cloud-save stack in Emberwake.

```mermaid
flowchart TD
    Local[Local storage]
    Local --> Save[Single-slot save]
    Local --> Prefs[Shell preferences]
    Local --> Bindings[Desktop bindings]
    Save --> Rebuild[World rebuilt from seed and state]
```

## Delivery Workflow

The repository uses a staged planning workflow:

- `logics/request`: problem framing
- `logics/backlog`: scoped implementation slices
- `logics/tasks`: orchestration and delivery execution
- `logics/architecture`: ADRs
- `logics/product`: product framing

Useful entry points:

- [`logics/instructions.md`](logics/instructions.md)
- [`logics/product/prod_000_initial_single_entity_navigation_loop.md`](logics/product/prod_000_initial_single_entity_navigation_loop.md)
- [`logics/architecture/adr_014_adopt_a_modular_app_engine_game_topology_with_one_way_dependencies.md`](logics/architecture/adr_014_adopt_a_modular_app_engine_game_topology_with_one_way_dependencies.md)

```mermaid
flowchart LR
    Request[request] --> Backlog[backlog]
    Backlog --> Task[tasks]
    Task --> Delivery[implementation]
    Request --> Product[product]
    Backlog --> ADR[architecture]
```

## Releases

- `package.json` is the source of truth for the app version.
- Each release must have a matching curated changelog in `changelogs/`.
- Release tags use `vX.Y.Z`.
- The current release changelog is [`changelogs/CHANGELOGS_0_4_0.md`](changelogs/CHANGELOGS_0_4_0.md).

```mermaid
flowchart LR
    Package[package.json version] --> Changelog[Matching changelog]
    Changelog --> Gates[Release gates]
    Gates --> Tag[Tag vX.Y.Z]
```

## Requirements

- Node.js `>= 20`
- npm

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).


## License

MIT, see [`LICENSE`](LICENSE).
