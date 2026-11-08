extends GutTest
## Swarm kernel behavior (architecture.md §4.2, §4.3): hash correctness, chase, separation,
## swap-remove integrity, projectile hits/pierce, contact-damage throttle, XP pickup.

const WALKER: EnemyDef = preload("res://content/packs/istanbul/enemies/enm_walker.tres")
const CONFIG: SwarmConfig = preload("res://content/packs/istanbul/swarm_default.tres")

var _swarm: Swarm
var _walker: int


func before_each() -> void:
	_swarm = Swarm.new(CONFIG)
	_walker = _swarm.register_type(WALKER)


func test_spatial_hash_finds_every_neighbor_in_radius() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 11
	for i: int in 300:
		_swarm.spawn(_walker, Vector2(rng.randf_range(-20, 20), rng.randf_range(-20, 20)))
	_swarm.hash.rebuild(_swarm.positions, _swarm.count)
	var out := PackedInt32Array()
	out.resize(500)
	var center := Vector2(1.0, -2.0)
	var found: int = _swarm.hash.query(center, 1.5, out, out.size())
	var candidates: Array[int] = []
	for k: int in found:
		candidates.append(out[k])
	for i: int in _swarm.count:
		if _swarm.positions[i].distance_to(center) <= 1.5:
			assert_has(candidates, i, "brute-force neighbor %d missing from hash query" % i)


func test_enemies_move_toward_target() -> void:
	_swarm.spawn(_walker, Vector2(10, 0))
	for t: int in 60:
		_swarm.tick(1.0 / 60.0, Vector2.ZERO)
	assert_almost_eq(_swarm.positions[0].x, 10.0 - WALKER.move_speed, 0.01, "1 s at walker speed")


func test_separation_pushes_overlapping_enemies_apart() -> void:
	_swarm.spawn(_walker, Vector2(0.0, 0.0))
	_swarm.spawn(_walker, Vector2(0.1, 0.0))
	for t: int in 30:
		_swarm.tick(1.0 / 60.0, Vector2(0, 100))  # far target, same direction for both
	var gap: float = absf(_swarm.positions[0].x - _swarm.positions[1].x)
	assert_gt(gap, 0.3, "bodies (r 0.35) should have separated from 0.1 m")


func test_remove_dead_swap_removes_and_fills_death_buffers() -> void:
	for i: int in 5:
		_swarm.spawn(_walker, Vector2(i, 0))
	_swarm.apply_damage(1, 100.0)
	_swarm.apply_damage(3, 100.0)
	assert_eq(_swarm.remove_dead(), 2)
	assert_eq(_swarm.count, 3)
	var xs: Array[float] = []
	for i: int in _swarm.count:
		xs.append(_swarm.positions[i].x)
	xs.sort()
	assert_eq(xs, [0.0, 2.0, 4.0] as Array[float], "survivors keep their own data")
	assert_eq(_swarm.death_count, 2)


func test_capacity_is_respected() -> void:
	for i: int in CONFIG.capacity:
		_swarm.spawn(_walker, Vector2.ZERO)
	assert_eq(_swarm.spawn(_walker, Vector2.ZERO), -1)


func test_contact_damage_is_throttled_per_enemy() -> void:
	_swarm.spawn(_walker, Vector2(0.2, 0))
	_swarm.hash.rebuild(_swarm.positions, _swarm.count)
	assert_eq(_swarm.collect_contact_damage(Vector2.ZERO, 0.4), WALKER.contact_damage)
	assert_eq(_swarm.collect_contact_damage(Vector2.ZERO, 0.4), 0.0, "0.5 s cooldown")


func test_projectile_hits_and_pierce() -> void:
	_swarm.spawn(_walker, Vector2(1.0, 0))
	_swarm.spawn(_walker, Vector2(2.0, 0))
	_swarm.hash.rebuild(_swarm.positions, _swarm.count)
	var pool := ProjectilePool.new(10)
	pool.spawn(Vector2.ZERO, Vector2(30, 0), 4.0, 0.2, 1.0, 1)  # pierce 1 = 2 hits total
	var hits: int = 0
	for t: int in 10:
		hits += pool.tick(1.0 / 60.0, _swarm)
	assert_eq(hits, 2)
	assert_eq(pool.count, 0, "spent after its last pierce")
	assert_almost_eq(_swarm.hp[0], WALKER.max_hp - 4.0, 0.001)


func test_kills_drop_xp_that_flies_to_the_hero() -> void:
	_swarm.spawn(_walker, Vector2(1.0, 0))
	_swarm.apply_damage(0, 100.0)
	_swarm.remove_dead()
	var pickups := PickupPool.new(10)
	pickups.spawn_from_deaths(_swarm)
	assert_eq(pickups.count, 1)
	var xp: float = 0.0
	for t: int in 60:
		xp += pickups.tick(1.0 / 60.0, Vector2.ZERO, 1.5, 8.0, 0.3)
	assert_eq(xp, WALKER.xp_value)
	assert_eq(pickups.count, 0)
