import BaseScene from '#webgl/core/BaseScene';
import { MainCamera } from '../Cameras/MainCamera';
import { MSDFTextMesh } from '../Text';

import { Cube } from '../Objects/Cube';

export default class MainScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		this.camera = this.add(MainCamera);

		// const t = this.add(MSDFTextMesh, {
		// 	font: 'VCR_OSD_MONO',
		// 	content: 'Home',
		// 	centerMesh: true,
		// 	// color: new Color('blue'),
		// });
		// t.needBloom = true;

		// const cube1 = this.add(Cube);
		// const cube2 = this.add(Cube, { color: 'blue' });
		// cube2.base.position.x = 2;
		// const cube3 = this.add(Cube, { color: 'green' });
		// cube3.base.position.x = -2;

		const chambre = this.webgl.$assets.objects['chambre'].scene;
		chambre.scale.setScalar(3);
		this.base.add(chambre);
	}
}
