import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Crucifix extends BaseInteractiveObject {
	init() {
		this.isInteractiveObject = true;
		this.audio = null;
		this.audioId = 'flashbacks/meal';
	}

	async createSheets() {
		const { $theatre } = this.webgl;
		const flashbackProject = $theatre.get('Flashback');
		const mealSheet = flashbackProject.getSheet('flashback_crucifix');
		mealSheet.attachAudio(this.audioId);

		const transitionProject = $theatre.get('Transition-Memories');
		const transitionSheet = transitionProject.getSheet('transition');

		mealSheet.$bool('SwitchSceneParticles', { value: false }).onChange((v) => {
			if (v) this.webgl.$scenes.switch('particle')
			else this.webgl.$scenes.switch('bedroom')
		});
		mealSheet.$addCamera()
		mealSheet.$composer(['global', 'lut', 'crt']);

		this.$sheet = mealSheet;
	}


	async onClick() {
		super.onClick();
		this.disableInteraction();
		console.log('onclick')
		await this.$sheet.play();
	}
}
