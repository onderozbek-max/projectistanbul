class_name TextUtil
extends RefCounted
## Locale-aware casing (architecture.md §4.18, design-system.md §10). Godot's to_upper() is
## locale-blind: "istanbul".to_upper() == "ISTANBUL", but Turkish needs "İSTANBUL".
## Turkish has dotted i/İ and dotless ı/I as separate letters.

const TURKISH_LOCALES: Array[String] = ["tr", "az"]  # Azerbaijani shares the rule


static func upper(text: String, locale: String) -> String:
	if _is_turkic(locale):
		text = text.replace("i", "İ").replace("ı", "I")
	return text.to_upper()


static func lower(text: String, locale: String) -> String:
	if _is_turkic(locale):
		text = text.replace("I", "ı").replace("İ", "i")
	return text.to_lower()


static func _is_turkic(locale: String) -> bool:
	return TURKISH_LOCALES.has(locale.substr(0, 2).to_lower())
