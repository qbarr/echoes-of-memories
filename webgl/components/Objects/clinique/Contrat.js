import { deferredPromise } from '#utils/async/deferredPromise.js';
import { Object3D } from 'three';
import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Contrat extends BaseInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.audioId = 'clinique/contrat';

		this.baseDummy = new Object3D();
		this.baseDummy.position.copy(this.base.position);
		this.baseDummy.rotation.copy(this.base.rotation);
		this.baseDummy.scale.copy(this.mesh.scale);
	}

	async onClick() {
		super.onClick();
		this.disableInteraction();

		const { $povCamera: camera } = this.webgl;

		camera.$setState('focus');
		// camera.controls.focusOn(this.base.position);

		await this.$sheet.play();

		camera.$setState('free');
	}

	async createSheets() {
		this.$sheet = this.$project.getSheet('contrat');
		await this.$sheet.attachAudio(this.audioId);
		this.dummy = this.baseDummy.clone();
		this.$sheet.$object('Contrat', { value: this.dummy }, { nudgeMultiplier: 0.01 });
	}

	reset() {
		super.reset();
		this.dummy.position.copy(this.baseDummy.position);
		this.dummy.rotation.copy(this.baseDummy.rotation);
		this.dummy.scale.copy(this.baseDummy.scale);
	}

	update() {
		const { dt } = this.webgl.$time;
		this.base.position.damp(this.dummy.position, 0.1, dt);
		this.base.rotation.damp(this.dummy.rotation, 0.1, dt);
		this.mesh.scale.damp(this.dummy.scale, 0.1, dt);
	}
}
