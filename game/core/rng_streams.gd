class_name RngStreams
extends RefCounted
## One run seed -> independent RNG streams (architecture.md §4.10), so changing loot code
## never changes spawn sequences, and a seed + inputs reproduces a run on the same device.

const SPAWN := &"spawn"
const LOOT := &"loot"
const CARDS := &"cards"
const COMBAT := &"combat"
const AI := &"ai"
const ALL: Array[StringName] = [SPAWN, LOOT, CARDS, COMBAT, AI]

var run_seed: int
var _streams: Dictionary[StringName, RandomNumberGenerator] = {}


func _init(p_run_seed: int) -> void:
	run_seed = p_run_seed
	for stream_name: StringName in ALL:
		var rng := RandomNumberGenerator.new()
		rng.seed = hash("%d:%s" % [run_seed, stream_name])
		_streams[stream_name] = rng


## Returns the named stream. Unknown names are a programming error.
func stream(stream_name: StringName) -> RandomNumberGenerator:
	assert(_streams.has(stream_name), "unknown RNG stream: %s" % stream_name)
	return _streams[stream_name]
