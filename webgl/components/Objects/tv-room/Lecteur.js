import { wait } from '#utils/async/wait.js';
import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Lecteur extends BaseInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.audioId = 'tv-room/lesgo';
		this.cassette = this.scene.cassette;
		this.screen = this.scene.screen;
	}

	async createSheets() {
		this.$sheet = this.$project.getSheet('Play-Tape');
		await this.$sheet.attachAudio(this.audioId);
		this.$sheet.$addCamera();
		this.$sheet.$addComposer(['global', 'lut']);
		this.$sheet.$object('Cassette', this.cassette, { nudgeMultiplier: 0.01 });

		this.$sheet.$bool('Screen / Tape Played', { value: false }).onChange((v) => {
			if (!v) this.screen.setInstructionsScreen();
			else this.screen.setSplashScreen();
		});
		this.$sheet.$vec2(
			'Screen / Interference',
			this.screen.uniforms.uScreenInterferences.value,
		);
	}

	async onClick() {
		super.onClick();
		this.disableInteraction();

		const { $povCamera, $scenes } = this.webgl;
		$povCamera.controls.focus_threshold.set(5)
		$povCamera.$setState('cinematic');

		const { tv } = this.scene.interactiveObjects;
		tv.disableInteraction();

		this.cassette.visible = true;

		await this.$sheet.play();

		await wait(500);

		await $scenes.set('bedroom');
		$scenes.current.component.start();
	}
}
