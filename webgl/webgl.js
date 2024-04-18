import Scene from './components/Scene';
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

		$scenes.main = new Scene();
		$scenes.main.triggerInit();

		webgl.$log('WebGL started');
	},

	update() {
		const { $scenes } = webgl;
		const scene = $scenes.main;
		if (!scene) return;
		scene.triggerUpdate();
	},

	render() {
		const { $scenes } = webgl;
		const scene = $scenes.main;
		if (!scene) return;
		scene.triggerRender();
	}
});
