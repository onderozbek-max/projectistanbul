extends SceneTree
## Headless simulation benchmark (M0-T3): runs BenchWorld for 60 simulated seconds as fast as
## possible and reports ms per tick. Measures SIMULATION only (no rendering).
## Usage: godot --headless --path game -s res://tools/benchmark/bench_headless.gd


func _init() -> void:
	var world := BenchWorld.new(1)
	var ticks: int = int(BenchWorld.DURATION_S / BenchWorld.TICK)
	var samples := PackedFloat32Array()
	samples.resize(ticks)
	for t: int in ticks:
		var start: int = Time.get_ticks_usec()
		world.step()
		samples[t] = (Time.get_ticks_usec() - start) / 1000.0
	var result: Dictionary = BenchStats.header("headless_sim")
	result["ticks"] = ticks
	result["sim_ms_per_tick"] = BenchStats.summarize(samples)
	result["kills"] = world.kills
	result["xp_collected"] = world.xp
	result["final_enemies"] = world.swarm.count
	result["saved_to"] = BenchStats.save(result)
	print(JSON.stringify(result, "  "))
	quit()
