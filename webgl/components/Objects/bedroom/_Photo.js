import { deferredPromise } from '#utils/async/deferredPromise.js';
import { Object3D } from 'three';
import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class _Photo extends BaseInteractiveObject {
	init() {
		this.isFlashbackObject = true;
		this.audioIds = {
			intro: 'bedroom/photo_intro',
			flashback: 'flashback/repas',
			outro: 'bedroom/photo_outro',
		};
	}

	createSheets() {
		// this.$introSheet = this.$project.getSheet('photo_intro');
		// this.$introSheet.attachAudio(this.audioIds.intro);
		// this.$introSheet.$bool('TransitionToParticles', {value:false}).onChange((v) => {
		// 	if (v) {
		// 		const p = this.webgl.$theatre.get('Transition-Memories');
		// 		const sheet = p.getSheet('transition');
		// 		console.log('TransitionToParticles');
		// 		sheet.play();
		// 		// this.webgl.$povCamera.$setState('flashback');
		// 	}
		// })
		// // this.$introSheet.$events([
		// // 	{
		// // 		name: 'TransitionToParticles',
		// // 		onTrigger: (v) => {
		// // 			if (!v) return;
		// // 			const p = this.webgl.$theatre.get('Transition-Memories');
		// // 			const sheet = p.getSheet('transition');
		// // 			console.log('TransitionToParticles');
		// // 			sheet.play();
		// // 		},
		// // 	},
		// // ]);
		// this.$flashbackSheet = this.$project.getSheet('photo_flashback');
		// this.$flashbackSheet.attachAudio(this.audioIds.flashback);
		// this.$outroSheet = this.$project.getSheet('photo_outro');
		// this.$outroSheet.attachAudio(this.audioIds.outro);
		// this.$outroSheet.$events([
		// 	{
		// 		name: 'TransitionToBedroom',
		// 		onTrigger: () => {
		// 			console.log('TransitionToBedroom');
		// 			// switch
		// 		},
		// 	},
		// ]);
	}

	reset() {
		super.reset();
	}
}
