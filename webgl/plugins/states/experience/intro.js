const p = (cb) => new Promise((r) => cb(r));

async function enter({ machine, isCanceled }) {
	const { $theatre, $scenes, $raycast, $povCamera: camera } = this.$webgl;

	const scene = $scenes.clinique.component;
	const { cassette, porte } = scene.interactiveObjects;
	console.log(scene.interactiveObjects);

	const uiScene = $scenes.ui.component;
	const { subtitles, crosshair } = uiScene;

	camera.$setState('cinematic');
	subtitles.setColor('white');

	porte.disableInteraction();

	cassette.enableInteraction();
	cassette.reset();
	cassette.show();

	const $project = $theatre.get('Clinique');

	const introSheet = $project.getSheet('intro');
	await introSheet.play();

	if (isCanceled()) return;

	camera.$setState('tuto');

	await p(cassette._onClick.bind(cassette));

	if (isCanceled()) return;

	cassette.disableInteraction();
	await cassette.$sheet.play();
	cassette.hide();

	if (isCanceled()) return;

	camera.$setState('free');
	porte.enableInteraction();
}
function update() {}
async function leave({ machine }) {
	const { $theatre } = this.$webgl;

	const $project = $theatre.get('Clinique');
	const introSheet = $project.getSheet('intro');
	introSheet.stop();
}

export default { enter, leave, update };
