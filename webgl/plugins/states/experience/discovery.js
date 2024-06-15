import { deferredPromise } from '#utils/async/deferredPromise.js';

const p = (cb) => new Promise((r) => cb(r));

async function enter({ machine, isCanceled }) {
	const {
		$theatre,
		$scenes,
		$raycast,
		$povCamera: camera,
		$lastClickedObject,
	} = this.$webgl;

	const scene = $scenes.clinique.component;
	const { cassette, porte } = scene.interactiveObjects;

	const uiScene = $scenes.ui.component;
	const { subtitles, crosshair } = uiScene;

	camera.$setState('free');
	$raycast.enable();

	// Listen all click
	const dp = deferredPromise();
	let object = null;
	const listen = (obj) => {
		if (!obj) return;
		object = obj;
		dp.resolve();
		$lastClickedObject.unwatch(listen);
		$lastClickedObject.value = null;
	};
	$lastClickedObject.watch(listen);

	await dp;

	let isLastFlashback = false;
	camera.$setState('cinematic');
	$raycast.disable();

	if (!object.isFlashbackObject) {
		const { $introSheet } = object;
		await $introSheet.play();
		if (isCanceled()) return;
	} else {
		const { $introSheet, $flashbackSheet, $outroSheet } = object;

		isLastFlashback = !!object.isLastFlashback;

		await $introSheet.play();
		if (isCanceled()) return;

		// switch to flashback
		await transtionIn.play();
		if (isCanceled()) return;

		await $flashbackSheet.play();
		if (isCanceled()) return;

		if (!isLastFlashback) {
			// switch to bedroom
			await transtionOut.play();
			if (isCanceled()) return;
		} else {
			// switch to tv room
			// if (isCanceled()) return
		}

		await $outroSheet.play();
		if (isCanceled()) return;
	}

	isLastFlashback ? machine.setState('end') : machine.setState(this.id, true);
}
function update() {
	if (!this.webgl.$lastClikedObject) return;

	const o = this.webgl.$lastClikedObject;
}

async function leave({ machine }) {}

export default { enter, leave, update };
