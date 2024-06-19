import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Lettre extends BaseInteractiveObject {
	init() {
		this.isInteractiveObject = true;
		this.isSpecial = true;

		// this.webgl.$hooks.afterStart.watchOnce(this.hide.bind(this)); // !! A DECOMMENTER
	}

	async createSheets() {
		const { $theatre } = this.webgl;

		this.$gotoSheet = this.$project.getSheet('Go_To_Lettre');
		this.$gotoSheet.$addCamera();
	}

	async onClick() {
		super.onClick();
		this.disableInteraction();

		const { $povCamera, $raycast } = this.webgl;
		$raycast.disable();
		$povCamera.$setState('cinematic');
		await this.$gotoSheet.play();

		// ! FIN DE L'XP ICI

		// !! A COMMENTER
		this.scene.setCameraToSpawn();
		$raycast.enable();

		$povCamera.$setState('free');
		this.enableInteraction();
	}
}
