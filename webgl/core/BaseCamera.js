import { PerspectiveCamera } from 'three';
import BaseComponent from './BaseComponent.js';

export function defaultCamera() {
	const ratio = window.innerWidth / window.innerHeight;
	const cam = new PerspectiveCamera(55, ratio, 0.1, 100);
	return cam;
}

export default class BaseCamera extends BaseComponent {
	constructor(props = {}) {
		super(props);
		this.isCamera = true;
		this.isUsed = false;
	}

	afterInit() {
		if (this.cam && !this.base) this.base = this.cam;
		else if (!this.cam) this.cam = defaultCamera();
		if (!this.base) this.base = this.cam;
		const dbs = this.webgl.$renderer.drawingBufferSize;
		this.resizeSignal = dbs.watchImmediate(this.resize, this);
	}

	used() {}

	unused() {}

	resize(s) {
		this.cam.aspect = s.x / s.y;
		this.cam.updateProjectionMatrix();
	}

	destroy() {
		this.resizeSignal.unwatch();
		super.destroy();
	}
}
