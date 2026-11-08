class_name Swarm
extends RefCounted
## All regular enemies as struct-of-arrays (architecture.md §4.2): no Node per enemy.
## One tight loop per tick: chase target, soft separation (capped neighbors), integrate.
## Dead enemies are swept with swap-remove; their positions/XP land in the death buffers
## so pickups and telemetry can react without per-kill allocations or signals.

var config: SwarmConfig
var hash: SpatialHash
var count: int = 0
var capacity: int

# --- per-enemy arrays (index = slot; slots move on swap-remove) ---
var positions: PackedVector2Array
var prev_positions: PackedVector2Array  # for render interpolation
var velocities: PackedVector2Array
var hp: PackedFloat32Array
var type_ids: PackedInt32Array
var state: PackedInt32Array  # bit flags (elite, stunned, burning...) for M1+
var contact_timers: PackedFloat32Array
var anim_frame: PackedFloat32Array
## Cached separation push, refreshed every `config.separation_stagger` ticks per enemy.
var separation_push: PackedVector2Array

# --- per-type tables (index = type id), filled from EnemyDefs ---
var defs: Array[EnemyDef] = []
var max_radius: float = 0.0
var _type_speed: PackedFloat32Array
var _type_radius: PackedFloat32Array

# --- death buffers, valid until the next remove_dead() ---
var death_count: int = 0
var death_positions: PackedVector2Array
var death_types: PackedInt32Array

var _neighbors: PackedInt32Array
var _tick_index: int = 0


func _init(p_config: SwarmConfig) -> void:
	config = p_config
	capacity = p_config.capacity
	hash = SpatialHash.new(p_config.cell_size, p_config.hash_table_size, capacity)
	positions.resize(capacity)
	prev_positions.resize(capacity)
	velocities.resize(capacity)
	hp.resize(capacity)
	type_ids.resize(capacity)
	state.resize(capacity)
	contact_timers.resize(capacity)
	anim_frame.resize(capacity)
	separation_push.resize(capacity)
	death_positions.resize(capacity)
	death_types.resize(capacity)
	_neighbors.resize(p_config.max_separation_neighbors * 2 + 1)


## Registers an enemy type and returns its id for spawn().
func register_type(def: EnemyDef) -> int:
	defs.append(def)
	_type_speed.append(def.move_speed)
	_type_radius.append(def.radius)
	max_radius = maxf(max_radius, def.radius)
	return defs.size() - 1


## Adds an enemy; returns its slot or -1 when full (the spawn director refunds budget).
func spawn(type_id: int, position: Vector2, hp_multiplier: float = 1.0) -> int:
	if count >= capacity:
		return -1
	var i: int = count
	positions[i] = position
	prev_positions[i] = position
	velocities[i] = Vector2.ZERO
	hp[i] = defs[type_id].max_hp * hp_multiplier
	type_ids[i] = type_id
	state[i] = 0
	contact_timers[i] = 0.0
	anim_frame[i] = 0.0
	separation_push[i] = Vector2.ZERO
	count += 1
	return i


## Applies damage. Removal is deferred to remove_dead() so indices stay valid this tick.
func apply_damage(i: int, amount: float) -> void:
	hp[i] -= amount


func radius_of(i: int) -> float:
	return _type_radius[type_ids[i]]


## Moves every enemy one fixed step toward `target`.
func tick(dt: float, target: Vector2) -> void:
	hash.rebuild(positions, count)
	var max_n: int = config.max_separation_neighbors
	var strength: float = config.separation_strength
	var stagger: int = maxi(1, config.separation_stagger)
	_tick_index += 1
	for i: int in count:
		var p: Vector2 = positions[i]
		prev_positions[i] = p
		var t: int = type_ids[i]
		var to_target: Vector2 = target - p
		var dist: float = to_target.length()
		var velocity: Vector2 = Vector2.ZERO
		if dist > 0.001:
			velocity = to_target * (_type_speed[t] / dist)
		if (i + _tick_index) % stagger == 0:
			separation_push[i] = _separation(i, p, _type_radius[t], max_n) * strength
		velocity += separation_push[i]
		velocities[i] = velocity
		positions[i] = p + velocity * dt
		contact_timers[i] = maxf(0.0, contact_timers[i] - dt)


func _separation(i: int, p: Vector2, r: float, max_n: int) -> Vector2:
	var found: int = hash.query(p, r + max_radius, _neighbors, _neighbors.size())
	var push: Vector2 = Vector2.ZERO
	var considered: int = 0
	for k: int in found:
		var j: int = _neighbors[k]
		if j == i:
			continue
		var offset: Vector2 = p - positions[j]
		var min_dist: float = r + _type_radius[type_ids[j]]
		var d2: float = offset.length_squared()
		if d2 < min_dist * min_dist and d2 > 0.000001:
			var d: float = sqrt(d2)
			push += offset * ((min_dist - d) / (min_dist * d))
			considered += 1
			if considered >= max_n:
				break
	return push


## Sweeps enemies with hp <= 0 (swap-remove) into the death buffers. Returns kills.
func remove_dead() -> int:
	death_count = 0
	var i: int = count - 1
	while i >= 0:
		if hp[i] <= 0.0:
			death_positions[death_count] = positions[i]
			death_types[death_count] = type_ids[i]
			death_count += 1
			_swap_remove(i)
		i -= 1
	return death_count


func _swap_remove(i: int) -> void:
	var last: int = count - 1
	if i != last:
		positions[i] = positions[last]
		prev_positions[i] = prev_positions[last]
		velocities[i] = velocities[last]
		hp[i] = hp[last]
		type_ids[i] = type_ids[last]
		state[i] = state[last]
		contact_timers[i] = contact_timers[last]
		anim_frame[i] = anim_frame[last]
		separation_push[i] = separation_push[last]
	count = last


## Contact damage to a circle (the hero). Each enemy hits at most once per
## DamageMath.CONTACT_TICK_INTERVAL. Returns raw damage before armor.
func collect_contact_damage(center: Vector2, radius: float) -> float:
	var found: int = hash.query(center, radius + max_radius, _neighbors, _neighbors.size())
	var total: float = 0.0
	for k: int in found:
		var j: int = _neighbors[k]
		if contact_timers[j] > 0.0:
			continue
		var reach: float = radius + _type_radius[type_ids[j]]
		if center.distance_squared_to(positions[j]) <= reach * reach:
			total += defs[type_ids[j]].contact_damage
			contact_timers[j] = DamageMath.CONTACT_TICK_INTERVAL
	return total
