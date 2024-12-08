import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

const ucfirst = str => str.charAt(0).toUpperCase() + str.slice(1);
export class Couverture extends BaseInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.audioIdBefore = 'bedroom/couverture_before';
		this.audioIdAfter = 'bedroom/couverture_after';
		this.objectName = 'couverture';
	}

	async createSheets() {
		const { $theatre } = this.webgl;

		this.$gotoSheet = this.$project.getSheet(`${ucfirst(this.objectName)} > Go To`);
		this.$gotoSheet.$addCamera();
		this.$gotoSheet.$addComposer([ 'global', 'crt' ]);

		this.$audioSheetBefore = this.$project.getSheet(`${ucfirst(this.objectName)} > Audio Before`);
		this.$audioSheetBefore.attachAudio(this.audioIdBefore);

		this.$audioSheetAfter = this.$project.getSheet(`${ucfirst(this.objectName)} > Audio After`);
		this.$audioSheetAfter.attachAudio(this.audioIdAfter);
	}

	async onClick() {
		super.onClick();

		this.disableInteraction();

		const { $povCamera, $raycast, $app } = this.webgl;

		$raycast.disable();
		$povCamera.$setState('cinematic');

		$povCamera.isSfxActive = true;
		await this.$gotoSheet.play();
		$povCamera.isSfxActive = false;

		$povCamera.controls.focus_threshold.set(20)
		$povCamera.$setState('focus');
		$raycast.disable();

		if ($app.$store.hasSeenNecklaceFlashback) await this.$audioSheetAfter.play();
		else await this.$audioSheetBefore.play();

		await this.scene.$respawnFadeoutSheet.play()

		$raycast.enable();

		$povCamera.$setState('free');
		this.enableInteraction();
	}
}
