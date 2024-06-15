import { deferredPromise } from '#utils/async/deferredPromise.js';
import { Object3D } from 'three';
import { BaseInteractiveObject } from '../base/BaseInteractiveObject';

export class Cassette extends BaseInteractiveObject {
	init() {
		this.isSimpleObject = true;
		this.audioId = 'clinique/cassette';

		this.hasClicked = deferredPromise();

		this.baseDummy = new Object3D();
		this.baseDummy.position.copy(this.base.position);
		this.baseDummy.rotation.copy(this.base.rotation);
		this.baseDummy.scale.copy(this.mesh.scale);
	}

	createSheets() {
		this.$sheet = this.$project.getSheet('cassette');
		this.$sheet.attachAudio(this.audioId);
		const cam = this.webgl.$povCamera;
		this.$sheet.$compound('Camera', {
			position: { value: cam.target },
			lat: cam.controls.lat,
			lon: cam.controls.lon,
		});
		this.dummy = this.baseDummy.clone();
		this.$sheet.$object('Cassette', { value: this.dummy }, { nudgeMultiplier: 0.01 });
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
