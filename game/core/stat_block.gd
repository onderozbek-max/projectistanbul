class_name StatBlock
extends RefCounted
## Base values + modifiers -> cached final values (architecture.md §4.5).
## The ONLY place the stacking formula lives (game-design.md §4.2):
##     final = (base + sum(flat)) * (1 + sum(add_pct)) * product(1 + mult_pct), then caps.
## Finals are recomputed lazily when a modifier changes (dirty flag), never per frame.

var _base: Dictionary[StringName, float] = {}
var _modifiers: Array[StatModifier] = []
var _finals: Dictionary[StringName, float] = {}
var _dirty: bool = true


func _init(base_values: Dictionary[StringName, float] = {}) -> void:
	_base = base_values.duplicate()


## Base value before modifiers (0 for stats never set).
func get_base(stat: StringName) -> float:
	return _base.get(stat, 0.0)


func set_base(stat: StringName, value: float) -> void:
	_base[stat] = value
	_dirty = true


func add_modifier(modifier: StatModifier) -> void:
	_modifiers.append(modifier)
	_dirty = true


## Removes every modifier granted by `source` (e.g. when gear is unequipped). Returns how many.
func remove_by_source(source: StringName) -> int:
	var before: int = _modifiers.size()
	_modifiers = _modifiers.filter(func(m: StatModifier) -> bool: return m.source != source)
	_dirty = true
	return before - _modifiers.size()


## Final, capped value. Cheap after the first call following a change.
func get_final(stat: StringName) -> float:
	if _dirty:
		_recompute()
	if _finals.has(stat):
		return _finals[stat]
	return StatCaps.apply(stat, get_base(stat), get_base(stat))


func _recompute() -> void:
	var flat: Dictionary[StringName, float] = {}
	var add_pct: Dictionary[StringName, float] = {}
	var mult: Dictionary[StringName, float] = {}
	for m: StatModifier in _modifiers:
		match m.kind:
			StatModifier.Kind.FLAT:
				flat[m.stat] = flat.get(m.stat, 0.0) + m.value
			StatModifier.Kind.ADD_PCT:
				add_pct[m.stat] = add_pct.get(m.stat, 0.0) + m.value
			StatModifier.Kind.MULT_PCT:
				mult[m.stat] = mult.get(m.stat, 1.0) * (1.0 + m.value)
	_finals.clear()
	var stats: Dictionary = {}
	for key: StringName in _base.keys() + flat.keys() + add_pct.keys() + mult.keys():
		stats[key] = true
	for stat: StringName in stats.keys():
		var base: float = get_base(stat)
		var value: float = (base + flat.get(stat, 0.0)) * (1.0 + add_pct.get(stat, 0.0)) * mult.get(stat, 1.0)
		_finals[stat] = StatCaps.apply(stat, value, base)
	_dirty = false
