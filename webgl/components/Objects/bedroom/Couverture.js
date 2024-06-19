import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Couverture extends BaseInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.audioIdBefore = null;
		this.audioIdAfter = null;
	}

	async createSheets() {
		const { $theatre } = this.webgl;

		this.$gotoSheet = this.$project.getSheet('Go_To_Couverture');
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
		$raycast.enable();

		$povCamera.$setState('free');
		this.enableInteraction();
	}
}
