extends Node
## Game-flow state machine (architecture.md §4.8):
## Boot -> MainMenu -> WorldMap -> PreStory -> Run -> Results -> PostStory -> WorldMap.
## Owns WHICH screen is active; screens own their own contents.

signal flow_changed(from_state: Flow, to_state: Flow)

enum Flow { BOOT, MAIN_MENU, WORLD_MAP, PRE_STORY, RUN, RESULTS, POST_STORY }

## Allowed transitions. Anything else is a bug and is refused loudly.
const TRANSITIONS: Dictionary = {
	Flow.BOOT: [Flow.MAIN_MENU, Flow.PRE_STORY],  # first launch skips the menu (cold open)
	Flow.MAIN_MENU: [Flow.WORLD_MAP],
	Flow.WORLD_MAP: [Flow.PRE_STORY, Flow.RUN, Flow.MAIN_MENU],
	Flow.PRE_STORY: [Flow.RUN],
	Flow.RUN: [Flow.RESULTS, Flow.WORLD_MAP],
	Flow.RESULTS: [Flow.POST_STORY, Flow.WORLD_MAP, Flow.RUN],
	Flow.POST_STORY: [Flow.WORLD_MAP],
}

var current: Flow = Flow.BOOT


## Moves to the next flow state. Returns false (and logs) on an illegal transition.
func go_to(next: Flow) -> bool:
	var allowed: Array = TRANSITIONS.get(current, [])
	if not allowed.has(next):
		push_error("SceneRouter: illegal transition %s -> %s" % [Flow.keys()[current], Flow.keys()[next]])
		return false
	var previous: Flow = current
	current = next
	flow_changed.emit(previous, next)
	return true
