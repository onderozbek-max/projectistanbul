extends GutTest
## Dependency rules (architecture.md §4.17, §5), enforced by scanning source files:
## core is pure; sim never touches presentation or quality settings.

const RULES: Array = [
	# [folder, forbidden substrings, why]
	["res://core", ["res://sim", "res://presentation", "res://meta", "extends Node",
		"EventBus", "Services", "SceneRouter", "QualityProfile"], "core must stay pure (RefCounted rules only)"],
	["res://sim", ["res://presentation", "QualityProfile", "quality_tier", "SceneRouter"],
		"simulation must not depend on presentation or quality tiers (gameplay parity, D-003)"],
	["res://content/defs", ["res://core", "res://sim", "res://presentation"], "defs are the bottom layer"],
]

## Godot 3 APIs that must never appear (architecture.md §8).
const GODOT3_PATTERNS: Array[String] = [
	"KinematicBody2D", "yield(", "onready var", "PoolVector2Array", "PoolIntArray", ".instance()",
	"rand_range(", "stepify(", "OS.get_ticks_msec", "deg2rad(", "Position2D", "VisibilityNotifier2D",
]


func _scripts_under(folder: String) -> Array[String]:
	var files: Array[String] = []
	var dir := DirAccess.open(folder)
	if dir == null:
		return files
	for file: String in dir.get_files():
		if file.ends_with(".gd"):
			files.append(folder.path_join(file))
	for sub: String in dir.get_directories():
		files.append_array(_scripts_under(folder.path_join(sub)))
	return files


func _code_lines(path: String) -> PackedStringArray:
	var lines := PackedStringArray()
	for line: String in FileAccess.get_file_as_string(path).split("\n"):
		if not line.strip_edges().begins_with("#"):  # comments may mention forbidden names
			lines.append(line.split("##")[0])
	return lines


func test_dependency_rules() -> void:
	for rule: Array in RULES:
		for path: String in _scripts_under(rule[0]):
			for line: String in _code_lines(path):
				for forbidden: String in rule[1]:
					assert_false(line.contains(forbidden), "%s uses '%s': %s" % [path, forbidden, rule[2]])


func test_no_godot3_apis_in_project_code() -> void:
	for folder: String in ["res://core", "res://sim", "res://presentation", "res://meta",
			"res://services", "res://autoload", "res://content", "res://tools"]:
		for path: String in _scripts_under(folder):
			for line: String in _code_lines(path):
				for pattern: String in GODOT3_PATTERNS:
					assert_false(line.contains(pattern), "%s uses Godot 3 API '%s'" % [path, pattern])


func test_files_stay_under_600_lines() -> void:
	for folder: String in ["res://core", "res://sim", "res://presentation", "res://meta",
			"res://services", "res://autoload", "res://content", "res://tools", "res://tests"]:
		for path: String in _scripts_under(folder):
			var line_count: int = FileAccess.get_file_as_string(path).count("\n")
			assert_lt(line_count, 600, "%s has %d lines (hard limit 600)" % [path, line_count])
