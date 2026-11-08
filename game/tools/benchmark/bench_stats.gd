class_name BenchStats
extends RefCounted
## Percentile summaries + the results JSON shared by the headless and device benchmarks.

## Returns {p50, p95, p99, max, mean} in the samples' unit.
static func summarize(samples: PackedFloat32Array) -> Dictionary:
	if samples.is_empty():
		return {"p50": 0.0, "p95": 0.0, "p99": 0.0, "max": 0.0, "mean": 0.0}
	var sorted := samples.duplicate()
	sorted.sort()
	var total: float = 0.0
	for s: float in sorted:
		total += s
	return {
		"p50": _round(sorted[int(sorted.size() * 0.50)]),
		"p95": _round(sorted[mini(int(sorted.size() * 0.95), sorted.size() - 1)]),
		"p99": _round(sorted[mini(int(sorted.size() * 0.99), sorted.size() - 1)]),
		"max": _round(sorted[sorted.size() - 1]),
		"mean": _round(total / sorted.size()),
	}


## Common header for every results file, so files from different devices compare cleanly.
static func header(kind: String) -> Dictionary:
	return {
		"kind": kind,
		"engine": Engine.get_version_info().string,
		"os": OS.get_name(),
		"device_model": OS.get_model_name(),
		"processor": OS.get_processor_name(),
		"date": Time.get_datetime_string_from_system(true),
		"scenario": {"enemies": BenchWorld.ENEMIES, "projectiles": BenchWorld.PROJECTILES,
			"droplets": BenchWorld.DROPLETS, "seconds": BenchWorld.DURATION_S},
		"budget_sim_ms_per_tick": 4.0,
	}


## Writes JSON to user://bench/ and returns the absolute path (shown on screen on device).
static func save(result: Dictionary) -> String:
	DirAccess.make_dir_recursive_absolute("user://bench")
	var file_name: String = "bench_%s_%d.json" % [result.get("kind", "run"), int(Time.get_unix_time_from_system())]
	var path: String = "user://bench".path_join(file_name)
	var file := FileAccess.open(path, FileAccess.WRITE)
	file.store_string(JSON.stringify(result, "  "))
	file.close()
	return ProjectSettings.globalize_path(path)


static func _round(value: float) -> float:
	return snappedf(value, 0.001)
