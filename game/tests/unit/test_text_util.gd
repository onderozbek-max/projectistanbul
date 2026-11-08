extends GutTest
## architecture.md §4.18: Turkish casing must not use the locale-blind built-ins.


func test_turkish_upper_uses_dotted_capital_i() -> void:
	assert_eq(TextUtil.upper("istanbul", "tr"), "İSTANBUL")
	assert_eq(TextUtil.upper("ılık", "tr_TR"), "ILIK")


func test_turkish_lower_uses_dotless_i() -> void:
	assert_eq(TextUtil.lower("ILIK", "tr"), "ılık")
	assert_eq(TextUtil.lower("İSTANBUL", "tr"), "istanbul")


func test_english_is_unchanged_behavior() -> void:
	assert_eq(TextUtil.upper("istanbul", "en"), "ISTANBUL")
	assert_eq(TextUtil.lower("ISTANBUL", "en"), "istanbul")


func test_glyph_test_string_round_trips() -> void:
	assert_eq(TextUtil.upper("çatal şangır", "tr"), "ÇATAL ŞANGIR")
