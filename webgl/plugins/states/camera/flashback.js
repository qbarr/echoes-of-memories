async function enter({ machine }) {
	const { $scenes } = this.$webgl;

	const uiScene = $scenes.ui.component;
	const { crosshair } = uiScene;

	// camera.
	crosshair.setVisible(false);
	// camera.controls.goFlashbackMode();
}
function update() {}
async function leave({ machine }) {}

export default { enter, leave, update };
