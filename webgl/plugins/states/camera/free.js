async function enter({ machine }) {
	const { $webgl, camera } = this;
	const { $scenes } = $webgl;

	const uiScene = $scenes.ui.component;
	const { crosshair } = uiScene;

	crosshair.setVisible(true);
	camera.controls.goFreeMode();
}
function update() {}
async function leave({ machine }) {}

export default { enter, leave, update };
