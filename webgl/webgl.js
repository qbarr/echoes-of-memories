import AnotherScene from './components/AnotherScene';
import MainScene from './components/MainScene';
import TestScene from './components/TestScene';

import { createWebgl, webgl } from './core';


export default createWebgl({
	async setup() {
		const { $renderer } = webgl;
		$renderer.setup({ alias: false, antialias: false });
		$renderer.instance.setClearColor(0x838383, 0);

		webgl.$log('WebGL setup');
	},

	async preload() {

	},

	async start() {
		const { $renderer, $time, $scenes } = webgl;

		$renderer.resize();

		$time.clampTo60fps = false;
		$time.start();

		$scenes.create('main', MainScene);
		$scenes.create('test', TestScene);
		$scenes.create('another', AnotherScene);

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
