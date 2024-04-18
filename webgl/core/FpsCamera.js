import { Vector3, PerspectiveCamera, Object3D } from 'three';
import { w } from '#utils/state';
import { webgl } from '#webgl/core';
import { fpsController } from '../utils/fpsController.js';

const defaultTarget = {
	object: new Object3D(),
	offset: new Vector3(0, 0, 0)
};

export function defaultCamera() {
	const ratio = window.innerWidth / window.innerHeight;
	const cam = new PerspectiveCamera(55, ratio, 0.1, 100);
	cam.position.set(0, 0.2, 1).multiplyScalar(5);
	cam.lookAt(new Vector3(0, 0, 0));
	return cam;
}

export default class FpsCamera {
	constructor(props = {}) {
		this.isCamera = true;
		this.props = props;
		this.init();
		this.afterInit();
	}

	used() {}
	unused() {}
	afterInit() {
		if (this.cam && !this.base) this.base = this.cam;
		else if (!this.cam) this.cam = defaultCamera();
		if (!this.base) this.base = this.cam;
		const dbs = webgl.$renderer.drawingBufferSize;
		this.resizeSignal = dbs.watchImmediate(this.resize, this);
	}

	init() {
		if (this.cam && !this.base) this.base = this.cam;
		else if (!this.cam) this.cam = defaultCamera();
		if (!this.base) this.base = this.cam;

		const props = this.props;
		this.name = this.props.name || 'Debug Camera';

		this.enabled = true;
		this.fps = w(props.fps);

		this.controls = fpsController(this.cam, {
			...props.orbitOptions,
			target: defaultTarget,
			fps: this.fps.value
		});

		this.controls.enabled = this.enabled;

		// this.saveCamera();

		this.cam.near = 1;
		this.cam.far = 2000;
		this.cam.updateProjectionMatrix();

		// this.saveCamera = throttle(this.saveCamera, 250, { bind: this });

		// this.enabled.watch(this.onCameraToggle, this);
		// this.onCameraToggle(this.enabled.value);

		this.static = false;
	}

	backupCamera() {
		const position = { ...this.cam.position };
		const lookAt = { ...this.controls.lookAt };
		return { position, lookAt };
	}

	restoreCamera(obj) {
		this.controls.lat = (obj.lat);
		this.controls.lon = (obj.lon);
		this.controls.position.copy(obj.position);
		// this.controls.updatePosition();
	}

	hasMoved() {
		const saved = this.savedState;
		return true;
	}

	onCameraToggle(v) {
		this.controls.enabled = !!v;
	}

	update() {
		if (this.controls) {
			this.controls.update();

			if (this.hasMoved()) {
				this.savedState = this.backupCamera();
			}
		}
	}

	resize(s) {
		this.cam.aspect = s.x / s.y;
		this.cam.updateProjectionMatrix();
	}

	beforeDestroy() {
		this.controls.dispose();
		this.resizeSignal.unwatch();
		super.beforeDestroy();
	}
}

