import { Vector3, PerspectiveCamera, Object3D } from 'three';
import { w } from '#utils/state';
import { webgl } from '#webgl/core';
import { orbitController } from '../utils/orbitController.js';

const tVec3a = new Vector3();
const tVec3b = new Vector3();

const defaultTarget = {
	object: new Object3D(),
	offset: new Vector3(0, 2, 2),
};

export function defaultCamera() {
	const ratio = window.innerWidth / window.innerHeight;
	const cam = new PerspectiveCamera(55, ratio, 0.1, 100);
	cam.position.set(0, 0.2, 1).multiplyScalar(5);
	cam.lookAt(new Vector3(0, 0, 0));
	return cam;
}

export default class OrbitCamera {
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

		this.controls = orbitController(this.base, {
			...props.orbitOptions,
			target: defaultTarget,
			fps: this.fps.value,
		});

		this.controls.enabled = this.enabled;
		this.setTarget(defaultTarget);

		// this.saveCamera();

		// this.cam.near = 1;
		// this.cam.far = 2000;
		// this.cam.updateProjectionMatrix();

		// this.saveCamera = throttle(this.saveCamera, 250, { bind: this });

		// this.enabled.watch(this.onCameraToggle, this);
		// this.onCameraToggle(this.enabled.value);

		this.fps.watch(this.onFPSToggle, this);
		this.onFPSToggle(this.fps.value);

		this.static = false;
	}

	setTarget(target, force) {
		this._target = target;

		tVec3a.copy(target.offset || defaultTarget.offset);

		if (target.object) {
			target.object.getWorldPosition(tVec3b);
			target.object.localToWorld(tVec3a).sub(tVec3b);
		}

		this.controls.target = target.object || target.position || defaultTarget.position;
		this.controls.offsetedTarget.multiplyScalar(0);
		this.controls.targetOffset.multiplyScalar(0);
		this.controls.offsetToSpherical(tVec3a, this.controls.sphericalTarget);
		this.controls.spherical.copy(this.controls.sphericalTarget);
		this.controls.updatePosition();
	}

	backupCamera() {
		const targetOffset = { ...this.controls.targetOffset };
		const position = { ...this.cam.position };
		const sphericalTarget = { ...this.controls.sphericalTarget };
		return { position, targetOffset, sphericalTarget };
	}

	restoreCamera(obj) {
		this.controls.offsetedTarget.multiplyScalar(0);
		this.controls.targetOffset.copy(obj.targetOffset);
		this.controls.sphericalTarget.copy(obj.sphericalTarget);
		this.controls.spherical.copy(obj.sphericalTarget);
		this.controls.updatePosition();
	}

	resetCamera() {
		this.setTarget(this.currentTarget.Target, true);
	}

	hasMoved() {
		const saved = this.savedState;
		return true;
	}

	onCameraToggle(v) {
		this.controls.enabled = !!v;
	}

	onFPSToggle(v, prev) {
		this.controls.setFPSMode(v);
		if (!v && prev) this.resetCamera();
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
