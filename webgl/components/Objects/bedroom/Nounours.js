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

		this.$speakSheet = this.$project.getSheet('Nounours > Speak');
		this.$speakSheet.attachAudio(this.audioId);
		this.$speakSheet.$addCamera();
	}

	async onClick() {
		super.onClick();
		this.disableInteraction();

		const { $povCamera, $raycast } = this.webgl;

		$raycast.disable();
		$povCamera.$setState('cinematic');

		await this.$gotoSheet.play();

		$povCamera.$setState('focus');

		await this.$speakSheet.play();

		this.scene.setCameraToSpawn();
		$raycast.enable();

		$povCamera.$setState('free');
		this.enableInteraction();
	}
}
