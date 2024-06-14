async function enter({ machine }) {
	this.log('enter');
	const { $webgl } = this;
	const { $theatre, $scenes } = $webgl;

	const uiScene = $scenes.ui.component;
	const Subtitles = uiScene.subtitles;

	Subtitles.setColor('white');

	const $project = $theatre.get('Clinique-Camera');

	const introSheet = $project.getSheet('intro');
	await introSheet.play();
	console.log('interaction cassette');
}
function update() {
	this.log('update');
}
async function leave({ machine }) {
	this.log('leave');
}

export default { enter, leave, update };
