import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class FamilyPhoto extends BaseInteractiveObject {
	init() {
		this.isInteractiveObject = true;
		this.audio = null;
		this.audioId = 'flashbacks/meal';
	}

	async createSheets() {
		const { $theatre, $povCamera } = this.webgl;
		const flashbackProject = $theatre.get('Flashback');
		const mealSheet = flashbackProject.getSheet('flashback_photo');
		mealSheet.attachAudio(this.audioId);

		const transitionProject = $theatre.get('Transition-Memories');
		const transitionSheet = transitionProject.getSheet('transition');

		// mealSheet.$events([
		// 	{
		// 		name: 'transition',
		// 		onTrigger: () => {
		// 			transitionSheet.play()
		// 		},
		// 	}
		// ]);
		mealSheet.$bool('SwitchSceneParticles', { value: false }).onChange((v) => {
			if (v) this.webgl.$scenes.switch('particle')
			else this.webgl.$scenes.switch('bedroom')
		});

		mealSheet.$addCamera()
		mealSheet.$composer(['global', 'lut', 'crt']);
		mealSheet.$list('stateMachine', Object.values($povCamera.controls.states)).onChange((v) => {
			$povCamera.$setState('flashback_free');
		})
		// console.log(this.webgl.$povCamera.controls)
		// console.log(source.subtitles.content)

		this.$sheet = mealSheet;
	}


	async onClick() {
		super.onClick();
		this.disableInteraction();

		await this.$sheet.play();
	}
}
