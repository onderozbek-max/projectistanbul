class_name PassiveDef
extends Resource
## Data for one passive item (content-catalog.md §3). Minimal version for the card offer;
## M2 adds the per-level StatModifier lists.

@export var id: StringName
@export var max_level: int = 5
## Global level at which the passive joins the card pool (game-design.md §5.4).
@export var unlock_at_level: int = 1
