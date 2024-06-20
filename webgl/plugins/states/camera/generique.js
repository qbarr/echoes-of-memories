async function enter({ machine }) {
	const { $webgl, camera } = this;
	const { $scenes, $raycast } = $webgl;

	const uiScene = $scenes.ui.component;
	const { crosshair } = uiScene;

	crosshair.setVisible(false);
	camera.controls.setMode('cinematic');
	$raycast.disable();

	$scenes.bedroom.component.reset();
	$scenes.clinique.component.reset();
	$scenes['tv-room'].component.reset();

	camera.$generiqueSheet.play({ iterationCount: Infinity, rate: 0.75 });
}
function update() {}
async function leave({ machine }) {}

export default { enter, leave, update };
