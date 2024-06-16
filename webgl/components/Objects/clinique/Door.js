import { w } from '#utils/state/index.js';
import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Door extends BaseInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.audioId = 'clinique/door';
		this.animationProgress = w(0);
	}

	async createSheets() {
		this.$sheet = this.$project.getSheet('Door');
		await this.$sheet.attachAudio(this.audioId);
		this.$sheet.$object('Door', { value: this.base });
		this.$sheet.$composer(['global']);
		this.$sheet.$addCamera();
		this.$sheet.$float('animation_progress', this.animationProgress, {
			range: [0, 1],
		});
	}

	async onClick() {
		super.onClick();
		this.disableInteraction();

		const { $povCamera: camera, $scenes } = this.webgl;
		camera.$setState('cinematic');

		await this.$sheet.play();

		$scenes.set('tv-room');
	}
}
