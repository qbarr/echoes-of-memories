import { Scene } from 'three';

import BaseComponent from './BaseComponent.js';
import BaseCamera from './BaseCamera.js';
import { s } from '#utils/state';

function toggleCam(cam, state) {
	if (!cam || cam.isUsed == state) return;
	cam.isUsed = !!state;
	if (cam.isUsed) cam.used();
	else cam.unused();
}

export default class BaseScene extends BaseComponent {
	constructor(props = {}) {
		props.autoAttach = !!(props.autoAttach ?? true);
		super(props, true);
		this.isScene = true;

		this.hooks = {
			afterMatrixWorldUpdate: s(),
		};

		this._cam = { current: false, forced: false };
		if (!this.props) this.props = props;
	}

	triggerInit() {
		if (this.isInit) return;
		this.base = new Scene();
		this.base.matrixWorldAutoUpdate = false;
		super.triggerInit();
		if (!this.camera) this.camera = this.add(BaseCamera);
		if (this.props.autoAttach) this.attach();
	}

	triggerUpdate() {
		super.triggerUpdate();
		if (this.isDestroyed) return;
		this.base.updateMatrixWorld();
		this.hooks.afterMatrixWorldUpdate.emit();
	}

	attach() { BaseComponent.triggerAttached(this, this) }
	detach() { BaseComponent.triggerDetached(this, this) }

	update() {}
	init() {}

	get camera() { return this._cam.current }
	set camera(v) {
		if (!v || !v.isCamera) v = false;
		const cam = this._cam;
		if (cam.current === v) return;
		toggleCam(cam.current, false);
		cam.current = v;
		if (!cam.forced) toggleCam(cam.current, false);
	}

	get overrideCamera() { return this._cam.forced }
	set overrideCamera(v) {
		if (!v || !v.isCamera) v = false;
		const cam = this._cam;
		if (cam.forced === v) return;
		toggleCam(cam.forced, false);
		toggleCam(cam.current, false);
		cam.forced = v;
		toggleCam(cam.forced, true);
	}

	getCurrentCamera() {
		return this._cam.forced || this._cam.current;
	}

	async enter() {}
	async leave() {}

	render() {
		const renderer = this.webgl.$threeRenderer;
		const camera = this.getCurrentCamera();
		if (!camera) return;
		// renderer.render(this.base, camera.cam);
	}

	triggerRender() {
		if (this.beforeRender) this.beforeRender();
		this.render();
		if (this.afterRender) this.afterRender();
	}

	destroy() {
		this.detach();
		for (let k in this.hooks) this.hooks[ k ].unwatchAll();
		super.destroy();
	}
}
