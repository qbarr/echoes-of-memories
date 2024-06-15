import { AudioListener } from 'three';

import ParticleScene from './components/Scenes/ParticleScene';
import BedroomScene from './components/Scenes/BedroomScene';
import CliniqueScene from './components/Scenes/CliniqueScene';
import UIScene from './components/Scenes/UIScene';
import TVRoomScene from './components/Scenes/TVRoomScene';

import { POVCamera } from './components/Cameras/POVCamera';
import { createWebgl, webgl } from './core';
import { w } from '#utils/state/index.js';

export default createWebgl({
	async setup() {
		const { $renderer, $scenes, $assets, $gpgpu } = webgl;

		$renderer.setup({ alias: false, antialias: false });
		$renderer.instance.setClearColor(0x000000, 0);

		webgl.$povCamera = new POVCamera();

		$scenes.create('clinique', CliniqueScene, { default: true });
		$scenes.create('tv-room', TVRoomScene);
		$scenes.create('bedroom', BedroomScene);
		$scenes.create('ui', UIScene);
		$scenes.create('particle', ParticleScene);

		webgl.$lastClickedObject = w(null);
	},

	async preload() {
		const { $theatre, $assets } = webgl;
		const { load } = $assets;

		await Promise.all([
			load('msdf/VCR_OSD_MONO'),

			// Sounds
			load('positions'),
			load('vocals'),
			load('sfx'),

			// Subtitles
			load('subtitles'),

			load('interface'),
			load('noises'),
			load('luts'),

			load('boat'),

			// Clinique
			load('clinique/model'),
			load('clinique/textures'),
			load('clinique/audios'),
			load('clinique/subtitles'),

			// TV Room
			load('tv-room/model'),
			load('tv-room/textures'),
			load('tv-room/audios'),
			load('tv-room/subtitles'),

			// Bedroom
			load('bedroom/model'),
			load('bedroom/textures'),
			load('bedroom/audios'),
			load('bedroom/subtitles'),

			// Flashback
			load('flashback/audios'),

			// Theatre
			load('theatre'),
		]);

		/// #if __DEBUG__
		// Only await for the theatre project in studio mode
		await $theatre.ready;
		/// #endif
	},

	async start() {
		const { $renderer } = webgl;
		$renderer.resize();
	},

	update() {
		const { $scenes, $composer } = webgl;
		$composer.update();
		$scenes.update();
	},

	render() {
		const { $composer, $gpgpu } = webgl;
		$composer.render();
		$gpgpu.render();
	},
});
