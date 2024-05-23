import BaseCamera from '#webgl/core/BaseCamera';
import { OrthographicCamera } from 'three';


export class UICamera extends BaseCamera {
	init() {
		this.cam = new OrthographicCamera(0, 0, 0, 0, 0.1, 100);
		this.cam.position.z = 10;
		this.cam.lookAt(0, 0, 0);
		this.cam.updateProjectionMatrix();
	}

	resize(s) {
		const { x: width, y: height } = s;

		this.cam.left = -width * .5 * .01;
		this.cam.right = width * .5 * .01;
		this.cam.top = height * .5 * .01;
		this.cam.bottom = -height * .5 * .01;
		this.cam.updateProjectionMatrix();
	}
}
