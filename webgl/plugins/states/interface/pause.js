import { wait } from '#utils/async';

async function enter({ machine, from, to }) {
	const { $scenes } = this.$webgl;
	const scene = $scenes.ui.component;

	const { $pauseScreenEnter, $pauseScreenToMenu } = scene;

	console.log('[PAUSE] ENTER', scene, scene.$pauseScreenEnter);

	if (from.id == 'settings' || from.id == 'credits') {
		// $pauseScreenEnter.play();
		// await wait(500);
	} else {
		$pauseScreenEnter.play();
		await wait(500);
	}

	scene.pauseScreen.show();
}

function update() {}

async function leave({ machine, to }) {
	const { $scenes } = this.$webgl;
	const scene = $scenes.ui.component;

	const { $pauseScreenEnter, $pauseScreenToMenu } = scene;

	if (to.id == 'hud') {
		if ($pauseScreenEnter) {
			$pauseScreenEnter.play({ direction: 'reverse' });
			await wait(500);
		}
	}

	if (to.id == 'settings' || to.id == 'credits') {
		$pauseScreenToMenu.play();
		await wait(500);
	}

	scene.pauseScreen.hide();
}

export default { enter, leave, update };
