class_name StatCaps
extends RefCounted
## Hard caps from game-design.md §4.4. Rules, not content, so they live in core as constants.
## Absolute caps clamp the final value; relative caps clamp the bonus over the base.

## Final value may not exceed these.
const ABSOLUTE: Dictionary[StringName, float] = {
	StatId.COOLDOWN_REDUCTION: 0.60,
	StatId.AREA: 2.00,  # +200% radius/length bonus
	StatId.CRIT_CHANCE: 1.00,
	StatId.PROJECTILE_BONUS: 5.0,
	StatId.PLAYER_DAMAGE_REDUCTION: 0.75,
}

## Final value may not exceed base * (1 + cap).
const BONUS_OVER_BASE: Dictionary[StringName, float] = {
	StatId.MOVE_SPEED: 1.00,  # +100%
}


## Applies whichever cap exists for the stat. Unknown stats pass through unchanged.
static func apply(stat: StringName, value: float, base: float) -> float:
	if ABSOLUTE.has(stat):
		return minf(value, ABSOLUTE[stat])
	if BONUS_OVER_BASE.has(stat):
		return minf(value, base * (1.0 + BONUS_OVER_BASE[stat]))
	return value
