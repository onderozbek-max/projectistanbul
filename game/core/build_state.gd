class_name BuildState
extends RefCounted
## What the player owns in the current run (game-design.md §5.1): item id -> level.
## Pure data + small queries; the card offer and the UI both read it.

const WEAPON_SLOTS: int = 6
const PASSIVE_SLOTS: int = 6

var weapon_levels: Dictionary[StringName, int] = {}
var passive_levels: Dictionary[StringName, int] = {}


func has_free_weapon_slot() -> bool:
	return weapon_levels.size() < WEAPON_SLOTS


func has_free_passive_slot() -> bool:
	return passive_levels.size() < PASSIVE_SLOTS


func weapon_level(weapon_id: StringName) -> int:
	return weapon_levels.get(weapon_id, 0)


func passive_level(passive_id: StringName) -> int:
	return passive_levels.get(passive_id, 0)


## Applies a chosen card: new items start at L1, upgrades add one level.
func apply(choice: CardChoice) -> void:
	match choice.kind:
		CardChoice.Kind.NEW_WEAPON, CardChoice.Kind.UPGRADE_WEAPON:
			weapon_levels[choice.item_id] = choice.next_level
		CardChoice.Kind.NEW_PASSIVE, CardChoice.Kind.UPGRADE_PASSIVE:
			passive_levels[choice.item_id] = choice.next_level
		_:
			pass  # fillers (heal, jeton) are consumed by the run, not stored in the build
