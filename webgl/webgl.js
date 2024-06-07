import MainScene from './components/Scenes/MainScene';
import UIScene from './components/Scenes/UIScene';

import { createWebgl, webgl } from './core';

import { AudioListener } from 'three';

export default createWebgl({
	async setup() {
		const { $renderer, $scenes, $assets, $gpgpu } = webgl;

		$renderer.setup({ alias: false, antialias: false });
		$renderer.instance.setClearColor(0x000000, 1);


		// console.log($gpgpu)
		$scenes.create('main', MainScene);
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

			load('noises'),
			load('luts'),

			load('boat'),
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
