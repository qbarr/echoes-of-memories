
import BaseCamera from '#webgl/core/BaseCamera';
import BaseScene from '#webgl/core/BaseScene';

import { wait } from '#utils/async';
import { MSDFTextMesh } from '../Text';



export default class MainScene extends BaseScene {
	mixins = [ 'debugCamera' ]

	init() {
		this.camera = this.add(BaseCamera);
		this.camera.base.position.set(0, 0.2, 5).multiplyScalar(3);
		this.camera.base.lookAt(0, 0, 0);

		this.add(MSDFTextMesh, {
			font: 'VCR_OSD_MONO',
			content: 'Home',
		});
	}

	async enter() {
		this.log('enter');
	}

	async leave() {
		this.log('leave');
		await wait(1000)
	}

	update() {
	}
}

