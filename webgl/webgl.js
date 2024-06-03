import MainScene from './components/Scenes/MainScene';
import UIScene from './components/Scenes/UIScene';

import { createWebgl, webgl } from './core';

export default createWebgl({
	async setup() {
		const { $renderer, $scenes, $assets } = webgl;

		$renderer.setup({ alias: false, antialias: false });
		$renderer.instance.setClearColor(0x000000, 0);

		$scenes.create('main', MainScene);
		$scenes.create('ui', UIScene);
	},

	async preload() {
		const { load } = webgl.$assets;

		// prettier-ignore
		await Promise.all([
			load('msdf-font/VCR_OSD_MONO'),
			load('noises'),
			load('luts'),
			load('scene1'),
			load('chambre'),
		]);
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
