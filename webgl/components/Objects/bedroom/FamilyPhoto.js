import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class FamilyPhoto extends BaseInteractiveObject {
	init() {
		this.isInteractiveObject = true;
		this.audio = null;
		this.audioId = 'flashbacks/meal';
	}

	async createSheets() {
		const { $theatre, $povCamera } = this.webgl;
		this.isSpecial = true;

		this.$gotoSheet = this.$project.getSheet('Go_To_Photo');
		this.$gotoSheet.$addCamera();

		const flashbackProject = $theatre.get('Flashback');
		const mealSheet = flashbackProject.getSheet('flashback_photo');
		mealSheet.attachAudio(this.audioId);

		const transitionProject = $theatre.get('Transition-Memories');
		const transitionSheet = transitionProject.getSheet('transition');

		mealSheet.$bool('SwitchSceneParticles', { value: false }).onChange((v) => {
			if (v) this.webgl.$scenes.switch('particle');
			else this.webgl.$scenes.switch('bedroom');
		});
		mealSheet.$addCamera();
		mealSheet.$composer(['global', 'lut', 'crt']);
		mealSheet.$list('stateMachine', Object.values($povCamera.controls.states)).onChange((v) => {
			$povCamera.$setState('flashback_free');
		})
		// console.log(this.webgl.$povCamera.controls)
		// console.log(source.subtitles.content)

		this.$flashbackSheet = mealSheet;
	}


	async onClick() {
		super.onClick();
		this.disableInteraction();

		await this.$flashbackSheet.play();
	}

	async onClick() {
		super.onClick();
		this.disableInteraction();

		const { $povCamera, $raycast } = this.webgl;
		$raycast.disable();
		$povCamera.$setState('cinematic');
		await this.$gotoSheet.play();
		await this.$flashbackSheet.play();

		this.scene.setCameraToSpawn();
		// this.hide(); // !! A DECOMMENTER

		$raycast.enable();

		$povCamera.$setState('free');
		this.enableInteraction(); // !! A COMMENTER

		this.specialObjects.crucifix.show();
	}
}
