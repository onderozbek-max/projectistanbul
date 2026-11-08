extends Node
## Cross-system events only (architecture.md §4.7). Systems emit; UI and telemetry subscribe.
## Rules: signals are past tense; hot-path events (per hit, per tick) never go through the bus.

signal enemy_killed(type_id: int, position: Vector2, by_weapon_id: StringName)
signal xp_collected(amount: float)
signal level_up(run_level: int)
signal card_chosen(item_id: StringName)
signal evolution_triggered(weapon_id: StringName)
signal hero_damaged(hero_id: StringName, amount: float, source_id: StringName)
signal hero_switched(from_id: StringName, to_id: StringName)
signal boss_phase_changed(boss_id: StringName, phase: int)
signal segment_reached(segment_id: StringName)
signal run_ended(result: Dictionary)
