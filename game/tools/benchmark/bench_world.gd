class_name BenchWorld
extends RefCounted
## The M0 benchmark scenario (architecture.md §7): 500 walkers with separation + 200
## projectiles + 300 XP droplets, populations kept topped up for 60 s while the hero orbits.
## Shared by the headless runner and the on-device scene so both measure the same work.
## (tools/ may hold scenario numbers; sim/ may not.)

const ENEMIES: int = 500
const PROJECTILES: int = 200
const DROPLETS: int = 300
const DURATION_S: float = 60.0
const TICK: float = 1.0 / 60.0
const HERO_ORBIT_RADIUS: float = 4.0
const HERO_SPEED: float = 3.2
const HERO_RADIUS: float = 0.4
const SPAWN_RING: float = 9.0
const SHOT_SPEED: float = 8.0
const SHOT_LIFE: float = 1.2
const SHOT_DAMAGE: float = 4.0
const SHOT_RADIUS: float = 0.2
const SHOT_PIERCE: int = 1
const PICKUP_RADIUS: float = 1.5
const MAGNET_SPEED: float = 8.0
const COLLECT_DISTANCE: float = 0.3
const GOLDEN_ANGLE: float = 2.39996

var swarm: Swarm
var projectiles: ProjectilePool
var pickups: PickupPool
var hero: Vector2 = Vector2.ZERO
var time: float = 0.0
var kills: int = 0
var xp: float = 0.0
var contact_damage: float = 0.0

var _rng := RandomNumberGenerator.new()
var _walker: int
var _shot_angle: float = 0.0


func _init(seed_value: int = 1) -> void:
	_rng.seed = seed_value
	var config: SwarmConfig = load("res://content/packs/istanbul/swarm_default.tres")
	swarm = Swarm.new(config)
	_walker = swarm.register_type(load("res://content/packs/istanbul/enemies/enm_walker.tres"))
	projectiles = ProjectilePool.new(PROJECTILES)
	pickups = PickupPool.new(DROPLETS + ENEMIES)  # headroom for a tick full of kills
	_refill()


## Advances the whole simulation by one fixed tick.
func step() -> void:
	time += TICK
	var angle: float = time * HERO_SPEED / HERO_ORBIT_RADIUS
	hero = Vector2(cos(angle), sin(angle)) * HERO_ORBIT_RADIUS
	swarm.tick(TICK, hero)
	while projectiles.count < PROJECTILES:
		_shot_angle += GOLDEN_ANGLE
		projectiles.spawn(hero, Vector2.from_angle(_shot_angle) * SHOT_SPEED,
			SHOT_DAMAGE, SHOT_RADIUS, SHOT_LIFE, SHOT_PIERCE)
	projectiles.tick(TICK, swarm)
	contact_damage += swarm.collect_contact_damage(hero, HERO_RADIUS)
	kills += swarm.remove_dead()
	pickups.spawn_from_deaths(swarm)
	xp += pickups.tick(TICK, hero, PICKUP_RADIUS, MAGNET_SPEED, COLLECT_DISTANCE)
	_refill()


func is_done() -> bool:
	return time >= DURATION_S


func _refill() -> void:
	while swarm.count < ENEMIES:
		var offset := Vector2.from_angle(_rng.randf() * TAU) * (SPAWN_RING + _rng.randf() * 3.0)
		swarm.spawn(_walker, hero + offset)
	while pickups.count < DROPLETS:
		var offset := Vector2.from_angle(_rng.randf() * TAU) * (2.0 + _rng.randf() * 7.0)
		pickups.spawn(hero + offset, 1.0)
