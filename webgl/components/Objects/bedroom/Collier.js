import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Collier extends BaseInteractiveObject {
	init() {
		this.isInteractiveObject = true;
		this.isSpecial = true;

		this.webgl.$hooks.afterStart.watchOnce(this.hide.bind(this)); // !! A DECOMMENTER
	}

	async createSheets() {
		const { $theatre } = this.webgl;

		this.$gotoSheet = this.$project.getSheet('Collier > Go To');
		this.$gotoSheet.$addCamera();
	}

	async onClick() {
		super.onClick();
		this.disableInteraction();

		const { $povCamera, $raycast } = this.webgl;
		$raycast.disable();
		$povCamera.$setState('cinematic');
		await this.$gotoSheet.play();

		this.scene.setCameraToSpawn();
		this.hide(); // !! A DECOMMENTER

		$raycast.enable();

		$povCamera.$setState('free');
		// this.enableInteraction(); // !! A COMMENTER

		this.specialObjects.testament.show();
	}
}
