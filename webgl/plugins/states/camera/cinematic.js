async function enter({ machine }) {
	const { $webgl, camera } = this;
	const { $scenes } = $webgl;

	const uiScene = $scenes.ui.component;
	const { crosshair } = uiScene;

	console.log('[CINEMATIC STATE]');

	crosshair.setVisible(false);
	camera.controls.setMode('cinematic');
	camera.controls.goCinematicMode();
}
function update() {}
async function leave({ machine }) {}

export default { enter, leave, update };
