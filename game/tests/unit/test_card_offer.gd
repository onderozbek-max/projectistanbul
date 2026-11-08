extends GutTest
## game-design.md §5.3 (weights, rules, fillers, luck) and §5.4 (pool unlock).

var _weapons: Array[WeaponDef] = []
var _passives: Array[PassiveDef] = []


func _weapon(id: StringName, unlock: int = 1, pair: StringName = &"", signature: bool = false) -> WeaponDef:
	var w := WeaponDef.new()
	w.id = id
	w.unlock_at_level = unlock
	w.paired_passive = pair
	w.is_signature = signature
	return w


func _passive(id: StringName, unlock: int = 1) -> PassiveDef:
	var p := PassiveDef.new()
	p.id = id
	p.unlock_at_level = unlock
	return p


func _rng(seed_value: int) -> RandomNumberGenerator:
	var rng := RandomNumberGenerator.new()
	rng.seed = seed_value
	return rng


func before_each() -> void:
	# The L1 pool from §5.4 plus one locked item.
	_weapons = [_weapon(&"fork", 1, &"", true), _weapon(&"tea_glass", 1, &"teapot"), _weapon(&"skewer", 4)]
	_passives = [_passive(&"sneakers"), _passive(&"ayran"), _passive(&"butter"), _passive(&"teapot", 2)]


func _ids(cards: Array[CardChoice]) -> Array[StringName]:
	var ids: Array[StringName] = []
	for c: CardChoice in cards:
		ids.append(c.item_id)
	return ids


func test_offers_three_unique_cards_without_luck() -> void:
	var build := BuildState.new()
	build.weapon_levels[&"fork"] = 1
	for seed_value: int in 30:
		var cards := CardOffer.draw(build, _weapons, _passives, 1, 0.0, _rng(seed_value))
		assert_eq(cards.size(), 3)
		var ids := _ids(cards)
		for id: StringName in ids:
			assert_eq(ids.count(id), 1, "no duplicates")


func test_never_offers_locked_maxed_or_signature_as_new() -> void:
	var build := BuildState.new()
	build.weapon_levels[&"tea_glass"] = 5  # maxed; fork not owned but is signature
	for seed_value: int in 50:
		var ids := _ids(CardOffer.draw(build, _weapons, _passives, 1, 0.0, _rng(seed_value)))
		assert_false(ids.has(&"skewer"), "locked until level 4")
		assert_false(ids.has(&"teapot"), "locked until level 2")
		assert_false(ids.has(&"tea_glass"), "maxed")
		assert_false(ids.has(&"fork"), "signature is never offered as new")


func test_fills_with_heal_then_jeton_when_pool_is_small() -> void:
	var build := BuildState.new()
	build.weapon_levels[&"tea_glass"] = 5
	var passives: Array[PassiveDef] = [_passive(&"sneakers")]
	var weapons: Array[WeaponDef] = [_weapons[1]]
	var cards := CardOffer.draw(build, weapons, passives, 1, 0.0, _rng(3))
	assert_eq(_ids(cards), [&"sneakers", CardChoice.FILLER_HEAL_ID, CardChoice.FILLER_JETON_ID])


func test_full_slots_block_new_items() -> void:
	var build := BuildState.new()
	for i: int in BuildState.PASSIVE_SLOTS:
		build.passive_levels[StringName("p%d" % i)] = 5
	var cards := CardOffer.draw(build, [] as Array[WeaponDef], _passives, 1, 0.0, _rng(1))
	for c: CardChoice in cards:
		assert_true(c.is_filler(), "no new passive when all slots are full")


func test_luck_can_add_a_fourth_card() -> void:
	var build := BuildState.new()
	var cards := CardOffer.draw(build, _weapons, _passives, 9, 2.0, _rng(5))  # chance = 1.0
	assert_eq(cards.size(), 4)


func test_evolution_path_weight_bonus_shows_in_frequency() -> void:
	# tea_glass at L4 with teapot owned has weight 3+2=5 vs 3 for a plain upgrade.
	var with_pair := _offer_rate(&"teapot", 1)
	var without_pair := _offer_rate(&"sneakers", 1)
	assert_gt(with_pair, without_pair, "evolution path should be offered more often")


func _offer_rate(owned_passive: StringName, passive_level: int) -> float:
	var build := BuildState.new()
	build.weapon_levels[&"tea_glass"] = 4
	build.passive_levels[owned_passive] = passive_level
	var hits: int = 0
	for seed_value: int in 2000:
		if _ids(CardOffer.draw(build, _weapons, _passives, 9, 0.0, _rng(seed_value))).has(&"tea_glass"):
			hits += 1
	return float(hits) / 2000.0


func test_apply_updates_build() -> void:
	var build := BuildState.new()
	build.apply(CardChoice.new(&"tea_glass", CardChoice.Kind.NEW_WEAPON, 1))
	build.apply(CardChoice.new(&"tea_glass", CardChoice.Kind.UPGRADE_WEAPON, 2))
	build.apply(CardChoice.new(CardChoice.FILLER_HEAL_ID, CardChoice.Kind.FILLER_HEAL, 0))
	assert_eq(build.weapon_level(&"tea_glass"), 2)
	assert_eq(build.passive_levels.size(), 0)


func test_same_seed_same_offer() -> void:
	var build := BuildState.new()
	var a := _ids(CardOffer.draw(build, _weapons, _passives, 9, 0.0, _rng(42)))
	var b := _ids(CardOffer.draw(build, _weapons, _passives, 9, 0.0, _rng(42)))
	assert_eq(a, b)
