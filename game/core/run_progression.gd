class_name RunProgression
extends RefCounted
## In-run XP curve and enemy scaling (game-design.md §4.5, §4.6).

## xp_to_next(level) = round(5 + 5 * level^1.4). Level 1 -> 10, level 10 -> 131.
static func xp_to_next(level: int) -> int:
	assert(level >= 1, "run levels start at 1")
	return roundi(5.0 + 5.0 * pow(float(level), 1.4))


## enemy_hp = base * (1 + 0.10 * (level_index - 1)) * (1 + 0.08 * minutes_into_run)
static func enemy_hp(base_hp: float, level_index: int, minutes_into_run: float) -> float:
	return base_hp * (1.0 + 0.10 * float(level_index - 1)) * (1.0 + 0.08 * minutes_into_run)


## enemy_damage = base * (1 + 0.05 * (level_index - 1))
static func enemy_damage(base_damage: float, level_index: int) -> float:
	return base_damage * (1.0 + 0.05 * float(level_index - 1))
