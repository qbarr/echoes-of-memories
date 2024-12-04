import { w } from '#utils/state/index.js';
import { useAnimationsMixer } from '#webgl/utils/useAnimationsMixer.js';
import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Door extends BaseInteractiveObject {
	beforeInit() {
		this.$project = this.scene.$project;

		const m = (this.mesh = this.props.mesh);
		this.raycastMesh = this.props?.data?.raycastMesh ?? m.clone();
		this.base.add(m);
	}

	// Overrided
	onEnter() {
		const { $hooks, $composer, $scenes, $povCamera } = this.webgl;
		$hooks.afterFrame.watchOnce(() => {
			$composer.addOutline(this.mesh);
			$scenes.ui.component.crosshair.hoverDoor();
			$povCamera.onInteractiveEnter();
		});
	}

	init() {
		this.isSimpleObject = true;
		this.audioId = 'clinique/door';
		this.actionId = 'porte';
		this.animationProgress = w(0);

		console.log(this.scene);

		this.scene.$mixer.play(this.actionId);
		this.scene.$mixer.normSeek(0.2);
	}

	async createSheets() {
		this.$sheet = this.$project.getSheet('Door');
		await this.$sheet.attachAudio(this.audioId);
		this.$sheet.$object('Door', this.base);
		this.$sheet.$composer(['global']);
		this.$sheet.$addCamera();
		this.$sheet
			.$float('animation_progress', this.animationProgress, {
				range: [0.2, 0.999],
			})
			.onChange((v) => this.scene.$mixer.normSeek(v));
	}

	async onClick() {
		super.onClick();
		this.disableInteraction();

		const { $povCamera: camera, $scenes } = this.webgl;
		camera.$setState('cinematic');

		camera.isSfxActive = true;
		await this.$sheet.play();
		camera.isSfxActive = false;

		// this.scene.$bgm.stop();

		await $scenes.set('tv-room');
		$scenes.current.component.start();
	}

	reset() {
		super.reset();
		if (!this.scene) return
		this.scene.$mixer.normSeek(0.2);
	}
}
