import { AudioListener } from 'three';

import BedroomScene from './components/Scenes/BedroomScene';
import UIScene from './components/Scenes/UIScene';

import { createWebgl, webgl } from './core';

// import core from '@theatre/core';
// import studio from '@theatre/studio';

// studio.initialize({
// 	persistenceKey: 'EOM:theatrejs',
// 	usePersistentStorage: true,
// });

export default createWebgl({
	async setup() {
		const { $renderer, $scenes, $assets } = webgl;

		$renderer.setup({ alias: false, antialias: false });
		$renderer.instance.setClearColor(0x000000, 0);

		$scenes.create('bedroom', BedroomScene);
		$scenes.create('ui', UIScene);
	},

	async preload() {
		const { load } = webgl.$assets;
		const { $sounds, $subtitles } = webgl;

		webgl.$audioListener = new AudioListener();

		// prettier-ignore
		await Promise.all([
			load('msdf-font/VCR_OSD_MONO'),

			// load sounds
			load('sound/positions'),
			load('sound/vocals'),

			// load subtitles
			load('subtitles'),

			load('interface'),
			load('noises'),
			load('luts'),

			// Chambre
			load('chambre-model'),
			load('chambre/textures'),
		]);

		console.log('LOADED', webgl);
	},

	async start() {
		const { $renderer } = webgl;
		$renderer.resize();
	},

	update() {
		const { $scenes } = webgl;
		$scenes.update();
	},

	render() {
		const { $composer } = webgl;
		$composer.render();
	},
});
