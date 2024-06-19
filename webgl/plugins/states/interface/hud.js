import { wait } from '#utils/async';

async function enter({ machine, from }) {
	const { $theatre, $scenes } = this.$webgl;
	const scene = $scenes.ui.component;

	if (!from || from.id === 'pause') {
		await wait(200);
		scene.hudScreen.show();
	}

	scene.hudScreen.show();
}

function update() {}

async function leave({ machine }) {
	const { $theatre, $scenes } = this.$webgl;

	const scene = $scenes.ui.component;
	scene.hudScreen.hide();
}

export default { enter, leave, update };
