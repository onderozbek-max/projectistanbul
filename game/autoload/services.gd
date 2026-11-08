extends Node
## Small service registry (architecture.md §4.15): gameplay code asks for an interface by name,
## never for a concrete SDK. Fakes are registered in the slice; real adapters replace them later.
## Deliberately not a god object: it only stores and returns services.

var _services: Dictionary[StringName, Object] = {}


## Registers (or replaces) the implementation behind a service name, e.g. &"ads" -> FakeAds.
func register(service_name: StringName, implementation: Object) -> void:
	_services[service_name] = implementation


## Returns the service or null. Callers must handle null so tests can run without services.
func get_service(service_name: StringName) -> Object:
	return _services.get(service_name, null)


func has_service(service_name: StringName) -> bool:
	return _services.has(service_name)
