extends GutTest
## game-design.md §4.2 (stacking order) and §4.4 (caps).

var _stats: StatBlock


func before_each() -> void:
	_stats = StatBlock.new({
		StatId.MAX_HP: 100.0, StatId.MOVE_SPEED: 3.2, StatId.MIGHT: 0.0, StatId.ARMOR: 0.0,
	})


func test_final_equals_base_without_modifiers() -> void:
	assert_eq(_stats.get_final(StatId.MAX_HP), 100.0)


func test_stacking_order_flat_then_add_then_mult() -> void:
	# (100 + 20) * (1 + 0.10 + 0.20) * (1 + 0.5) = 120 * 1.3 * 1.5 = 234
	_stats.add_modifier(StatModifier.create(StatId.MAX_HP, StatModifier.Kind.FLAT, 20.0, &"a"))
	_stats.add_modifier(StatModifier.create(StatId.MAX_HP, StatModifier.Kind.ADD_PCT, 0.10, &"b"))
	_stats.add_modifier(StatModifier.create(StatId.MAX_HP, StatModifier.Kind.ADD_PCT, 0.20, &"c"))
	_stats.add_modifier(StatModifier.create(StatId.MAX_HP, StatModifier.Kind.MULT_PCT, 0.50, &"d"))
	assert_almost_eq(_stats.get_final(StatId.MAX_HP), 234.0, 0.001)


func test_mult_pct_modifiers_multiply_each_other() -> void:
	_stats.add_modifier(StatModifier.create(StatId.MAX_HP, StatModifier.Kind.MULT_PCT, 0.10, &"a"))
	_stats.add_modifier(StatModifier.create(StatId.MAX_HP, StatModifier.Kind.MULT_PCT, 0.10, &"b"))
	assert_almost_eq(_stats.get_final(StatId.MAX_HP), 121.0, 0.001)


func test_percentage_stat_with_zero_base_uses_flat() -> void:
	# Butter: +10% might is a FLAT 0.10 on a zero base (see StatModifier docs).
	_stats.add_modifier(StatModifier.create(StatId.MIGHT, StatModifier.Kind.FLAT, 0.10, &"butter"))
	assert_almost_eq(_stats.get_final(StatId.MIGHT), 0.10, 0.0001)


func test_remove_by_source_restores_value() -> void:
	_stats.add_modifier(StatModifier.create(StatId.ARMOR, StatModifier.Kind.FLAT, 1.0, &"puffer"))
	assert_eq(_stats.get_final(StatId.ARMOR), 1.0)
	assert_eq(_stats.remove_by_source(&"puffer"), 1)
	assert_eq(_stats.get_final(StatId.ARMOR), 0.0)


func test_cooldown_reduction_capped_at_60_percent() -> void:
	_stats.add_modifier(StatModifier.create(StatId.COOLDOWN_REDUCTION, StatModifier.Kind.FLAT, 0.9, &"x"))
	assert_almost_eq(_stats.get_final(StatId.COOLDOWN_REDUCTION), 0.60, 0.0001)


func test_move_speed_bonus_capped_at_plus_100_percent() -> void:
	_stats.add_modifier(StatModifier.create(StatId.MOVE_SPEED, StatModifier.Kind.ADD_PCT, 3.0, &"x"))
	assert_almost_eq(_stats.get_final(StatId.MOVE_SPEED), 6.4, 0.0001)


func test_other_caps(params: Array = use_parameters([
		[StatId.AREA, 5.0, 2.0], [StatId.CRIT_CHANCE, 1.5, 1.0],
		[StatId.PROJECTILE_BONUS, 9.0, 5.0], [StatId.PLAYER_DAMAGE_REDUCTION, 0.9, 0.75]])) -> void:
	_stats.add_modifier(StatModifier.create(params[0], StatModifier.Kind.FLAT, params[1], &"x"))
	assert_almost_eq(_stats.get_final(params[0]), params[2], 0.0001, str(params[0]))
