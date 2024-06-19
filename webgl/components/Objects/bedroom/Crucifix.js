import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Crucifix extends BaseInteractiveObject {
	init() {
		this.isInteractiveObject = true;
		this.audio = null;
		this.audioId = 'flashbacks/truck';
	}

	async createSheets() {
		console.log('createSheets')
		const { $theatre } = this.webgl;
		const flashbackProject = $theatre.get('Flashback');
		const truckSheet = flashbackProject.getSheet('flashback_crucifix');
		truckSheet.attachAudio(this.audioId);

		const transitionProject = $theatre.get('Transition-Memories');
		const transitionSheet = transitionProject.getSheet('transition');

		truckSheet.$bool('SwitchSceneParticles', { value: false }).onChange((v) => {
			if (v) this.webgl.$scenes.switch('particle')
			else this.webgl.$scenes.switch('bedroom')
		});
		truckSheet.$addCamera()
		truckSheet.$composer(['global', 'lut', 'crt']);
		console.log(this.$sheet)
		this.$sheet = truckSheet;
	}


	async onClick() {
		super.onClick();
		this.disableInteraction();
		console.log('onclick')
		await this.$sheet.play();
	}
}
