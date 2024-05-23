import MainScene from './components/Scenes/MainScene';
import UIScene from './components/Scenes/UIScene';

import { createWebgl, webgl } from './core';


export default createWebgl({
	async setup() {
		const { $renderer } = webgl;
		$renderer.setup({ alias: false, antialias: false });
		$renderer.instance.setClearColor(0x838383, 0);

		webgl.$log('WebGL setup');
	},

	async preload() {
		const { load } = webgl.$assets;

		await Promise.all([
			load('msdf-font/VCR_OSD_MONO'),
		]);
	},

	async start() {
		const { $renderer, $time, $scenes } = webgl;

		$renderer.resize();

		$time.clampTo60fps = false;

		$scenes.create('main', MainScene);
		$scenes.create('ui', UIScene);

		webgl.$log('WebGL started');
	},

	update() {
		const { $scenes } = webgl;
		$scenes.update();
	},

	render() {
		const { $scenes } = webgl;
		$scenes.render();
	}
});
