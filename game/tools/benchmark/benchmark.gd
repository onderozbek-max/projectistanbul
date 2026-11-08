extends Node2D
## On-device benchmark (M0-T3/T4): BenchWorld simulated at 60 Hz in _physics_process,
## rendered with MultiMesh, overlay with live numbers, results JSON after 60 s.
## Desktop flags (after `--`): --seconds=N (shorter run), --shot=/path.png (screenshot + quit).

const PIXELS_PER_METER: float = 32.5  # 390 pt wide viewport ~= 12 m, the Level 1 camera
const WARMUP_S: float = 2.0
const OVERLAY_REFRESH_S: float = 0.25
const ENEMY_COLOR := Color("4E5A44")
const PROJECTILE_COLOR := Color("F2F2F2")
const DROPLET_COLOR := Color("5BD16E")
const HERO_COLOR := Color("D7263D")
const HERO_RING_COLOR := Color("3DDCFF")

var _world: BenchWorld
var _enemies: SwarmRenderer
var _shots: SwarmRenderer
var _droplets: SwarmRenderer
var _camera: Camera2D
var _label: Label
var _sim_ms := PackedFloat32Array()
var _frame_ms := PackedFloat32Array()
var _overlay_timer: float = 0.0
var _duration_s: float = BenchWorld.DURATION_S
var _shot_path: String = ""
var _finished: bool = false


func _ready() -> void:
	_parse_args()
	_world = BenchWorld.new(1)
	RenderingServer.set_default_clear_color(Color("8A8F98"))
	_droplets = _add_renderer(_world.pickups.capacity, 0.18, DROPLET_COLOR)
	_enemies = _add_renderer(_world.swarm.capacity, 0.7, ENEMY_COLOR)
	_shots = _add_renderer(_world.projectiles.capacity, 0.3, PROJECTILE_COLOR)
	_camera = Camera2D.new()
	add_child(_camera)
	_build_overlay()


func _physics_process(_delta: float) -> void:
	if _finished:
		return
	var start: int = Time.get_ticks_usec()
	_world.step()
	if _world.time > WARMUP_S:
		_sim_ms.append((Time.get_ticks_usec() - start) / 1000.0)
	if _world.time >= _duration_s:
		_finish()


func _process(delta: float) -> void:
	var alpha: float = Engine.get_physics_interpolation_fraction()
	_enemies.sync(_world.swarm.positions, _world.swarm.prev_positions, _world.swarm.count, alpha)
	_shots.sync(_world.projectiles.positions, _world.projectiles.prev_positions, _world.projectiles.count, alpha)
	_droplets.sync(_world.pickups.positions, _world.pickups.positions, _world.pickups.count, 1.0)
	_camera.position = _world.hero * PIXELS_PER_METER
	queue_redraw()
	if _world.time > WARMUP_S and not _finished:
		_frame_ms.append(delta * 1000.0)
	_overlay_timer -= delta
	if _overlay_timer <= 0.0 and not _finished:
		_overlay_timer = OVERLAY_REFRESH_S
		_label.text = _overlay_text()


func _draw() -> void:
	var hero_px: Vector2 = _world.hero * PIXELS_PER_METER
	draw_arc(hero_px, 0.55 * PIXELS_PER_METER, 0.0, TAU, 32, HERO_RING_COLOR, 3.0)
	draw_circle(hero_px, BenchWorld.HERO_RADIUS * PIXELS_PER_METER, HERO_COLOR)


func _add_renderer(capacity: int, diameter_m: float, color: Color) -> SwarmRenderer:
	var renderer := SwarmRenderer.new()
	renderer.setup(capacity, diameter_m, color, PIXELS_PER_METER)
	add_child(renderer)
	return renderer


func _build_overlay() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	var panel := PanelContainer.new()
	panel.position = Vector2(8, 60)  # below the Dynamic Island safe area
	layer.add_child(panel)
	_label = Label.new()
	_label.add_theme_font_size_override("font_size", 13)
	panel.add_child(_label)


func _overlay_text() -> String:
	var recent: PackedFloat32Array = _frame_ms.slice(maxi(0, _frame_ms.size() - 120))
	var frame: Dictionary = BenchStats.summarize(recent)
	var sim: Dictionary = BenchStats.summarize(_sim_ms.slice(maxi(0, _sim_ms.size() - 120)))
	return "FPS %d | frame p50 %.1f p95 %.1f ms\nsim p50 %.2f p95 %.2f ms/tick\nenemies %d  shots %d  xp %d\ndraw calls %d | t %.0f / %.0f s" % [
		Engine.get_frames_per_second(), frame.p50, frame.p95, sim.p50, sim.p95,
		_world.swarm.count, _world.projectiles.count, _world.pickups.count,
		Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME), _world.time, _duration_s]


func _finish() -> void:
	_finished = true
	var result: Dictionary = BenchStats.header("device_render", _duration_s)
	result["sim_ms_per_tick"] = BenchStats.summarize(_sim_ms)
	result["frame_ms"] = BenchStats.summarize(_frame_ms)
	result["static_memory_mb"] = snappedf(OS.get_static_memory_usage() / 1048576.0, 0.1)
	result["draw_calls_last_frame"] = Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)
	result["screen"] = str(DisplayServer.screen_get_size())
	result["kills"] = _world.kills
	var path: String = BenchStats.save(result)
	print(JSON.stringify(result, "  "))
	_label.text = "DONE\nframe p95 %.1f ms | sim p95 %.2f ms\nSaved: %s" % [result.frame_ms.p95, result.sim_ms_per_tick.p95, path]
	if not _shot_path.is_empty():
		await RenderingServer.frame_post_draw
		get_viewport().get_texture().get_image().save_png(_shot_path)
		get_tree().quit()


func _parse_args() -> void:
	for arg: String in OS.get_cmdline_user_args():
		if arg.begins_with("--seconds="):
			_duration_s = float(arg.get_slice("=", 1))
		elif arg.begins_with("--shot="):
			_shot_path = arg.get_slice("=", 1)
