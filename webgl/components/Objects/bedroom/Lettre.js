import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Lettre extends BaseInteractiveObject {
	init() {
		this.isInteractiveObject = true;
		this.isSpecial = true;
		this.audioId = 'flashbacks/war';

		// this.webgl.$hooks.afterStart.watchOnce(this.hide.bind(this)); // !! A DECOMMENTER
	}

	async createSheets() {
		const { $theatre, $povCamera } = this.webgl;

		this.$gotoSheet = this.$project.getSheet('Lettre > Go To');
		this.$gotoSheet.$addCamera();

		const flashbackProject = $theatre.get('Flashback');
		const warSheet = flashbackProject.getSheet('flashback_war');
		warSheet.attachAudio(this.audioId);

		const transitionProject = $theatre.get('Transition-Memories');
		const transitionSheet = transitionProject.getSheet('transition');

		// warSheet.$bool('SwitchSceneParticles', { value: false }).onChange((v) => {
		// 	if (v) this.webgl.$scenes.switch('flashback3');
		// 	else this.webgl.$scenes.switch('tv-room');
		// });

		warSheet.$list('SwitchScenes', ['bedroom', 'tv-room', 'flashback3']).onChange((v) => {
			this.webgl.$scenes.switch(v);
		})
		warSheet.$addCamera();
		warSheet.$composer(['global', 'lut', 'crt']);
		warSheet
			.$list('stateMachine', Object.values($povCamera.controls.states))
			.onChange((v) => {
				const state = v?.toLowerCase() || null
				$povCamera.$setState(state);
			});
		this.$flashbackSheet = warSheet;

		this.$outroSheet = transitionProject.getSheet('outro');
		this.$outroSheet.$composer(['*']);
		this.$outroSheet.$addCamera();
		this.$outroSheet.$bool('SwitchSceneOutro', { value: false }).onChange((v) => {
			if (v) this.webgl.$scenes.switch('tv-room');
			else this.webgl.$scenes.switch('bedroom');
		});
		this.$letterLecture = transitionProject.getSheet('letter');
		// await this.$letterLecture.attachAudio('outro/letter');
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

		// ! FIN DE L'XP ICI

		await this.$outroSheet.play();

		// !! A COMMENTER
		// this.scene.setCameraToSpawn();
		// $raycast.enable();

		// $povCamera.$setState('free');
		// this.enableInteraction();
	}
}
