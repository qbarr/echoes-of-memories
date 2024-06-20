import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Collier extends BaseInteractiveObject {
	init() {
		this.isInteractiveObject = true;
		this.isSpecial = true;
		this.audioId = 'flashbacks/truck';

		this.webgl.$hooks.afterStart.watchOnce(this.hide.bind(this)); // !! A DECOMMENTER
	}

	async createSheets() {
		const { $theatre } = this.webgl;

		this.$gotoSheet = this.$project.getSheet('Collier > Go To');
		this.$gotoSheet.$addCamera();

		const flashbackProject = $theatre.get('Flashback');
		const truckSheet = flashbackProject.getSheet('flashback_crucifix');
		truckSheet.attachAudio(this.audioId);

		const transitionProject = $theatre.get('Transition-Memories');
		const transitionSheet = transitionProject.getSheet('transition');

		truckSheet.$bool('SwitchSceneParticles', { value: false }).onChange((v) => {
			if (v) this.webgl.$scenes.switch('flashback2');
			else this.webgl.$scenes.switch('bedroom');
		});
		truckSheet.$addCamera();
		truckSheet.$composer(['global', 'lut', 'crt']);
		this.$flashbackSheet = truckSheet;
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

		await this.$flashbackSheet.play();

		this.scene.setCameraToSpawn();
		this.hide(); // !! A DECOMMENTER

		$raycast.enable();

		$povCamera.$setState('free');
		// this.enableInteraction(); // !! A COMMENTER

		this.specialObjects.testament.show();
	}
}
