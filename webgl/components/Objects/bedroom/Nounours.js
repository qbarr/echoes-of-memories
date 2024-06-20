import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Nounours extends BaseInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.audioId = 'bedroom/nounours';
	}

	async createSheets() {
		const { $theatre } = this.webgl;

		this.$gotoSheet = this.$project.getSheet('Nounours > Go To');
		this.$gotoSheet.$addCamera();
	}

	async onClick() {
		super.onClick();
		this.disableInteraction();

		const { $povCamera, $raycast } = this.webgl;

		$raycast.disable();
		$povCamera.$setState('cinematic');

		$povCamera.isSfxActive = true;
		await this.$gotoSheet.play();
		$povCamera.isSfxActive = false;

		$povCamera.$setState('focus');

		this.webgl.$audio.play(this.audioId, {
			onComplete: () => {
				this.scene.setCameraToSpawn();
				$raycast.enable();

				$povCamera.$setState('free');
				this.enableInteraction();
			},
		});
	}
}
