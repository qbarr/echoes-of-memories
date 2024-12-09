async function enter({ machine }) {
	const { $webgl, camera } = this;
	const { $scenes, $raycast, $audio, $app } = $webgl;

	const uiScene = $scenes.ui.component;
	const { crosshair } = uiScene;

	crosshair.setVisible(false);
	camera.controls.setMode('generique');
	$raycast.disable();

	$scenes.bedroom.component.reset();
	$scenes.clinique.component.reset();
	$scenes['tv-room'].component.reset();

	const bgm = $audio.get('bedroom/bgm');
	bgm.play({ fade: 3000, volume: 0.2, loop: true });

	await camera.$generiqueSheet.play({ iterationCount: 1, rate: .75 });

	$app.$store.GAME_OVER = true;

	bgm.stop({ fade: 3000 });

	setTimeout(() => {
		$app.$store.showHint = true;
		$app.$store.hintContent = 'C\'est fini';
	}, 3000);
}
function update() {}
async function leave({ machine }) {}

export default { enter, leave, update };
