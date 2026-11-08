class_name SpatialHash
extends RefCounted
## Uniform-grid spatial hash for the swarm, projectiles and pickups (architecture.md §4.2).
## Rebuilt every tick with a counting sort into flat packed arrays: no Dictionary, no
## per-cell arrays, no allocations after construction. Unbounded world: cells are hashed
## into a fixed power-of-two table, so callers must still distance-check every candidate.

## Max distinct table keys one query may visit (a 3x3 neighborhood needs 9).
const MAX_QUERY_KEYS: int = 64

var cell_size: float
var _inv_cell: float
var _mask: int
var _table_size: int
var _cell_start: PackedInt32Array  # size table+1: first item index per key (prefix sums)
var _cursor: PackedInt32Array      # size table: counts, then write cursors during the fill
var _items: PackedInt32Array       # entity indices grouped by key
var _item_key: PackedInt32Array    # key of each entity, cached between passes
var _visited: PackedInt32Array     # keys already scanned by the current query


func _init(p_cell_size: float, p_table_size: int, p_capacity: int) -> void:
	assert(p_table_size > 0 and (p_table_size & (p_table_size - 1)) == 0, "table size must be a power of two")
	cell_size = p_cell_size
	_inv_cell = 1.0 / p_cell_size
	_table_size = p_table_size
	_mask = p_table_size - 1
	_cell_start.resize(p_table_size + 1)
	_cursor.resize(p_table_size)
	_items.resize(p_capacity)
	_item_key.resize(p_capacity)
	_visited.resize(MAX_QUERY_KEYS)


## Re-buckets the first `count` positions. Call once per tick before any query.
func rebuild(positions: PackedVector2Array, count: int) -> void:
	_cursor.fill(0)
	for i: int in count:
		var p: Vector2 = positions[i]
		var key: int = _key(floori(p.x * _inv_cell), floori(p.y * _inv_cell))
		_item_key[i] = key
		_cursor[key] += 1
	var running: int = 0
	for key: int in _table_size:
		_cell_start[key] = running
		running += _cursor[key]
		_cursor[key] = _cell_start[key]
	_cell_start[_table_size] = running
	for i: int in count:
		var key: int = _item_key[i]
		_items[_cursor[key]] = i
		_cursor[key] += 1


## Writes candidate indices near `center` into `out` (passed by reference) and returns how many.
## Candidates may be outside `radius` (hash collisions); callers distance-check.
func query(center: Vector2, radius: float, out: PackedInt32Array, max_results: int) -> int:
	var min_x: int = floori((center.x - radius) * _inv_cell)
	var max_x: int = floori((center.x + radius) * _inv_cell)
	var min_y: int = floori((center.y - radius) * _inv_cell)
	var max_y: int = floori((center.y + radius) * _inv_cell)
	var found: int = 0
	var visited_count: int = 0
	for cy: int in range(min_y, max_y + 1):
		var row_hash: int = cy * 19349663
		for cx: int in range(min_x, max_x + 1):
			var key: int = ((cx * 73856093) ^ row_hash) & _mask  # inlined _key(): hot loop
			var seen: bool = false
			for v: int in visited_count:
				if _visited[v] == key:
					seen = true
					break
			if seen:
				continue  # two cells hashed to the same key: scan it once
			if visited_count < MAX_QUERY_KEYS:
				_visited[visited_count] = key
				visited_count += 1
			for j: int in range(_cell_start[key], _cell_start[key + 1]):
				if found >= max_results:
					return found
				out[found] = _items[j]
				found += 1
	return found


func _key(cx: int, cy: int) -> int:
	return ((cx * 73856093) ^ (cy * 19349663)) & _mask
