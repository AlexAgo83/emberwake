## prod_015_post_run_outcome_analysis_direction_for_skill_performance - Post-run outcome analysis direction for skill performance
> Date: 2026-03-23
> Status: Draft
> Related request: `req_066_define_a_game_over_skill_ranking_view_toggle`
> Related backlog: `item_248_define_a_game_over_view_toggle_between_recap_and_skill_ranking_analysis`, `item_249_define_a_first_pass_skill_performance_summary_contract_for_post_run_ranking`, `item_250_define_a_compact_skill_ranking_presentation_for_game_over_analysis`, `item_251_define_targeted_validation_for_game_over_skill_analysis_readability_and_metric_credibility`
> Related task: `TBD after request approval`
> Related architecture: `adr_027_expose_gameplay_outcomes_as_a_game_owned_shell_consumable_contract`, `adr_046_expose_post_run_skill_performance_summaries_as_shell_consumable_outcome_data`
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
The current game-over screen tells the player what happened to the run, but not how the build performed. The next product step is not a huge analytics dashboard. It is a compact post-run analysis view that helps players learn from their skill usage.

# Product problem
The current defeat recap is good for:
- survival duration
- traversal
- kills
- gold

It is weak for:
- build reflection
- identifying carry skills
- understanding which part of the arsenal mattered most

# Goals
- Preserve the current recap.
- Add a second post-run skill analysis view.
- Rank used skills from strongest to weakest with one clear metric.
- Make defeat feel more reflective and informative.

# Non-goals
- Building a full combat log.
- Building a full run-history feature.
- Surfacing every possible combat metric in the first pass.

# Direction
## Alternate views, not stacked overload
The defeat screen should switch between:
- recap
- skill ranking

instead of trying to show everything at once.

## One credible primary metric
The first pass should prefer one ranking signal that the player can understand and trust.

## Post-run reflection, not debugging
The analysis view should feel like:
- tactical debrief
- not profiling output

# Success signals
- Players can identify which skills carried a run.
- The game-over screen becomes more valuable without becoming cluttered.
- The ranking view feels credible, compact, and easy to scan.

# Risks
- Using a metric that players do not understand.
- Overfitting to analytics and making the view feel like debug UI.
- Crowding the defeat screen with too much detail.
