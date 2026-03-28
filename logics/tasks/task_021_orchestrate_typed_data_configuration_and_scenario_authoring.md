## task_021_orchestrate_typed_data_configuration_and_scenario_authoring - Orchestrate typed data, configuration, and scenario authoring
> From version: 0.5.0
> Status: Done
> Understanding: 94%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Data
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog items `item_039_define_domain_owned_typed_typescript_configuration_structure`, `item_040_define_official_debug_scenario_data_model`, `item_041_define_validation_typing_and_runtime_configuration_boundaries`, and `item_042_define_data_reference_contracts_across_world_entities_and_assets`.
- Related request(s): `req_010_define_game_data_and_configuration_model`.
- The repo already leans on typed TypeScript and debug scenarios conceptually, but the authoring model is not yet applied consistently to world, entities, and assets.
- This orchestration task groups the data-side contracts that keep content from turning into scattered literals.

# Dependencies
- Blocking: `task_016_orchestrate_asset_pipeline_and_runtime_packaging_foundation`, `task_019_orchestrate_deterministic_world_generation_foundation`.
- Unblocks: test fixtures, debug scenarios, and later content authoring beyond code-only prototypes.

```mermaid
%% logics-signature: task|orchestrate-typed-data-configuration-and|item-039-define-domain-owned-typed-types|1-define-domain-owned-typed-configuratio|npm-run-lint
flowchart LR
    Structure[item_039 typed config structure] --> Data[Typed authoring model]
    Scenarios[item_040 debug scenarios] --> Data
    Validation[item_041 validation boundaries] --> Data
    References[item_042 cross-domain references] --> Data
```

# Plan
- [x] 1. Define domain-owned typed configuration structure for world, entity, and asset-adjacent data.
- [x] 2. Add official debug scenario data and clear validation/runtime boundaries.
- [x] 3. Make cross-domain references explicit across world, entities, and assets.
- [x] 4. Validate the authoring model and update linked Logics docs.
- [ ] FINAL: Create a dedicated git commit for this orchestration scope.

# AC Traceability
- `item_039` -> Domain-owned typed configuration structure is explicit. Proof: `src/shared/config/dataAuthoringContract.ts`, `src/game/world/data/worldData.ts`, `src/game/entities/data/entityData.ts`.
- `item_040` -> Official debug scenario data model exists. Proof: `src/game/debug/data/officialDebugScenario.ts`, `src/game/debug/data/officialDebugScenario.test.ts`.
- `item_041` -> Validation, typing, and runtime boundaries are explicit. Proof: `src/shared/config/dataAuthoringContract.ts`, `src/game/debug/data/officialDebugScenario.ts`.
- `item_042` -> Data references across world, entities, and assets are explicit. Proof: `src/assets/assetCatalog.ts`, `src/game/entities/data/entityData.ts`, `src/game/world/data/worldData.ts`, `src/game/debug/data/officialDebugScenario.ts`.

# Request AC Traceability
- req_010_define_game_data_and_configuration_model coverage: AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8. Proof: `task_021_orchestrate_typed_data_configuration_and_scenario_authoring` closes the linked request chain for `req_010_define_game_data_and_configuration_model` and carries the delivery evidence for `item_042_define_data_reference_contracts_across_world_entities_and_assets`.


# Decision framing
- Product framing: Consider
- Product signals: engagement loop
- Product follow-up: Keep the data model simple enough to support fast iteration and testing.
- Architecture framing: Required
- Architecture signals: data model and persistence, contracts and integration
- Architecture follow-up: Keep alignment with `adr_011`.

# Links
- Product brief(s): `prod_000_initial_single_entity_navigation_loop`
- Architecture decision(s): `adr_011_use_typed_typescript_as_the_initial_data_and_config_authoring_model`
- Backlog item(s): `item_039_define_domain_owned_typed_typescript_configuration_structure`, `item_040_define_official_debug_scenario_data_model`, `item_041_define_validation_typing_and_runtime_configuration_boundaries`, `item_042_define_data_reference_contracts_across_world_entities_and_assets`
- Request(s): `req_010_define_game_data_and_configuration_model`

# Validation
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Done (DoD)
- [x] Covered backlog items are implemented or explicitly split further with updated traceability.
- [x] Typed configuration and debug-scenario authoring are coherent across domains.
- [x] Linked backlog/task docs are updated with proofs and status.
- [x] A dedicated git commit has been created for the completed orchestration scope.
- [x] Status is `Done` and progress is `100%`.

# Report
- Added typed authoring modules for world terrain, entity visuals/archetypes, asset ids, and authoring boundaries.
- Introduced one canonical debug scenario shared by runtime defaults, debug entities, and automated tests.
- Replaced scattered literals in simulation/runtime defaults with references that resolve through typed data catalogs.
