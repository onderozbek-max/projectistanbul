class_name PickupPool
extends RefCounted
## XP droplets as struct-of-arrays. Droplets inside the pickup radius get magnetized and fly
## to the hero; within `collect_distance` they are collected. All tuning comes in as
## arguments from Defs/stats, so this file holds no gameplay numbers.

var count: int = 0
var capacity: int
var positions: PackedVector2Array
var values: PackedFloat32Array
var magnetized: PackedByteArray


func _init(p_capacity: int) -> void:
	capacity = p_capacity
	positions.resize(capacity)
	values.resize(capacity)
	magnetized.resize(capacity)


## Returns the slot, or -1 when full. (M2: merge into the nearest droplet instead of dropping.)
func spawn(position: Vector2, value: float) -> int:
	if count >= capacity:
		return -1
	positions[count] = position
	values[count] = value
	magnetized[count] = 0
	count += 1
	return count - 1


## Drops one droplet per enemy killed this tick, worth that enemy's xp_value.
func spawn_from_deaths(swarm: Swarm) -> void:
	for k: int in swarm.death_count:
		spawn(swarm.death_positions[k], swarm.defs[swarm.death_types[k]].xp_value)


## Moves magnetized droplets toward the hero and collects arrivals. Returns XP collected.
func tick(dt: float, hero_position: Vector2, pickup_radius: float, magnet_speed: float,
		collect_distance: float) -> float:
	var collected: float = 0.0
	var pickup_sq: float = pickup_radius * pickup_radius
	var collect_sq: float = collect_distance * collect_distance
	var i: int = count - 1
	while i >= 0:
		var offset: Vector2 = hero_position - positions[i]
		var d2: float = offset.length_squared()
		if d2 <= collect_sq:
			collected += values[i]
			_swap_remove(i)
		elif magnetized[i] == 1 or d2 <= pickup_sq:
			magnetized[i] = 1
			positions[i] += offset * (magnet_speed * dt / sqrt(d2))
		i -= 1
	return collected


func _swap_remove(i: int) -> void:
	var last: int = count - 1
	if i != last:
		positions[i] = positions[last]
		values[i] = values[last]
		magnetized[i] = magnetized[last]
	count = last
