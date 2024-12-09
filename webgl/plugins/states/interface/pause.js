import { wait } from '#utils/async';

async function enter({ machine, from, to }) {
	const { $scenes, $canvas, $audio } = this.$webgl;
	const { $store } = this.$app;
	const scene = $scenes.ui.component;

	const { $pauseScreenEnter } = scene;

	$store.isPaused = true;
	document.exitPointerLock();

	if (from.id == 'hud') {
		$audio.play('common/glitch', { loop: true, volume: 0.3 });
		$pauseScreenEnter.play();
		await wait(500);
	}

	scene.pauseScreen.show();
}

function update() {}

async function leave({ machine, to }) {
	const { $scenes, $audio } = this.$webgl;
	const scene = $scenes.ui.component;
	const curScene = $scenes.current

	const { $pauseScreenToHud, $pauseScreenToMenu } = scene;

	if (to.id == 'hud') {
		wait(500).then(() => $audio.stopSound('common/glitch'))
		$pauseScreenToHud.play();
		await wait(500);
		scene.pauseScreen.hide();
	} else {
		if (curScene.name !== 'bedroom') return scene.pauseScreen.hide();

		$audio.play('common/short-glitch', { volume: 0.3 });
		$pauseScreenToMenu.play();
		await wait(500);
		scene.pauseScreen.hide();
	}
}

export default { enter, leave, update };
