## adr_010_treat_render_build_variables_as_public_frontend_configuration - Treat Render build variables as public frontend configuration
> Date: 2026-03-17
> Status: Accepted
> Drivers: Keep Vite env usage safe; align local and Render builds; avoid pretending public frontend variables are secrets.
> Related request: `req_003_create_render_static_free_plan_blueprint`, `req_004_prepare_github_actions_ci_pipeline`, `req_015_define_release_workflow_and_deployment_operations`
> Related backlog: (none yet)
> Related task: (none yet)
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
Frontend build variables exposed through Vite are public configuration. Render is the source of truth for production build-time values. Local `.env.production` is a non-versioned mirror for reproduction only.

```mermaid
flowchart TD
    A[Static frontend needs environment config] --> B[Vite exposes build vars to the client]
    B --> C[Treat VITE vars as public]
    C --> D[Use Render as production source of truth]
    D --> E[Mirror locally without committing secrets]
```

# Context
The repository already uses `.env` files and has a Render static-site request. The user explicitly clarified that `.env.production` should mirror Render values locally without being versioned. That is a useful platform rule and should be fixed as an ADR because env misuse is a common source of confusion.

# Decision
- Any `VITE_*` variable consumed by the frontend is treated as public configuration, not as a secret.
- Render-managed build-time variables are the production source of truth.
- `.env.example` documents expected frontend variables and is versioned.
- `.env.local` and `.env.production` are non-versioned local files.
- `.env.production` is a local reproduction mirror, not an authoritative deployment source.

# Alternatives considered
- Treat frontend env vars as if they were secrets. This was rejected because Vite embeds them into the client build.
- Commit `.env.production` as deployment configuration. This was rejected because it weakens safety and clarity.

# Consequences
- Delivery documentation stays clearer and safer.
- Team members should stop expecting frontend env vars to provide secret storage.

# Migration and rollout
- Apply this rule immediately in env docs, CI, and Render setup.
- Reject new delivery patterns that imply secret frontend build vars.

# References
- `req_003_create_render_static_free_plan_blueprint`
- `req_004_prepare_github_actions_ci_pipeline`
- `.env.example`

# Follow-up work
- Reflect this contract in the eventual `render.yaml` and CI documentation.
