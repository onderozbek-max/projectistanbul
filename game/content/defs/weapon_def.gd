class_name WeaponDef
extends Resource
## Data for one card weapon (content-catalog.md §3). Minimal version: the fields the card
## offer needs. M1-T5 adds behavior_id, base params and WeaponLevelDef deltas.

@export var id: StringName
@export var max_level: int = 5
## The passive that enables this weapon's evolution (game-design.md §5.5). Empty = none.
@export var paired_passive: StringName
## Global level at which the weapon joins the card pool (game-design.md §5.4).
@export var unlock_at_level: int = 1
## The hero's signature weapon is owned from the start and never offered as "new".
@export var is_signature: bool = false
