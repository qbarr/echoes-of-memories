const p = (cb) => new Promise((r) => cb(r));

async function enter({ machine, isCanceled }) {
	const { $theatre, $scenes, $raycast, $povCamera: camera } = this.$webgl;

	const scene = $scenes.clinique.component;
	const { cassette, porte } = scene.interactiveObjects;

	const uiScene = $scenes.ui.component;
	const { subtitles, crosshair } = uiScene;

	camera.$setState('free');
	$raycast.enable();
}
function update() {}
async function leave({ machine }) {}

export default { enter, leave, update };
