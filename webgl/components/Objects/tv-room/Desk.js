import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Desk extends BaseInteractiveObject {
	init() {
		this.isSimpleObject = true;
	}

	createSheets() {
		this.$sheet = this.$project.getSheet('goTo-center');
		this.$sheet.$addCamera();
	}

	async onClick() {
		super.onClick();

		const { tv, lecteur } = this.scene.interactiveObjects;
		const { $povCamera } = this.webgl;

		tv.disableInteraction();
		lecteur.disableInteraction();
		this.disableInteraction();

		$povCamera.$setState('cinematic');

		await this.$sheet.play();

		tv.enableInteraction();

		$povCamera.$setState('free');
	}
}
