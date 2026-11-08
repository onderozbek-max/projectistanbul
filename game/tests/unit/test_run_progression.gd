extends GutTest
## game-design.md §4.5 (XP table) and §4.6 (enemy scaling).

const XP_TABLE: Array = [
	[1, 10], [2, 18], [3, 28], [4, 40], [5, 53], [6, 66], [7, 81], [8, 97], [9, 113],
	[10, 131], [15, 227], [20, 336], [25, 458], [30, 590],
]


func test_xp_to_next_matches_design_table(params: Array = use_parameters(XP_TABLE)) -> void:
	assert_eq(RunProgression.xp_to_next(params[0]), params[1], "level %d" % params[0])


func test_enemy_hp_scales_with_level_and_minutes() -> void:
	assert_almost_eq(RunProgression.enemy_hp(10.0, 1, 0.0), 10.0, 0.0001)
	assert_almost_eq(RunProgression.enemy_hp(10.0, 11, 0.0), 20.0, 0.0001)  # +10% per level
	assert_almost_eq(RunProgression.enemy_hp(10.0, 1, 5.0), 14.0, 0.0001)  # +8% per minute


func test_enemy_damage_scales_with_level() -> void:
	assert_almost_eq(RunProgression.enemy_damage(5.0, 21), 10.0, 0.0001)  # +5% per level
