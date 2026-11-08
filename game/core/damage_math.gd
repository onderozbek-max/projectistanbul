class_name DamageMath
extends RefCounted
## Damage formulas from game-design.md §4.3, implemented once. Floats all the way down;
## rounding happens only for display (damage numbers).

## Enemies deal contact damage at most this often (seconds, per enemy).
const CONTACT_TICK_INTERVAL: float = 0.5
## A hit of at least this fraction of max HP grants the player brief invulnerability...
const INVULN_HIT_FRACTION: float = 0.10
## ...lasting this long (seconds). Prevents swarm "melt" spikes.
const INVULN_DURATION: float = 0.25
## Incoming damage never drops below this after armor.
const MIN_INCOMING: float = 1.0


## Returns crit_damage if the roll crits, else 1.0. Uses the caller's stream (the `combat` RNG)
## so crits never disturb spawn or loot sequences.
static func roll_crit(rng: RandomNumberGenerator, crit_chance: float, crit_damage: float) -> float:
	return crit_damage if rng.randf() < crit_chance else 1.0


## outgoing = weapon_damage * (1 + might) * crit * (1 + vulnerability) * (1 - damage_reduction)
static func outgoing(weapon_damage: float, might: float, crit_multiplier: float,
		target_vulnerability: float = 0.0, target_damage_reduction: float = 0.0) -> float:
	return weapon_damage * (1.0 + might) * crit_multiplier \
		* (1.0 + target_vulnerability) * (1.0 - target_damage_reduction)


## incoming = max(1, raw - armor) * (1 - player_damage_reduction), reduction capped at 75%.
static func incoming_to_player(raw: float, armor: float, player_damage_reduction: float) -> float:
	var reduction: float = StatCaps.apply(StatId.PLAYER_DAMAGE_REDUCTION, player_damage_reduction, 0.0)
	return maxf(MIN_INCOMING, raw - armor) * (1.0 - reduction)


## True if this hit should trigger the post-hit invulnerability window.
static func grants_invulnerability(damage_taken: float, max_hp: float) -> bool:
	return damage_taken >= max_hp * INVULN_HIT_FRACTION
