class_name SwarmConfig
extends Resource
## Tuning for the swarm kernel (architecture.md §4.2). Lives in data so `sim/` has no
## magic numbers and the M0 benchmark can try variants without code changes.

## Spatial hash cell size in meters.
@export var cell_size: float = 1.5
## Neighbors considered for soft separation per enemy per tick (cost cap).
@export var max_separation_neighbors: int = 4
## Separation push strength in m/s at full overlap.
@export var separation_strength: float = 2.0
## Hard population cap (game-design.md: global cap 300 in play; benchmark uses 500).
@export var capacity: int = 500
## Hash table size (power of two). Bigger = fewer collisions, more memory.
@export var hash_table_size: int = 4096
