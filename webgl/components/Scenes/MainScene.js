import BaseScene from '#webgl/core/BaseScene';
import { MainCamera } from '../Cameras/MainCamera';
import { MSDFTextMesh } from '../Text';

import { Cube } from '../Objects/Cube';
import { Sphere } from '../Objects/Sphere';

export default class MainScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		this.camera = this.add(MainCamera);

		const chambre = this.webgl.$assets.objects['chambre'].scene;
		chambre.scale.setScalar(3);
		this.base.add(chambre);

		this.add(Cube);
		// this.add(Sphere);
	}

	async enter() {
		this.log('enter');
	}

	async leave() {
		this.log('leave');
	}

	update() {}
}
