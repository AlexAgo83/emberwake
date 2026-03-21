## adr_027_expose_gameplay_outcomes_as_a_game_owned_shell_consumable_contract - Expose gameplay outcomes as a game-owned shell-consumable contract
> Date: 2026-03-21
> Status: Accepted
> Drivers: Let gameplay signal defeat, victory, restart-needed, and recovery without leaking shell scene logic into runtime internals; keep shell-owned meta scenes compatible with the `GameModule` presentation seam.
> Related request: `req_023_define_the_next_runtime_shell_render_and_system_boundary_architecture_wave`
> Related backlog: `item_093_define_gameplay_to_shell_outcome_contracts_for_defeat_victory_restart_and_runtime_recovery`
> Related task: `task_031_orchestrate_the_remaining_open_architecture_and_runtime_input_reliability_wave`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
Gameplay outcomes should remain game-owned but be published through a shell-consumable presentation contract so the app layer can react with shell-owned scenes without reading arbitrary gameplay internals.

# Context
The shell already owns pause, settings, boot, and failure surfaces. What was missing was a clean seam for gameplay meaning:
- victory
- defeat
- restart-needed
- recoverable interruption

Without such a seam, the shell would either inspect internal gameplay state or gameplay modules would start deciding shell scene transitions directly.

# Decision
- Add a game-owned `GameplayShellOutcome` contract and idle/default constructor in the gameplay systems layer.
- Publish the outcome through `EnginePresentationModel.overlays.runtimeOutcome`, keeping the runtime-to-shell seam inside the existing presentation contract.
- Extend app-scene derivation so renderer failure still wins first, but gameplay outcomes can map into shell-owned `defeat`, `pause`, or `victory` scenes when present.
- Keep the live runtime behavior non-disruptive by default: the contract exists now, but the current slice still emits the idle outcome unless future gameplay systems choose otherwise.

# Alternatives considered
- Let the shell infer outcomes from diagnostics or raw gameplay state. Rejected because it couples app flow to game internals.
- Let gameplay code directly control app scenes. Rejected because it breaks shell ownership.
- Add a broad event bus first. Rejected because the outcome seam can be narrower and cheaper.

# Consequences
- The shell can now consume gameplay meaning through one explicit contract.
- Future combat or progression work can emit outcomes without reopening shell ownership.
- Current gameplay remains stable because the default outcome is intentionally idle.

# Migration and rollout
- Add the outcome contract and export it through the public `@game` entrypoint.
- Publish the current outcome through the game module presentation overlay.
- Extend shell scene derivation and meta-scene UI to understand `defeat` and `victory`.
- Keep future gameplay feature work responsible for emitting non-idle outcomes only when those features are actually ready.

# References
- `req_023_define_the_next_runtime_shell_render_and_system_boundary_architecture_wave`
- `item_093_define_gameplay_to_shell_outcome_contracts_for_defeat_victory_restart_and_runtime_recovery`
- `task_031_orchestrate_the_remaining_open_architecture_and_runtime_input_reliability_wave`
- `adr_022_keep_product_meta_flow_shell_owned_while_runtime_state_remains_game_preserved`

# Follow-up work
- Wire non-idle outcomes into future combat, failure, or progression systems when those mechanics exist for real.
- Add shell-owned restart or recovery affordances if gameplay begins emitting restart-needed outcomes live.

