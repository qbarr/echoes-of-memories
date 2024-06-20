import BedroomScene from './components/Scenes/BedroomScene';
import CliniqueScene from './components/Scenes/CliniqueScene';
import TVRoomScene from './components/Scenes/TVRoomScene';
import UIScene from './components/Scenes/UIScene';

import { w } from '#utils/state';
import { POVCamera } from './components/Cameras/POVCamera';
import { createWebgl, webgl } from './core';
import FlashbackMealScene from './components/Scenes/flashbacks/FlashbackMealScene';
import FlashbackTruckScene from './components/Scenes/flashbacks/FlashbackTruckScene';
import FlashbackWarScene from './components/Scenes/flashbacks/FlashbackWarScene';

function createSheets(webgl) {
	const { $theatre, $assets, $app } = webgl;
	const $project = $theatre.get('Common');

	const $letterSheet = $project.getSheet('Letter');
	webgl.$letterSheet = $letterSheet;
	$letterSheet.attachAudio('outro/letter', { disableSubtitles: true });
	const indexes = $app.$store.letterContent.length;
	webgl.$letterTextIndex = w(0);
	$letterSheet.$float('content reveal', webgl.$letterTextIndex, {
		range: [0, indexes + 1],
		nudgeMultiplier: 1,
	});
}

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
		$scenes.create('flashback1', FlashbackMealScene);
		$scenes.create('flashback2', FlashbackTruckScene);
		$scenes.create('flashback3', FlashbackWarScene);
	},

	async preload() {
		const { $theatre, $assets } = webgl;
		const { load } = $assets;

		await Promise.all([
			load('msdf/VCR_OSD_MONO'),

			// Sounds
			load('common/sfx'),
			load('adam/sfx'),
			load('ben/sfx'),
			load('intro'),
			// load('outro'),

			// Subtitles
			load('subtitles'),

			load('outro/audios'),
			load('outro/subtitles'),

			load('interface'),
			load('noises'),
			load('luts'),

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
			load('flashbacks/audios'),
			load('flashbacks/meal/model'),
			load('flashbacks/truck/model'),
			load('flashbacks/war/model'),
			load('flashbacks/subtitles'),

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
		createSheets(webgl);
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
