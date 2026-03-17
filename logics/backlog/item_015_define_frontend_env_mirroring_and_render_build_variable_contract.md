## item_015_define_frontend_env_mirroring_and_render_build_variable_contract - Define frontend env mirroring and Render build variable contract
> From version: 0.1.1
> Status: Done
> Understanding: 94%
> Confidence: 93%
> Progress: 100%
> Complexity: Medium
> Theme: Delivery
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Frontend delivery needs one clear rule for Vite environment variables across local and Render builds.
- This slice defines how `.env.example`, `.env.local`, `.env.production`, and Render variables relate without implying frontend secrets.

# Scope
- In: Public `VITE_*` policy, local mirror files, and Render build-time source-of-truth rules.
- Out: Server-side secret management, runtime secret injection, or backend environment strategy.

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: The request produces a Render Blueprint for a static site and does not assume a backend runtime, database, worker, or other non-static service.
- AC2: The deployment model is expressed through a Git-backed `render.yaml` file rather than an ad hoc dashboard-only setup.
- AC3: The Blueprint targets the Render free plan static-site path and avoids assumptions that require paid-tier infrastructure.
- AC4: The Blueprint remains compatible with the frontend-only stack defined in `req_000_bootstrap_fullscreen_2d_react_pwa_shell`.
- AC5: The Blueprint captures the minimum required static deployment settings, including build command and publish directory.
- AC6: The request defines a Vite-compatible frontend env strategy in which public client variables use the `VITE_` prefix and are treated as build-time public values.
- AC7: The request treats `.env.example` as the versioned documentation source for expected frontend variables.
- AC8: The request treats `.env.local` and `.env.production` as non-versioned files, with `.env.production` explicitly positioned as a local mirror of Render build-time values rather than the source of truth.
- AC9: The request treats the initial deployment path as a `release`-driven free-plan static-site deployment without requiring preview or staging environments.
- AC10: The resulting deployment blueprint is suitable for later implementation without forcing the app into a backend or multi-service topology.

# AC Traceability
- AC1 -> Scope: The delivery contract remains static-site only. Proof: `render.yaml`.
- AC2 -> Scope: Delivery is expressed through Git-backed configuration. Proof: `render.yaml`.
- AC3 -> Scope: The blueprint remains free-plan compatible. Proof: `render.yaml`, `README.md`.
- AC4 -> Scope: The contract stays aligned with the frontend-only stack. Proof: `render.yaml`, `README.md`.
- AC5 -> Scope: Build and publish settings are explicit. Proof: `render.yaml`.
- AC6 -> Scope: Public `VITE_*` behavior is explicit. Proof: `.env.example`, `README.md`, `adr_010_treat_render_build_variables_as_public_frontend_configuration.md`.
- AC7 -> Scope: `.env.example` is the versioned source of documentation. Proof: `.env.example`.
- AC8 -> Scope: `.env.local` and `.env.production` remain non-versioned local mirrors. Proof: `.gitignore`, `README.md`.
- AC9 -> Scope: Delivery is explicitly `release`-driven. Proof: `render.yaml`, `.github/workflows/ci.yml`, `README.md`.
- AC10 -> Scope: The blueprint stays frontend-only and reusable. Proof: `render.yaml`.

# Decision framing
- Product framing: Required
- Product signals: pricing and packaging, experience scope
- Product follow-up: Create or link a product brief before implementation moves deeper into delivery.
- Architecture framing: Required
- Architecture signals: data model and persistence, contracts and integration, security and identity, delivery and operations
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): `adr_010_treat_render_build_variables_as_public_frontend_configuration`
- Request: `req_003_create_render_static_free_plan_blueprint`
- Primary task(s): `task_015_orchestrate_static_delivery_and_ci_hardening`

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from request `req_003_create_render_static_free_plan_blueprint`.
- Source file: `logics/request/req_003_create_render_static_free_plan_blueprint.md`.
- Request context seeded into this backlog item from `logics/request/req_003_create_render_static_free_plan_blueprint.md`.
- Completed in `task_015_orchestrate_static_delivery_and_ci_hardening`.
