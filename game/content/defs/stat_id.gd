class_name StatId
extends RefCounted
## Canonical stat names (game-design.md §4.1). Use these constants, never string literals,
## so a typo is a parse error instead of a silent zero.
##
## Percentage stats (MIGHT, AREA, COOLDOWN_REDUCTION, DURATION, LUCK, CRIT_CHANCE, XP_GAIN,
## PLAYER_DAMAGE_REDUCTION) are stored as fractions: 0.10 == +10%. Their base is usually 0,
## so passives grant them with FLAT modifiers (see StatModifier).

const MAX_HP := &"max_hp"
const ARMOR := &"armor"
const MOVE_SPEED := &"move_speed"
const MIGHT := &"might"
const AREA := &"area"
const COOLDOWN_REDUCTION := &"cooldown_reduction"
const PROJECTILE_BONUS := &"projectile_bonus"
const DURATION := &"duration"
const PICKUP_RADIUS := &"pickup_radius"
const LUCK := &"luck"
const CRIT_CHANCE := &"crit_chance"
const CRIT_DAMAGE := &"crit_damage"
const REGEN := &"regen"
const XP_GAIN := &"xp_gain"
const PLAYER_DAMAGE_REDUCTION := &"player_damage_reduction"
