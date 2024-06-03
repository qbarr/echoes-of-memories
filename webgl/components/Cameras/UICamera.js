import BaseCamera from '#webgl/core/BaseCamera';
import { OrthographicCamera } from 'three';

export class UICamera extends BaseCamera {
	// init() {
	// 	this.zoom = 100;
	// 	this.cam = new OrthographicCamera(0, 0, 0, 0, 0.1, 100);
	// 	this.cam.position.z = 1;
	// 	this.cam.lookAt(0, 0, 0);
	// 	this.cam.updateProjectionMatrix();
	// }

	afterInit() {
		super.afterInit();
		this.cam.position.z = 100;
	}

	// resize(s) {
	// 	const { x: width, y: height } = s;

	// 	this.cam.left = (-width * 0.5) / this.zoom;
	// 	this.cam.right = (width * 0.5) / this.zoom;
	// 	this.cam.top = (height * 0.5) / this.zoom;
	// 	this.cam.bottom = (-height * 0.5) / this.zoom;
	// 	this.cam.updateProjectionMatrix();
	// }
}
