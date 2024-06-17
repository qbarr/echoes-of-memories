async function enter({ machine, from }) {
	const { $theatre, $scenes, $povCamera: camera } = this.$webgl;

	const scene = $scenes.ui.component;
	scene.creditsScreen.show();
}

function update() {}

async function leave({ machine }) {
	const { $theatre, $scenes, $povCamera: camera } = this.$webgl;

	const scene = $scenes.ui.component;
	scene.creditsScreen.hide();
}

export default { enter, leave, update };
