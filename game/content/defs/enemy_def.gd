class_name EnemyDef
extends Resource
## Data for one enemy type (content-catalog.md §5). Minimal M0 version: the fields the swarm
## needs. M1+ adds behavior ids, attacks, resistances, atlas refs. Units: meters, seconds.

@export var id: StringName
@export var max_hp: float = 10.0
@export var move_speed: float = 1.2
## Body radius used for separation and hit tests.
@export var radius: float = 0.35
@export var contact_damage: float = 5.0
@export var xp_value: float = 1.0
