import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class FamilyPhoto extends BaseInteractiveObject {
	init() {
		this.isInteractiveObject = true;
		this.audio = null;
	}

	async createSheets() {
		const { $theatre } = this.webgl;
		const flashbackProject = $theatre.get('Flashback');
		const mealSheet = flashbackProject.getSheet('flashback_photo');
		mealSheet.attachAudio('flashback/meal');

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
	}
}
