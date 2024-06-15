async function enter({ machine }) {
	const { $webgl, camera } = this;
	const { $scenes, $raycast } = $webgl;

	const uiScene = $scenes.ui.component;
	const { crosshair } = uiScene;

	crosshair.setVisible(true);
	camera.controls.goFreeMode();
	$raycast.enable();
}
function update() {}
async function leave({ machine }) {}

export default { enter, leave, update };
