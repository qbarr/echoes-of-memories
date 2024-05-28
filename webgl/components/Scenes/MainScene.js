import BaseScene from '#webgl/core/BaseScene';
import { MainCamera } from '../Cameras/MainCamera';
import { MSDFTextMesh } from '../Text';

import { wait } from '#utils/async';
import { Cube } from '../Objects/Cube';

export default class MainScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		this.camera = this.add(MainCamera);

		const t = this.add(MSDFTextMesh, {
			font: 'VCR_OSD_MONO',
			content: 'Home',
			centerMesh: true,
		});
		t.needBloom = true;

		this.add(Cube);
	}
}
