# Emberwake 0.2.2

## Highlights

- Reworked the shell command deck into true submenu navigation so `Session` stays the root screen while `View` and `Tools` open dedicated menu states instead of stacking every control on one panel.
- Tightened the command deck chrome by removing the redundant runtime context panel and keeping the entry focused on the current action plus the session controls.
- Switched the default runtime camera bootstrap back to `follow-entity` so a fresh session opens on the player-following view instead of free camera mode.

## Technical Notes

- Browser smoke now enters the `Tools` submenu before toggling the inspecteur, keeping the smoke path aligned with the new shell navigation contract.
- The command deck styling remains within the shell startup performance budget after the submenu refactor and header removal.
- `0.2.2` is prepared from `main` with `npm run release:changelog:validate` and `npm run release:ready:advisory` before promotion to `release`.
