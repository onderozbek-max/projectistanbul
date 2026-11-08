class_name StatModifier
extends Resource
## One change to one stat, granted by a passive, gear, skill, evolution or ultimate.
## Data, not code: new passives are .tres files. Stacking order: game-design.md §4.2.
##
## Which kind to use:
## - FLAT: adds to the base. Use for absolute stats (armor +1) AND for percentage stats whose
##   base is 0 (Butter: might FLAT 0.10 == +10% might). ADD_PCT on a zero base does nothing.
## - ADD_PCT: percentage of the base, summed with other ADD_PCT (Sneakers: move_speed +10%).
## - MULT_PCT: multiplicative, rare, labelled "multiplicative" in UI (evolutions, ultimates).

enum Kind { FLAT, ADD_PCT, MULT_PCT }

@export var stat: StringName
@export var kind: Kind = Kind.ADD_PCT
@export var value: float = 0.0
## Who granted it (item id, gear id...). Lets the owner remove exactly its own modifiers.
@export var source: StringName


## Convenience constructor for code and tests (content normally comes from .tres files).
static func create(p_stat: StringName, p_kind: Kind, p_value: float, p_source: StringName) -> StatModifier:
	var modifier := StatModifier.new()
	modifier.stat = p_stat
	modifier.kind = p_kind
	modifier.value = p_value
	modifier.source = p_source
	return modifier
