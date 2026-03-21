## adr_017_lazy_load_pixi_runtime_behind_a_shell_owned_boot_boundary - Lazy load Pixi runtime behind a shell owned boot boundary
> Date: 2026-03-21
> Status: Accepted
> Drivers: Reduce startup coupling between the shell and Pixi runtime; turn the large Pixi entry cost into an explicit loading boundary; protect mobile startup posture without redesigning the renderer stack.
> Related request: `req_020_define_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement`
> Related backlog: `item_083_define_runtime_loading_and_performance_architecture_for_pixi_mobile_startup_and_chunk_strategy`
> Related task: `task_028_orchestrate_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
The shell should boot independently from the Pixi runtime and lazy load the interactive runtime surface behind an explicit boot boundary. This does not solve every performance problem, but it turns Pixi startup into a deliberate architectural edge instead of a static upfront assumption.

# Context
The project already isolated `vendor-pixi`, but bundle warnings showed that the runtime was still treated as an immediate startup dependency. That keeps shell startup and Pixi startup coupled even though they have different responsibilities.

The shell can render meaningful UI before Pixi is ready:
- install and fullscreen posture
- initial shell layout
- diagnostics host surfaces
- runtime boot or failure messaging

That makes a lazy boundary the highest-leverage architectural move before deeper rendering or asset optimizations.

# Decision
- Lazy load the runtime-rendering surface instead of importing Pixi runtime modules eagerly from the shell.
- Put the loading boundary under shell ownership so the shell can communicate `loading`, `booting`, and `failure` states without owning gameplay logic.
- Treat this as the default runtime entry posture for the static frontend and PWA shell.
- Keep the first loading boundary narrow: shell loads, then runtime surface loads, then renderer readiness confirms interactivity.
- Keep mobile-sensitive startup expectations explicit through this boundary rather than relying only on warning-threshold changes.

# Alternatives considered
- Only raise the build warning threshold. Rejected because it hides startup cost without changing the architecture.
- Split Pixi into multiple chunks without changing the entry boundary. Rejected because chunk count alone does not clarify shell-versus-runtime startup ownership.
- Keep eager loading until a later optimization wave. Rejected because the boundary is already clear enough to improve now.

# Consequences
- The shell can become interactive before Pixi is fully ready.
- Runtime-loading posture is now visible in code and testable through a boundary component.
- Startup work remains compatible with the existing static build and PWA posture.
- The bundle may still need further optimization later, but the first architectural split is in place.

# Migration and rollout
- Introduce a shell-owned runtime-scene boundary using `React.lazy` and `Suspense`.
- Keep the renderer readiness signal separate from chunk-loading completion so `boot` remains explicit.
- Preserve browser smoke and CI expectations while moving the load edge.
- Revisit deeper mobile budgets, asset prefetching, or chunk heuristics in a later performance-focused wave.

# References
- `req_020_define_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement`
- `item_083_define_runtime_loading_and_performance_architecture_for_pixi_mobile_startup_and_chunk_strategy`
- `task_028_orchestrate_the_next_architecture_wave_for_app_state_loading_content_rendering_and_boundary_enforcement`
- `adr_002_separate_react_shell_from_pixi_runtime_ownership`

# Follow-up work
- Define explicit mobile startup budgets once product surfaces and runtime assets become denser.
- Revisit asset preloading and chunk boundaries if runtime activation still feels too heavy after gameplay growth.
