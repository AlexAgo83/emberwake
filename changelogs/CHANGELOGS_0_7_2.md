# Emberwake 0.7.2

## Highlights

- Tightened the `New game` shell flow on mobile by keeping character naming and world selection inside one shared scroll path.
- Fixed mobile `Changelogs` overflow so release notes no longer force horizontal scrolling on smaller screens.
- Reduced the mission guidance indicator footprint and softened its backing treatment for less HUD intrusion.
- Paused the runtime while the in-run abandon confirmation is open so the simulation no longer continues behind the dialog.

## Mobile shell usability

- Removed the nested world-list scroll behavior from `New game`, letting the scene body own scrolling on mobile layouts.
- Added stronger wrapping and horizontal overflow safeguards to the changelog reader for markdown text, links, and inline code.
- Slightly compacted world-card and changelog spacing on narrow viewports to preserve readability without side-scrolling.

## Runtime pause and guidance polish

- Cut the mission guidance arrow and target chip to roughly half their previous size.
- Dropped the guidance backing surfaces to `50%` opacity behind both the arrow glyph and the target label.
- Treated the abandon confirmation the same way as pause/settings/level-up surfaces by suspending runtime simulation while it is visible.

## Technical Notes

- `0.7.2` remains package-version-driven through `package.json`, with `package-lock.json` kept in sync.
- The release notes in this file cover the delta since `v0.7.1`.

## Validation

- `npm run test -- src/app/AppShell.test.tsx src/app/components/AppMetaScenePanel.test.tsx`
- `npm run typecheck`
- `npm run release:changelog:validate`
