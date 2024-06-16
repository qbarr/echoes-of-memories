async function enter({ machine }) {
	const { $scenes, $povCamera: camera } = this.$webgl;

	const uiScene = $scenes.ui.component;
	const { crosshair } = uiScene;

	crosshair.setVisible(false);
	camera.controls.setMode('flashback');
}

function update() {}
async function leave({ machine }) {}

export default { enter, leave, update };
