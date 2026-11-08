class_name CardChoice
extends RefCounted
## One card shown on the level-up screen. Immutable value object.

enum Kind { NEW_WEAPON, UPGRADE_WEAPON, NEW_PASSIVE, UPGRADE_PASSIVE, FILLER_HEAL, FILLER_JETON }

## Filler ids (game-design.md §5.3: "fill with Simit (heal 30 HP) and Jeton +20 cards").
## Named by effect, not "simit", to avoid clashing with the Simit weapon id.
const FILLER_HEAL_ID := &"filler_heal"
const FILLER_JETON_ID := &"filler_jeton"

var item_id: StringName
var kind: Kind
## Level the item will have after picking this card (1 for new items, 0 for fillers).
var next_level: int


func _init(p_item_id: StringName, p_kind: Kind, p_next_level: int) -> void:
	item_id = p_item_id
	kind = p_kind
	next_level = p_next_level


func is_filler() -> bool:
	return kind == Kind.FILLER_HEAL or kind == Kind.FILLER_JETON


func _to_string() -> String:
	return "%s(%s L%d)" % [Kind.keys()[kind], item_id, next_level]
