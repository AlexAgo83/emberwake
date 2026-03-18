# Changelogs

This directory stores curated release notes for Emberwake.

Rules:
- `package.json` is the source of truth for the current application version.
- Each release requires a matching file named `CHANGELOGS_X_Y_Z.md`.
- The filename must match the semantic version from `package.json`, replacing dots with underscores.
- A release is blocked if the expected changelog file is missing or empty.
- Deployable releases are promoted through the `release` branch and then tagged as `vX.Y.Z`.

Current helpers:
- `npm run release:changelog:resolve`
- `npm run release:changelog:validate`

Example:
- version `0.1.0` -> `changelogs/CHANGELOGS_0_1_0.md`
- version `0.1.1` -> `changelogs/CHANGELOGS_0_1_1.md`
- version `0.1.2` -> `changelogs/CHANGELOGS_0_1_2.md`
