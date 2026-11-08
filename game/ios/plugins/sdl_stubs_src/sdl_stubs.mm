// Workaround for Godot 4.7.2 iOS export templates: libgodot.a's bundled SDL (joypad driver)
// references SDL_IsIPad / SDL_IsAppleTV, which live in SDL's UIKit video backend that the
// template does not compile. Remove this plugin once an upstream template links cleanly.
#import <UIKit/UIKit.h>

extern "C" bool SDL_IsIPad(void) {
	return [UIDevice currentDevice].userInterfaceIdiom == UIUserInterfaceIdiomPad;
}

extern "C" bool SDL_IsAppleTV(void) {
	return false;
}

// Godot requires plugin init/deinit entry points (C++ linkage); nothing to do here.
void sdl_stubs_init() {}
void sdl_stubs_deinit() {}
