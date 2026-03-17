# Contributing

This repository is developed with an explicit `logics/` workflow and a strict
task-by-task delivery discipline. Contributions should follow that operating
model rather than bypass it.

## Scope

Use this file as the default contribution contract for:
- code changes
- documentation changes
- backlog or task updates
- release preparation changes

## Ground Rules

- Keep changes aligned with the existing `logics/request -> logics/backlog -> logics/tasks` flow.
- Do not bypass existing ADRs, product briefs, or backlog decisions silently.
- Prefer small, scoped changes over large unstructured rewrites.
- Keep source files below the repository limit fixed by ADR.
- Isolate React side effects into dedicated hooks or modules instead of growing component files.
- Treat `VITE_*` variables as public frontend configuration, never as secrets.
- Keep the `release` branch as the deployable branch. Do not treat `main` as the production branch.

## Expected Workflow

1. Start from an existing backlog item or task when possible.
2. If the change is new in scope, add or update the relevant request/backlog/task docs first.
3. Implement the smallest coherent slice.
4. Run the appropriate validation commands.
5. Commit once per completed task or coherent delivery slice.

## Validation

Run these before opening or finalizing a contribution:

```bash
npm run ci
```

When the change touches browser behavior or release posture, also run:

```bash
npm run test:browser:smoke
npm run release:changelog:validate
```

When the change touches `logics/` docs, also run:

```bash
python3 logics/skills/logics-doc-linter/scripts/logics_lint.py
```

## Documentation Expectations

Update documentation when a contribution changes:
- runtime behavior
- architecture boundaries
- release workflow
- assets or data contracts
- product-facing control or feedback

The main docs likely to need updates are:
- `README.md`
- relevant files in `logics/request`
- relevant files in `logics/backlog`
- relevant files in `logics/tasks`
- ADRs or product briefs when the change is structural

## Commits

Commit messages should stay explicit and task-oriented.

Preferred style:
- `Implement ...`
- `Define ...`
- `Orchestrate ...`
- `Add ...`

Keep one commit per completed task or equivalent scoped slice whenever practical.

## Pull Requests

If this repository is used with PRs, include:
- the problem being solved
- the task or backlog item being completed
- validation performed
- any remaining known risks or follow-up items

## Release Notes

If a change is intended for a release:
- keep `package.json` as the version source of truth
- ensure the versioned changelog file exists in `changelogs/`
- do not consider the release complete without updated curated changelog content

## License

By contributing to this repository, you agree that your contribution may be
distributed as part of this project under the terms described in
[LICENSE](/Users/alexandreagostini/Documents/emberwake/LICENSE).
