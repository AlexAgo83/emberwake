## adr_044_split_runtime_hud_into_anchored_blocks_and_route_mobile_menu_entry_to_the_full_screen_shell_surface - Split runtime HUD into anchored blocks and route mobile menu entry to the full-screen shell surface
> Date: 2026-03-23
> Status: Proposed
> Drivers: The current runtime feedback reads as one compact panel instead of an anchored HUD, and the mobile runtime menu trigger currently opens the wrong interaction model.
> Related request: `req_063_define_a_techno_shinobi_runtime_hud_relayout_and_mobile_menu_entry_wave`
> Related backlog: `item_238_define_a_compact_top_left_player_progression_hud_block`, `item_239_define_a_quiet_top_right_fps_text_and_compact_runtime_menu_trigger`, `item_240_define_a_bottom_right_reserved_build_slot_hud_for_active_and_passive_capacity`, `item_241_route_the_mobile_runtime_menu_trigger_to_the_full_screen_shell_surface`, `item_242_define_ui_steering_validation_for_the_runtime_hud_relayout_wave`
> Related task: `TBD after request approval`
> Related architecture: `adr_016_define_shell_scene_state_and_meta_surface_ownership`, `adr_025_keep_shell_chrome_event_driven_and_sample_diagnostics_off_the_runtime_hot_path`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
The runtime HUD should be modeled as multiple anchored chrome blocks, while the mobile menu trigger should route into the shell’s full-screen ownership model instead of opening a floating runtime deck.

# Decision
- Split runtime feedback into anchored blocks by role.
- Reserve build-slot space in HUD chrome rather than relying only on filled entries.
- Keep the menu trigger compact and HUD-like.
- On mobile, route runtime menu entry into the full-screen shell surface.

# Consequences
- The HUD becomes more edge-native.
- Mobile navigation becomes more coherent.
- Empty build capacity becomes visible.

# Alternatives considered
- Keep one compact panel and only restyle it.
  Rejected because anchoring and hierarchy would remain weak.
- Keep mobile on the floating deck model.
  Rejected because it conflicts with mobile interaction expectations.
