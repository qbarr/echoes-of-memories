import BaseCamera from '#webgl/core/BaseCamera';
import { OrthographicCamera } from 'three';

export class UICamera extends BaseCamera {
	init() {
		this.viewSize = 50;

		const dbs = this.webgl.$renderer.drawingBufferSize;
		const { x: width, y: height } = dbs.value;
		const aspect = width / height;

		this.cam = new OrthographicCamera(
			-aspect * this.viewSize * 0.5,
			aspect * this.viewSize * 0.5,
			this.viewSize * 0.5,
			-this.viewSize * 0.5,
			0.1,
			100,
		);
		this.cam.position.z = 10;
		this.cam.lookAt(0, 0, 0);
		this.cam.updateProjectionMatrix();
	}

	resize(s) {
		const { x: width, y: height } = s;
		const aspect = width / height;

		this.base.left = -aspect * this.viewSize * 0.5;
		this.base.right = aspect * this.viewSize * 0.5;
		this.base.top = this.viewSize * 0.5;
		this.base.bottom = -this.viewSize * 0.5;
		this.cam.updateProjectionMatrix();
	}
}
