# Emberwake 0.5.1

## Highlights

- Fixed the codex archive layout so `Grimoire` and related archive panels render more reliably without broken section wrapping.
- Hardened floating damage-number cleanup so stale or invalid runtime presentation state is pruned instead of lingering across normalization paths.
- Shipped the viewport-safe shell scroll-ownership follow-up and cleaned the Logics corpus so release workflow checks now pass cleanly again.

## Runtime and shell fixes

- Tightened archive-panel composition in the shell so codex sections stay readable and structurally consistent.
- Corrected floating damage-number pruning in both the shared runtime and the embedded `games/emberwake` runtime copy, including protection against invalid values and negative ages.
- Kept entity/runtime rendering aligned with the cleanup by adjusting the related runtime tests and presentation edges touched by the stale-damage fix.

## Shell surface polish

- Landed the viewport-safe scroll-ownership wave for shell surfaces so scene panels use a clearer shared sizing contract and a more explicit single-scroll-owner posture.
- Improved shell action reachability on content-heavy archive, settings, changelog, and outcome scenes by keeping bounded scene chrome outside the main scrolling body.
- Removed tracking of generated hybrid-assist/runtime-index artifacts and kept those files local-only through `.gitignore`.

## Workflow and release hygiene

- Consolidated Logics companion-doc structure, request-to-item/task AC traceability, and closure hygiene so the workflow audit is green again.
- Refreshed product and architecture companion docs with missing overview diagrams and linked refs where workflow rules required them.
- Closed the dedicated Logics hygiene wave so the repository is release-ready from the workflow perspective instead of carrying residual documentation debt.

## Validation

- `python3 logics/skills/logics.py audit`
- `npm run logics:lint`
- `npm run release:changelog:validate`
- `npm run release:ready:advisory`
