import BaseCamera from '#webgl/core/BaseCamera';
import { OrthographicCamera } from 'three';


export class UICamera extends BaseCamera {
	init() {
		this.cam = new OrthographicCamera(0, 0, 0, 0, 0.1, 100);
		this.cam.position.z = 10;
		this.cam.lookAt(0, 0, 0);
		this.cam.updateProjectionMatrix();
	}

	// afterInit() {
	// 	super.afterInit();
	// 	this.cam.position.z = 100
	// }

	resize(s) {
		const { x: width, y: height } = s;
		const ratio = width / height;

		this.cam.left = -ratio;
		this.cam.right = ratio;
		this.cam.top = 1;
		this.cam.bottom = -1;
		this.cam.updateProjectionMatrix();
	}
}
