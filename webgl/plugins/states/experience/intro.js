const p = (cb) => new Promise((r) => cb(r));

async function enter({ machine, isCanceled }) {
	const { $webgl } = this;
	const { $theatre, $scenes, $raycast, $povCamera: camera } = $webgl;

	const scene = $scenes.clinique.component;
	const { cassette } = scene.interactiveObjects;

	const uiScene = $scenes.ui.component;
	const { subtitles, crosshair } = uiScene;

	camera.$setState('cinematic');
	subtitles.setColor('white');
	crosshair.setVisible(false);
	$raycast.disable();

	const $project = $theatre.get('Clinique');

	const introSheet = $project.getSheet('intro');
	await introSheet.play();

	if (isCanceled()) return;

	camera.$setState('tuto');
	crosshair.setVisible(true);
	$raycast.enable();

	await p(cassette._onClick.bind(cassette));

	if (isCanceled()) return;

	cassette.removeInteraction();
	await cassette.$sheet.play();

	if (isCanceled()) return;

	camera.$setState('free');
	// camera free
}
function update() {}
async function leave({ machine }) {
	const { $theatre } = this.$webgl;

	const $project = $theatre.get('Clinique');
	const introSheet = $project.getSheet('intro');
	introSheet.stop();
}

export default { enter, leave, update };
