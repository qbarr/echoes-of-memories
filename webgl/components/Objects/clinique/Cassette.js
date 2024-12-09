import { deferredPromise } from '#utils/async/deferredPromise.js';
import { Object3D } from 'three';
import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Cassette extends BaseInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.audioId = 'clinique/cassette';

		this.baseDummy = new Object3D();
		this.baseDummy.position.copy(this.base.position);
		this.baseDummy.rotation.copy(this.base.rotation);
		this.baseDummy.scale.copy(this.mesh.scale);
	}

	async onClick() {
		if (this.scene.$sheet.isActive) return;
		const { $povCamera: camera, $raycast } = this.webgl;

		super.onClick();

		this.disableInteraction();
		camera.$setState('focus');

		await this.$sheet.play();
		this.hide();

		const { porte, contrat } = this.scene.interactiveObjects;

		$raycast.enable();
		camera.$setState('free');
		porte.enableInteraction();
		contrat.enableInteraction();

		$store.hintContent = 'Trouver la salle de visionnage';
		$store.showHint = true;
	}

	async createSheets() {
		this.$sheet = this.$project.getSheet('cassette');
		await this.$sheet.attachAudio(this.audioId);
		// this.$sheet.$addCamera();
		this.dummy = this.baseDummy.clone();

		this.$sheet.$object('Cassette', this.dummy, { nudgeMultiplier: 0.01 });
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
