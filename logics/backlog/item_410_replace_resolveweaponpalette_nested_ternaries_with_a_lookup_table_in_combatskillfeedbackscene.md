## item_410_replace_resolveweaponpalette_nested_ternaries_with_a_lookup_table_in_combatskillfeedbackscene - Replace resolveWeaponPalette nested ternaries with a lookup table in CombatSkillFeedbackScene
> From version: 0.7.2
> Schema version: 1.0
> Status: Ready
> Understanding: 100%
> Confidence: 99%
> Progress: 0%
> Complexity: Low
> Theme: Delivery
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- `resolveWeaponPalette` in `src/game/render/CombatSkillFeedbackScene.tsx` (lines 44–91) dispatches visual parameters across twelve weapon variants using deeply nested ternary chains.
- Adding a new weapon requires manually inserting into the chain without any structural guarantee of coverage, making the function error-prone as the roster grows.

# Scope
- In:
  - replace the nested ternary chain with a plain object literal (or `Map`) keyed by weapon type, covering all twelve existing weapon variants
  - verify the replacement produces identical visual output for every existing variant (colors, opacities, feedback parameters unchanged)
  - pass the existing test suite without modification
- Out:
  - changing any visual output for any weapon variant
  - adding new weapons or feedback parameters
  - touching any other file in the render layer

```mermaid
%% logics-kind: backlog
%% logics-signature: backlog|replace-resolveweaponpalette-nested-tern|resolveweaponpalette-uses-deeply-nested-t|req-123-defines-a-lookup-table-replacemen|ac1-the-slice-replaces-the-nested-ternar
flowchart LR
    Audit[Post-0.7.2 audit] --> Refactor[Replace nested ternaries with lookup table]
    Refactor --> Coverage[12 variants covered]
    Coverage --> Tests[Existing tests pass unchanged]
```

# Acceptance criteria
- AC1: The slice replaces the nested ternary chain in `resolveWeaponPalette` with a plain object literal keyed by weapon type, covering all twelve existing weapon variants.
- AC2: The visual output for every existing weapon variant — colors, opacities, feedback parameters — is identical before and after the refactor.
- AC3: The existing test suite passes without modification.
- AC4: No other files are changed.

# AC Traceability
- AC1 -> lookup table. Proof: nested ternaries replaced by keyed object, all 12 variants present.
- AC2 -> identical output. Proof: visual parameters match the original for every weapon key.
- AC3 -> test suite. Proof: `npm run test` passes without changes to any test file.
- AC4 -> single file. Proof: only `CombatSkillFeedbackScene.tsx` is modified.

# Decision framing
- Product framing: Optional
- Product signals: none visible to players
- Product follow-up: the lookup table structure makes adding future weapons straightforward — no further action required after this slice.
- Architecture framing: Optional
- Architecture signals: render-layer dispatch pattern consistency
- Architecture follow-up: none expected.

# Links
- Request: `req_123_define_a_codebase_hygiene_wave_for_dependency_updates_component_size_thresholds_and_weapon_palette_readability`
- Primary task(s): `task_076_orchestrate_codebase_hygiene_wave_for_dependency_updates_component_size_policy_and_weapon_palette_refactor`

# AI Context
- Summary: Replace the resolveWeaponPalette nested ternary chain with a plain object lookup table covering all twelve weapon variants, with identical visual output and no test changes.
- Keywords: weapon palette, lookup table, ternary refactor, CombatSkillFeedbackScene, render dispatch, maintainability
- Use when: Use when refactoring the weapon palette dispatch in the combat feedback renderer.
- Skip when: Skip when adding new weapons, changing visual output, or working outside CombatSkillFeedbackScene.

# References
- `src/game/render/CombatSkillFeedbackScene.tsx`
