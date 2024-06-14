import { Color } from 'three';

async function enter({ machine }) {
	this.log('enter');

	const { $webgl } = this;
	const uiScene = $webgl.$scenes.ui.component;
	const Subtitles = uiScene.subtitles;
	Subtitles.setColor(new Color(0xffd700).offsetHSL(0, 0.3, 0.1));
}
function update() {
	this.log('update');
}
async function leave({ machine }) {
	this.log('leave');
}

export default { enter, leave, update };
