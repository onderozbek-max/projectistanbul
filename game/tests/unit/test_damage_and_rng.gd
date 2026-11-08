extends GutTest
## game-design.md §4.3 damage formulas + architecture.md §4.10 RNG stream independence.


func test_outgoing_damage_formula() -> void:
	# 10 * (1 + 0.5 might) * 1.5 crit * (1 + 0.15 vulnerable) * (1 - 0.2 reduction) = 20.7
	assert_almost_eq(DamageMath.outgoing(10.0, 0.5, 1.5, 0.15, 0.2), 20.7, 0.0001)


func test_incoming_damage_respects_armor_floor_and_reduction() -> void:
	assert_eq(DamageMath.incoming_to_player(10.0, 3.0, 0.0), 7.0)
	assert_eq(DamageMath.incoming_to_player(2.0, 5.0, 0.0), 1.0, "never below 1 after armor")
	assert_almost_eq(DamageMath.incoming_to_player(10.0, 0.0, 0.9), 2.5, 0.0001, "reduction capped at 75%")


func test_invulnerability_threshold_is_ten_percent_of_max_hp() -> void:
	assert_true(DamageMath.grants_invulnerability(10.0, 100.0))
	assert_false(DamageMath.grants_invulnerability(9.9, 100.0))


func test_crit_roll_respects_extremes() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 1
	assert_eq(DamageMath.roll_crit(rng, 0.0, 1.5), 1.0)
	assert_eq(DamageMath.roll_crit(rng, 1.0, 1.5), 1.5)


func test_same_seed_gives_same_sequence() -> void:
	var a := RngStreams.new(1234)
	var b := RngStreams.new(1234)
	assert_eq(a.stream(RngStreams.SPAWN).randi(), b.stream(RngStreams.SPAWN).randi())


func test_streams_are_independent() -> void:
	var quiet := RngStreams.new(99)
	var noisy := RngStreams.new(99)
	for i: int in 50:
		noisy.stream(RngStreams.LOOT).randi()  # extra loot rolls must not shift spawns
	assert_eq(quiet.stream(RngStreams.SPAWN).randi(), noisy.stream(RngStreams.SPAWN).randi())


func test_streams_differ_from_each_other() -> void:
	var streams := RngStreams.new(7)
	assert_ne(streams.stream(RngStreams.SPAWN).randi(), streams.stream(RngStreams.LOOT).randi())
