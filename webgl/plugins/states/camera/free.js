async function enter({ machine }) {
	const { $webgl, camera } = this;
	const { $scenes, $raycast } = $webgl;

	const uiScene = $scenes.ui.component;
	const { crosshair } = uiScene;
	const { hint } = uiScene.hudScreen;

	crosshair.setVisible(true);
	hint.show();
	camera.controls.setMode('free');
	camera.controls.goFreeMode();
	$raycast.enable();
}
function update() {}
async function leave({ machine }) {
	const { $webgl, camera } = this;
	const { $scenes, $raycast } = $webgl;

	const uiScene = $scenes.ui.component;
	const { hint } = uiScene.hudScreen;

	hint.hide();
}

export default { enter, leave, update };
