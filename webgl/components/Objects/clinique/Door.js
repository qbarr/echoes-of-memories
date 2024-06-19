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

	init() {
		this.isSimpleObject = true;
		this.audioId = 'clinique/door';
		this.actionId = 'porte';
		this.animationProgress = w(0);

		this.scene.$mixer.play(this.actionId);
		this.scene.$mixer.normSeek(0.15);
	}

	async createSheets() {
		this.$sheet = this.$project.getSheet('Door');
		await this.$sheet.attachAudio(this.audioId);
		this.$sheet.$object('Door', this.base);
		this.$sheet.$composer(['global']);
		this.$sheet.$addCamera();
		this.$sheet
			.$float('animation_progress', this.animationProgress, {
				range: [0.15, 0.999],
			})
			.onChange((v) => this.scene.$mixer.normSeek(v));
	}

	async onClick() {
		super.onClick();
		this.disableInteraction();

		const { $povCamera: camera, $scenes } = this.webgl;
		camera.$setState('cinematic');

		await this.$sheet.play();

		await $scenes.set('tv-room');
		$scenes.current.start();
	}
}
