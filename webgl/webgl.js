import { AudioListener } from 'three';

import ParticleScene from './components/Scenes/ParticleScene';
import BedroomScene from './components/Scenes/BedroomScene';
import CliniqueScene from './components/Scenes/CliniqueScene';
import UIScene from './components/Scenes/UIScene';

import { POVCamera } from './components/Cameras/POVCamera';
import { createWebgl, webgl } from './core';

export default createWebgl({
	async setup() {
		const { $renderer, $scenes, $assets, $gpgpu } = webgl;

		$renderer.setup({ alias: false, antialias: false });
		$renderer.instance.setClearColor(0x000000, 0);

		webgl.$povCamera = new POVCamera();

		$scenes.create('bedroom', BedroomScene);
		$scenes.create('clinique', CliniqueScene, { default: true });
		$scenes.create('ui', UIScene);
		$scenes.create('particle', ParticleScene);
	},

	async preload() {
		const { load } = webgl.$assets;
		const { $sounds, $theatre } = webgl;

		webgl.$audioListener = new AudioListener();

		await Promise.all([
			load('msdf-font/VCR_OSD_MONO'),

			// Sounds
			load('sound/positions'),
			load('sound/vocals'),

			// Subtitles
			load('subtitles'),

			load('interface'),
			load('noises'),
			load('luts'),

			load('boat'),
			// Chambre
			load('chambre-model'),
			load('chambre/textures'),

			// Clinique
			load('clinique-model'),
			load('clinique/textures'),

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
		$gpgpu.render()
	},
});
