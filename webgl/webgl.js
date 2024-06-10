import MainScene from './components/Scenes/MainScene';
import { AudioListener } from 'three';

import ParticleScene from './components/Scenes/ParticleScene';
import BedroomScene from './components/Scenes/BedroomScene';
import CliniqueScene from './components/Scenes/CliniqueScene';
import UIScene from './components/Scenes/UIScene';

import { POVCamera } from './components/Cameras/POVCamera';
import { createWebgl, webgl } from './core';

// const dummy = {
// 	number: types.number(0, { range: [0, 100] }),
// 	string: 'hello',
// 	boolean: false,
// 	position: { dum: { a: 0, b: 'sdhj' }, x: 0, y: 0, z: 0 },
// };
// const dummy2 = {
// 	number: 17,
// 	string: 'world',
// 	boolean: true,
// 	position: { x: 0, y: 0, z: 0 },
// };

// const project = getProject('Echoes Of Memories');
// const sheet = project.sheet('dummy');
// const dum = sheet.object('dummy', dummy);
// const dum2 = sheet.object('dummy2', dummy2);

export default createWebgl({
	async setup() {
		const { $renderer, $scenes, $assets, $gpgpu } = webgl;

		$renderer.setup({ alias: false, antialias: false });
		$renderer.instance.setClearColor(0x000000, 1);

		webgl.$povCamera = new POVCamera();

		$scenes.create('bedroom', BedroomScene);
		$scenes.create('clinique', CliniqueScene, { default: true });
		$scenes.create('ui', UIScene);
		$scenes.create('particle', ParticleScene);
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

			load('boat'),
			// Chambre
			load('chambre-model'),
			load('chambre/textures'),

			// Clinique
			load('clinique-model'),
			load('clinique/textures'),
		]);

		console.log('LOADED', webgl);
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
		const { $composer } = webgl;
		$composer.render();
	},
});
