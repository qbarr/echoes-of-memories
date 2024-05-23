import BaseCamera from '#webgl/core/BaseCamera';

export class MainCamera extends BaseCamera {
	afterInit() {
		super.afterInit();

		this.base.position.set(0, 0.2, 5).multiplyScalar(3);
		this.base.lookAt(0, 0, 0);
	}
}
