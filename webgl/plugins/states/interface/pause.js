import { wait } from '#utils/async';

async function enter({ machine, from, to }) {
	const { $scenes, $canvas, $audio } = this.$webgl;
	const { $store } = this.$app;
	const scene = $scenes.ui.component;

	const { $pauseScreenEnter, $pauseScreenToMenu } = scene;

	$store.isPaused = true;
	document.exitPointerLock();

	if (from.id == 'settings' || from.id == 'credits') {
		// $pauseScreenEnter.play();
		// await wait(500);
	} else {
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

	const { $pauseScreenEnter, $pauseScreenToMenu } = scene;

	if (to.id == 'hud') {
		if ($pauseScreenEnter) {
			$pauseScreenEnter.play({ direction: 'reverse' });
			await wait(600);
			$audio.stopSound('common/glitch');
		}
	}

	if (to.id == 'settings' || to.id == 'credits') {
		$pauseScreenToMenu.play();
		$audio.play('common/short-glitch', { volume: 0.3 });
		await wait(500);
	}

	scene.pauseScreen.hide();
}

export default { enter, leave, update };
