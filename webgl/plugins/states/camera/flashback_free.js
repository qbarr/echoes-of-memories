async function enter({ machine }) {
	const { $scenes, $povCamera: camera } = this.$webgl;

	const uiScene = $scenes.ui.component;

	// crosshair.setVisible(false);
	camera.controls.setMode('flashback_free');
}

function update() {}
async function leave({ machine }) {}

export default { enter, leave, update };
