import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Desk extends BaseInteractiveObject {
	init() {
		this.isSimpleObject = true;
		// this.audioId = 'common/footstep';
	}

	createSheets() {
		this.$sheet = this.$project.getSheet('goTo-center');
		// this.$sheet.attachAudio(this.audioId);
		this.$sheet.$addCamera();
	}

	async onClick() {
		super.onClick();
		this.disableInteraction();

		const { tv, lecteur } = this.scene.interactiveObjects;
		const { $povCamera } = this.webgl;

		$povCamera.$setState('cinematic');

		await this.$sheet.play();

		tv.enableInteraction();
		lecteur.enableInteraction();

		$povCamera.$setState('free');
	}

	reset() {
		super.reset();
	}
}
