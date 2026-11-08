class_name ProjectilePool
extends RefCounted
## Player projectiles as struct-of-arrays (architecture.md §4.3). Hit tests use the swarm's
## spatial hash (rebuilt by Swarm.tick, so call this AFTER the swarm tick). Swap-remove on
## expiry. Weapons (M1-T5) decide WHAT to spawn; this pool only moves and resolves hits.
##
## Known simplification: a piercing projectile remembers only the last enemy SLOT it hit.
## Slots move on swap-remove, so M1-T5 should switch to stable enemy ids (generation counter).

var count: int = 0
var capacity: int
var positions: PackedVector2Array
var prev_positions: PackedVector2Array
var velocities: PackedVector2Array
var damage: PackedFloat32Array
var radius: PackedFloat32Array
var life: PackedFloat32Array
var pierce: PackedInt32Array  # remaining extra hits; < 0 means spent
var last_hit: PackedInt32Array

var _candidates: PackedInt32Array


func _init(p_capacity: int, max_candidates: int = 64) -> void:
	capacity = p_capacity
	positions.resize(capacity)
	prev_positions.resize(capacity)
	velocities.resize(capacity)
	damage.resize(capacity)
	radius.resize(capacity)
	life.resize(capacity)
	pierce.resize(capacity)
	last_hit.resize(capacity)
	_candidates.resize(max_candidates)


## Returns the slot, or -1 if the pool is full (the weapon simply skips this shot).
func spawn(position: Vector2, velocity: Vector2, p_damage: float, p_radius: float,
		lifetime: float, pierce_count: int) -> int:
	if count >= capacity:
		return -1
	var i: int = count
	positions[i] = position
	prev_positions[i] = position
	velocities[i] = velocity
	damage[i] = p_damage
	radius[i] = p_radius
	life[i] = lifetime
	pierce[i] = pierce_count
	last_hit[i] = -1
	count += 1
	return i


## Moves projectiles, applies hits to the swarm, removes spent ones. Returns the hit count.
func tick(dt: float, swarm: Swarm) -> int:
	var hits: int = 0
	var i: int = count - 1
	while i >= 0:
		life[i] -= dt
		var p: Vector2 = positions[i]
		prev_positions[i] = p
		p += velocities[i] * dt
		positions[i] = p
		if life[i] > 0.0:
			hits += _resolve_hits(i, p, swarm)
		if life[i] <= 0.0 or pierce[i] < 0:
			_swap_remove(i)
		i -= 1
	return hits


## Applies hits for projectile i; stops when its pierce is spent. Returns hits applied.
func _resolve_hits(i: int, p: Vector2, swarm: Swarm) -> int:
	var hits: int = 0
	var r: float = radius[i]
	var found: int = swarm.hash.query(p, r + swarm.max_radius, _candidates, _candidates.size())
	for k: int in found:
		var j: int = _candidates[k]
		if j >= swarm.count or swarm.hp[j] <= 0.0 or j == last_hit[i]:
			continue
		var reach: float = r + swarm.radius_of(j)
		if p.distance_squared_to(swarm.positions[j]) > reach * reach:
			continue
		swarm.apply_damage(j, damage[i])
		last_hit[i] = j
		hits += 1
		pierce[i] -= 1
		if pierce[i] < 0:
			break
	return hits


func _swap_remove(i: int) -> void:
	var last: int = count - 1
	if i != last:
		positions[i] = positions[last]
		prev_positions[i] = prev_positions[last]
		velocities[i] = velocities[last]
		damage[i] = damage[last]
		radius[i] = radius[last]
		life[i] = life[last]
		pierce[i] = pierce[last]
		last_hit[i] = last_hit[last]
	count = last
