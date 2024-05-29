import BaseScene from '#webgl/core/BaseScene';
import { MainCamera } from '../Cameras/MainCamera';
import { MSDFTextMesh } from '../Text';

import { wait } from '#utils/async';
import { Cube } from '../Objects/Cube';
import { Color } from 'three';
import { Particles } from '../Particles/Particles';

export default class MainScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		this.camera = this.add(MainCamera);

		this.particles = this.add(Particles)
		// const t = this.add(MSDFTextMesh, {
		// 	font: 'VCR_OSD_MONO',
		// 	content: 'Home',
		// 	centerMesh: true,
		// 	color: new Color('blue'),
		// });
		// t.needBloom = true;

		// const cube1 = this.add(Cube);
		// const cube2 = this.add(Cube, { color: 'blue' });
		// cube2.base.position.x = 2;
		// const cube3 = this.add(Cube, { color: 'green' });
		// cube3.base.position.x = -2;
	}
}
