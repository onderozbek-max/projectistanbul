class_name SwarmRenderer
extends MultiMeshInstance2D
## Draws every entity of one kind with ONE draw call (architecture.md §4.2): positions are
## copied from sim arrays into a MultiMesh buffer each frame, interpolated between the last
## two sim ticks for smooth motion at any frame rate. Reads sim state; never mutates it.

## Floats per instance for a 2D transform in MultiMesh.buffer:
## [x.x, y.x, pad, origin.x, x.y, y.y, pad, origin.y]
const FLOATS_PER_INSTANCE: int = 8

var pixels_per_meter: float = 32.0
var _buffer: PackedFloat32Array


## Creates the MultiMesh: a disc of `diameter_m` meters tinted `color`, up to `capacity`.
func setup(capacity: int, diameter_m: float, color: Color, ppm: float) -> void:
	pixels_per_meter = ppm
	var quad := QuadMesh.new()
	quad.size = Vector2.ONE * diameter_m * ppm
	multimesh = MultiMesh.new()
	multimesh.transform_format = MultiMesh.TRANSFORM_2D
	multimesh.mesh = quad
	multimesh.instance_count = capacity
	multimesh.visible_instance_count = 0
	texture = _make_disc_texture(32)
	modulate = color
	_buffer.resize(capacity * FLOATS_PER_INSTANCE)
	for i: int in capacity:  # identity basis once; per frame we only write origins
		var o: int = i * FLOATS_PER_INSTANCE
		_buffer[o] = 1.0
		_buffer[o + 5] = 1.0


## Copies `count` interpolated positions (meters) into the GPU buffer.
func sync(current: PackedVector2Array, previous: PackedVector2Array, count: int, alpha: float) -> void:
	var ppm: float = pixels_per_meter
	for i: int in count:
		var p: Vector2 = previous[i].lerp(current[i], alpha)
		var o: int = i * FLOATS_PER_INSTANCE
		_buffer[o + 3] = p.x * ppm
		_buffer[o + 7] = p.y * ppm
	multimesh.buffer = _buffer
	multimesh.visible_instance_count = count


static func _make_disc_texture(size: int) -> ImageTexture:
	var image := Image.create(size, size, false, Image.FORMAT_RGBA8)
	var center := Vector2(size, size) * 0.5
	var radius: float = size * 0.5 - 1.0
	for y: int in size:
		for x: int in size:
			var d: float = Vector2(x + 0.5, y + 0.5).distance_to(center)
			var alpha: float = clampf(radius - d + 0.5, 0.0, 1.0)  # 1 px anti-aliased edge
			image.set_pixel(x, y, Color(1, 1, 1, alpha))
	return ImageTexture.create_from_image(image)
