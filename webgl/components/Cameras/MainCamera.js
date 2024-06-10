import BaseCamera from '#webgl/core/BaseCamera';

export class MainCamera extends BaseCamera {
	afterInit() {
		super.afterInit();

		this.base.position.fromArray([10.9116, 4.16947, 7.49768]);
		this.base.quaternion.fromArray([-0.047939, 0.53554, 0.030469, 0.842597]);
		this.base.fov = 55;
		this.cam.updateProjectionMatrix();
	}

	update() {}
}
