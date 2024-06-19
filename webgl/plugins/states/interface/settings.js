import { wait } from '#utils/async';

async function enter({ machine, from }) {
	const { $theatre, $scenes } = this.$webgl;
	const scene = $scenes.ui.component;

	scene.settingsScreen.show();
}

function update() {}

async function leave({ machine, to }) {
	const { $theatre, $scenes } = this.$webgl;
	const scene = $scenes.ui.component;

	const { $pauseScreenEnter, $pauseScreenToMenu } = scene;

	if (to.id == 'pause') {
		$pauseScreenToMenu.play();
		await wait(500);
	}

	scene.settingsScreen.hide();
}

export default { enter, leave, update };
