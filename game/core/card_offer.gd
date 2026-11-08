class_name CardOffer
extends RefCounted
## Builds the level-up card offer (game-design.md §5.3, §5.4): weighted draw without
## replacement, progressive pool unlock, evolution-path bonus, fillers, luck 4th card.
## Pure function of its inputs + the `cards` RNG stream, so it is deterministic and testable.

const WEIGHT_UPGRADE_WEAPON: float = 3.0
const WEIGHT_UPGRADE_PASSIVE: float = 3.0
const WEIGHT_NEW_WEAPON: float = 2.0
const WEIGHT_NEW_PASSIVE: float = 2.0
## Bonus for an owned weapon at this level whose paired passive is owned (evolution path).
const EVOLUTION_PATH_LEVEL: int = 4
const WEIGHT_EVOLUTION_BONUS: float = 2.0
const BASE_CARD_COUNT: int = 3
## Chance of a 4th card = luck * this factor (luck 0.20 -> 10%).
const LUCK_FOURTH_CARD_FACTOR: float = 0.5


## Returns 3 (sometimes 4) cards. `level_index` is the global level (gates the pool, §5.4).
static func draw(build: BuildState, weapons: Array[WeaponDef], passives: Array[PassiveDef],
		level_index: int, luck: float, rng: RandomNumberGenerator) -> Array[CardChoice]:
	var card_count: int = BASE_CARD_COUNT
	if rng.randf() < luck * LUCK_FOURTH_CARD_FACTOR:
		card_count += 1
	var candidates: Array[CardChoice] = []
	var weights: Array[float] = []
	_collect_weapons(build, weapons, level_index, candidates, weights)
	_collect_passives(build, passives, level_index, candidates, weights)
	var offer: Array[CardChoice] = _weighted_pick(candidates, weights, card_count, rng)
	_fill_with_fillers(offer, card_count)
	return offer


static func _collect_weapons(build: BuildState, weapons: Array[WeaponDef], level_index: int,
		out_cards: Array[CardChoice], out_weights: Array[float]) -> void:
	for weapon: WeaponDef in weapons:
		if weapon.unlock_at_level > level_index:
			continue  # locked items are never offered
		var level: int = build.weapon_level(weapon.id)
		if level >= weapon.max_level:
			continue  # maxed items are never offered
		if level > 0:
			var weight: float = WEIGHT_UPGRADE_WEAPON
			if level == EVOLUTION_PATH_LEVEL and build.passive_level(weapon.paired_passive) > 0:
				weight += WEIGHT_EVOLUTION_BONUS
			out_cards.append(CardChoice.new(weapon.id, CardChoice.Kind.UPGRADE_WEAPON, level + 1))
			out_weights.append(weight)
		elif build.has_free_weapon_slot() and not weapon.is_signature:
			out_cards.append(CardChoice.new(weapon.id, CardChoice.Kind.NEW_WEAPON, 1))
			out_weights.append(WEIGHT_NEW_WEAPON)


static func _collect_passives(build: BuildState, passives: Array[PassiveDef], level_index: int,
		out_cards: Array[CardChoice], out_weights: Array[float]) -> void:
	for passive: PassiveDef in passives:
		if passive.unlock_at_level > level_index:
			continue
		var level: int = build.passive_level(passive.id)
		if level >= passive.max_level:
			continue
		if level > 0:
			out_cards.append(CardChoice.new(passive.id, CardChoice.Kind.UPGRADE_PASSIVE, level + 1))
			out_weights.append(WEIGHT_UPGRADE_PASSIVE)
		elif build.has_free_passive_slot():
			out_cards.append(CardChoice.new(passive.id, CardChoice.Kind.NEW_PASSIVE, 1))
			out_weights.append(WEIGHT_NEW_PASSIVE)


## Weighted sampling without replacement. Mutates copies, never the inputs.
static func _weighted_pick(candidates: Array[CardChoice], weights: Array[float], count: int,
		rng: RandomNumberGenerator) -> Array[CardChoice]:
	var pool: Array[CardChoice] = candidates.duplicate()
	var pool_weights: Array[float] = weights.duplicate()
	var picked: Array[CardChoice] = []
	while picked.size() < count and not pool.is_empty():
		var total: float = 0.0
		for w: float in pool_weights:
			total += w
		var roll: float = rng.randf() * total
		var index: int = 0
		while index < pool.size() - 1 and roll >= pool_weights[index]:
			roll -= pool_weights[index]
			index += 1
		picked.append(pool[index])
		pool.remove_at(index)
		pool_weights.remove_at(index)
	return picked


static func _fill_with_fillers(offer: Array[CardChoice], count: int) -> void:
	var use_heal: bool = true
	while offer.size() < count:
		if use_heal:
			offer.append(CardChoice.new(CardChoice.FILLER_HEAL_ID, CardChoice.Kind.FILLER_HEAL, 0))
		else:
			offer.append(CardChoice.new(CardChoice.FILLER_JETON_ID, CardChoice.Kind.FILLER_JETON, 0))
		use_heal = not use_heal
