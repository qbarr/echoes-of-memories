import { wait } from '#utils/async';

async function enter({ machine, from }) {
	const { $theatre, $scenes, $canvas } = this.$webgl;
	const { $store } = this.$app;
	const scene = $scenes.ui.component;

	if (!from || from.id === 'pause') {
		await wait(200);
		scene.hudScreen.show();
	}

	document.body.style.cursor = 'default';
	$store.isPaused = false;

	scene.hudScreen.show();

	const currentCam = scene.getCurrentCamera();
	if (!$store.pointerLocked && currentCam.name !== 'Debug Camera') {
		$canvas.requestPointerLock();
	}
}

function update() {}

async function leave({ machine }) {
	const { $theatre, $scenes } = this.$webgl;

	const scene = $scenes.ui.component;
	scene.hudScreen.hide();
}

export default { enter, leave, update };
