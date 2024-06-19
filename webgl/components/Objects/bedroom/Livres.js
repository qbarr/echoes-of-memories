import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Livres extends BaseInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.audioId = null;
	}

	async createSheets() {
		const { $theatre } = this.webgl;

		this.$gotoSheet = this.$project.getSheet('Livres > Go To');
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
