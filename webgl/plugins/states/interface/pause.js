async function enter({ machine, from }) {
	const { $theatre, $scenes, $povCamera: camera } = this.$webgl;

	const scene = $scenes.ui.component;
	scene.pauseScreen.show();
}

function update() {}

async function leave({ machine }) {
	const { $theatre, $scenes, $povCamera: camera } = this.$webgl;

	const scene = $scenes.ui.component;
	scene.pauseScreen.hide();
}

export default { enter, leave, update };