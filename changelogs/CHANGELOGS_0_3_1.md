# Emberwake 0.3.1

## Highlights

- Polished the shell-owned front door with a stronger `Main menu` presentation, an in-app `Changelogs` reader, and a footer that exposes the current app version and links back to the project repository.
- Extended the first progression loop so defeated hostiles now drop crystals, players gain XP and levels from crystal pickups, and runtime feedback surfaces expose level and XP progress directly.
- Improved runtime readability with player overhead identity (`name + level`), better `New game` CTA hierarchy, and a more compact `Settings` surface that fits more reliably on constrained viewports.
- Refined mobile feel by fading the virtual-stick base progressively after interaction instead of leaving a persistent heavy joystick background.

## Technical Notes

- The shell UI now includes a local curated release-history scene sourced from the repository changelog corpus.
- `Main menu` action ordering is tightened around the current save-first posture, with `Load game` surfaced before `Start new game`.
- Runtime progression now layers on top of the existing crystal pickup flow without reopening the underlying deterministic traversal and combat foundations.
- This patch release also includes main-menu/changelog surface polish such as a scrollable changelog reader and calmer background treatment after the initial `0.3.0` wave.
- `0.3.1` is prepared from `main` with `npm run release:changelog:validate` and `npm run release:ready:advisory` before promotion to `release`.
