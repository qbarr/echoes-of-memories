import { wait } from '#utils/async';

async function enter({ machine, from }) {
	const { $scenes } = this.$webgl;
	const scene = $scenes.ui.component;

	scene.settingsScreen.show();
}

function update() {}

async function leave({ machine, to }) {
	const { $scenes, $audio } = this.$webgl;
	const scene = $scenes.ui.component;
	const curScene = $scenes.current;

	const { $pauseScreenToMenu } = scene;

	if (to.id == 'pause') {
		if (curScene.name !== 'bedroom') return scene.settingsScreen.hide();

		$audio.play('common/short-glitch', { volume: 0.3 });
		$pauseScreenToMenu.play();
		await wait(500);
	}

	scene.settingsScreen.hide();
}

export default { enter, leave, update };
