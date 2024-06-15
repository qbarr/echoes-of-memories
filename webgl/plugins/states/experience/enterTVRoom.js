const p = (cb) => new Promise((r) => cb(r));

async function enter({ machine, isCanceled }) {
	const { $theatre, $scenes, $raycast, $povCamera: camera } = this.$webgl;

	const scene = $scenes['tv-room'].component;
	const { objets, ecran } = scene.interactiveObjects;
	console.log(scene.interactiveObjects);

	const uiScene = $scenes.ui.component;
	const { subtitles } = uiScene;

	ecran.disableInteraction();

	camera.$setState('cinematic');
	subtitles.setColor('white');
	$raycast.disable();

	const $project = $theatre.get('TV-Room');

	const sheet = $project.getSheet('enter');
	await sheet.play();

	if (isCanceled()) return;

	camera.$setState('free');

	await p(objets._onClick.bind(objets));
	if (isCanceled()) return;

	camera.$setState('cinematic');
	objets.disableInteraction();

	await objets.$sheet.play();

	ecran.enableInteraction();
	camera.$setState('free');
}
function update() {}
async function leave({ machine }) {
	const { $theatre } = this.$webgl;

	const $project = $theatre.get('TV-Room');
	const sheet = $project.getSheet('enter');
	sheet.stop();
}

export default { enter, leave, update };
