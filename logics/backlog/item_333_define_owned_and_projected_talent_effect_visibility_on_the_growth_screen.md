## item_333_define_owned_and_projected_talent_effect_visibility_on_the_growth_screen - Define owned and projected talent effect visibility on the growth screen
> From version: 0.6.0
> Schema version: 1.0
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: Low
> Theme: Meta progression
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Show the permanent effect already owned on the `Growth` screen instead of exposing only rank and price.
- Show the projected benefit of the next purchase before the player spends gold.
- Expose owned completion as a percentage where the lane has a bounded denominator, so progression is readable at a glance.
- Keep this slice presentation-only and aligned with the existing meta-progression rules.
- The current `Growth` scene already covers core purchase flow, but it does not explain the value of a purchase clearly enough:
- - the `Shop` lane shows a raw ownership count such as `1/3 owned`

# Scope
- In:
- Out:

```mermaid
%% logics-kind: backlog
%% logics-signature: backlog|define-owned-and-projected-talent-effect|req-088-define-current-and-projected-gai|show-the-permanent-effect-already-owned|ac1-the-request-defines-that-the
flowchart LR
    Request[req_088_define_current_and_projected_gain_] --> Problem[Show the permanent effect already owned]
    Problem --> Scope[Define owned and projected talent effect]
    Scope --> Acceptance[AC1: The request defines that the]
    Acceptance --> Tasks[Execution task]
```

# Acceptance criteria
- AC1: The request defines that the `Growth` screen shows the current owned effect for each talent rather than only the current rank and next price.
- AC2: The request defines that percentage-based talents show the currently owned bonus and the next projected gain in percentage terms before purchase.
- AC3: The request defines that fixed-value talents such as health or shield gains keep honest unit-based presentation rather than fabricated percentages.
- AC4: The request defines that bounded ownership summaries expose owned progress as a percentage where a clear denominator exists, at minimum for `Shop` ownership.
- AC5: The request defines that displayed owned and projected values are derived from the same meta-progression rules currently used to apply runtime modifiers.
- AC6: The request keeps the slice presentation-only and does not change costs, rank caps, unlock ownership rules, or persistence behavior.
- AC7: The request defines validation expectations strong enough to later prove that:
- current owned values match the active talent ranks
- projected next values match the next purchasable rank
- capped talents do not show misleading projected-gain copy
- owned percentages stay aligned with actual purchased ownership counts after a purchase

# AC Traceability
- AC1 -> Scope: talent cards now show an explicit `Owned effect` line instead of exposing only rank and price. Proof: `src/app/components/GrowthScene.tsx`, `src/app/components/AppMetaScenePanel.test.tsx`.
- AC2 -> Scope: percentage-based talents now show owned and next-rank values in percentage terms. Proof: `src/app/model/metaProgression.ts`, `src/app/model/metaProgression.test.ts`, `src/app/components/GrowthScene.tsx`.
- AC3 -> Scope: fixed-value talents keep unit-based labels such as `HP` and `charge` rather than fabricated percentages. Proof: `src/app/model/metaProgression.ts`, `src/app/model/metaProgression.test.ts`, `src/app/components/GrowthScene.tsx`.
- AC4 -> Scope: bounded shop ownership progress now exposes a percentage alongside the raw owned count. Proof: `src/app/model/metaProgression.ts`, `src/app/model/metaProgression.test.ts`, `src/app/components/GrowthScene.tsx`.
- AC5 -> Scope: displayed owned and projected values are derived from `deriveBuildMetaProgression`, so UI numbers stay aligned with runtime modifiers. Proof: `src/app/model/metaProgression.ts`.
- AC6 -> Scope: the delivery stayed presentation-only and did not touch purchase rules, persistence, or cost curves. Proof: changed gameplay scope is limited to `src/app/model/metaProgression.ts`, `src/app/components/GrowthScene.tsx`, and related tests.
- AC7 -> Scope: targeted validation was added for both the model helpers and the rendered shell surface. Proof: `src/app/model/metaProgression.test.ts`, `src/app/components/AppMetaScenePanel.test.tsx`, `task_061_orchestrate_growth_owned_and_projected_gain_visibility`.
- AC8 -> Scope: owned values match current ranks through helper-backed preview tests and rendered talent cards. Proof: `src/app/model/metaProgression.test.ts`, `src/app/components/AppMetaScenePanel.test.tsx`.
- AC9 -> Scope: projected next values match the next purchasable rank through helper-backed preview tests and rendered talent cards. Proof: `src/app/model/metaProgression.test.ts`, `src/app/components/AppMetaScenePanel.test.tsx`.
- AC10 -> Scope: capped talents suppress projected-gain copy and fall back to `Maxed out.`. Proof: `src/app/components/GrowthScene.tsx`.
- AC11 -> Scope: owned percentages are computed from actual purchased unlock counts and rendered from that shared helper. Proof: `src/app/model/metaProgression.ts`, `src/app/model/metaProgression.test.ts`, `src/app/components/GrowthScene.tsx`.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Consider
- Architecture signals: data model and persistence
- Architecture follow-up: Review whether an architecture decision is needed before implementation becomes harder to reverse.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_088_define_current_and_projected_gain_visibility_on_the_growth_screen`
- Primary task(s): `task_061_orchestrate_growth_owned_and_projected_gain_visibility`

# AI Context
- Summary: Define clearer owned bonus and next purchase gain visibility on the shell-owned Growth screen.
- Keywords: growth, talents, owned bonus, projected gain, percentage, shop progress, meta progression
- Use when: Use when framing scope, context, and acceptance checks for clearer owned and projected progression visibility on the Growth screen.
- Skip when: Skip when the work targets another feature, repository, or workflow stage.

# References
- `logics/skills/logics-ui-steering/SKILL.md`

# Priority
- Impact:
- Urgency:

# Notes
- Derived from request `req_088_define_current_and_projected_gain_visibility_on_the_growth_screen`.
- Source file: `logics/request/req_088_define_current_and_projected_gain_visibility_on_the_growth_screen.md`.
- Request context seeded into this backlog item from `logics/request/req_088_define_current_and_projected_gain_visibility_on_the_growth_screen.md`.
