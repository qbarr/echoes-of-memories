import { wait } from '#utils/async/wait.js';
import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Lecteur extends BaseInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.audioId = 'tv-room/lesgo';
		this.cassette = this.scene.cassette;
		this.screen = this.scene.screen;
	}

	createSheets() {
		this.$sheet = this.$project.getSheet('Play-Tape');
		this.$sheet.$addCamera();
		this.$sheet.$composer(['global', 'lut']);
		this.$sheet.$object('Cassette', this.cassette, { nudgeMultiplier: 0.01 });

		this.$sheet.$bool('Screen / Tape Played', { value: false }).onChange((v) => {
			if (!v) this.screen.setInstructionsScreen();
			else this.screen.setSplashScreen();
		});
		this.$sheet.$vec2(
			'Screen / Interference',
			this.screen.uniforms.uInterferences.value,
		);
	}

	async onClick() {
		super.onClick();
		this.disableInteraction();

		const { $povCamera, $scenes } = this.webgl;
		$povCamera.$setState('cinematic');

		this.cassette.visible = true;

		await this.$sheet.play();

		await wait(500);

		$scenes.set('bedroom');
	}
}
