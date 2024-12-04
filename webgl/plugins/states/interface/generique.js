import { wait } from '#utils/async';

async function enter({ machine, from, to }) {
	const { $scenes } = this.$webgl;
	const scene = $scenes.ui.component;
	scene.generiqueScreen.show();

}

function update() {}

async function leave({ machine, to }) {
	const { $scenes } = this.$webgl;
	const scene = $scenes.ui.component;
	scene.generiqueScreen.hide();
}

export default { enter, leave, update };
