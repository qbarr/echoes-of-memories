import { wait } from '#utils/async/wait.js';
import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class FamilyPhoto extends BaseInteractiveObject {
	init() {
		this.isInteractiveObject = true;
		this.isSpecial = true;
		this.audioId = 'flashbacks/meal';
	}

	async createSheets() {
		const { $theatre, $povCamera } = this.webgl;

		this.$gotoSheet = this.$project.getSheet('Photo > Go To');
		this.$gotoSheet.$addCamera();

		const flashbackProject = $theatre.get('Flashback');
		const mealSheet = flashbackProject.getSheet('flashback_photo');
		mealSheet.attachAudio(this.audioId);

		const transitionProject = $theatre.get('Transition-Memories');
		const transitionSheet = transitionProject.getSheet('transition');

		mealSheet.$bool('SwitchSceneParticles', { value: false }).onChange((v) => {
			if (v) this.webgl.$scenes.switch('flashback1');
			else this.webgl.$scenes.switch('bedroom');
		});
		mealSheet.$addCamera();
		mealSheet.$composer(['global', 'lut', 'crt', 'bloom']);
		mealSheet
			.$list('stateMachine', Object.values($povCamera.controls.states))
			.onChange((v) => {
				const state = v?.toLowerCase() || null;
				$povCamera.$setState(state);
			});
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

		$povCamera.isSfxActive = true;
		await this.$gotoSheet.play();
		$povCamera.isSfxActive = false;

		wait(10000).then(() => {
			this.hide(); // !! A DECOMMENTER
			this.specialObjects.crucifix.show();
		})

		await this.$flashbackSheet.play();

		// this.scene.setCameraToSpawn();

		$raycast.enable();
		$povCamera.$setState('free');
	}
}
