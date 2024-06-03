import { MeshBasicMaterial, Scene } from 'three';

import BaseComponent from './BaseComponent.js';
import BaseCamera from './BaseCamera.js';
import { s } from '#utils/state';
import { deferredPromise } from '#utils/async/deferredPromise.js';

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
		this.isReady = deferredPromise();

		this.$hooks = {
			afterMatrixWorldUpdate: s(),
			onCameraChange: s(),
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

		this.isReady.resolve();
		this.isReady = null;
	}

	triggerUpdate() {
		super.triggerUpdate();
		if (this.isDestroyed) return;
		this.base.updateMatrixWorld();
		this.$hooks.afterMatrixWorldUpdate.emit();
	}

	beforeInit() {
		/// #if __DEBUG__
		this.gui = this.webgl.$gui.addFolder({ title: '🗿 ' + this.name });
		/// #endif
	}

	toggleSelectedBloom(isBloom) {
		const { $assets } = this.webgl;
		const children = this.children.dynamic;
		for (let i = 0, l = children.length; i < l; i++) {
			const child = children[i];
			if (!child || !child.base) continue;

			// register base Material to backup
			child.base.traverse((c) => {
				if (c.baseMaterial) return;
				if (!c.isMesh) return;
				c.baseMaterial = c.baseMaterial ?? c.material;
				c.darkMaterial = new MeshBasicMaterial({
					color: 0x000000,
					wireframe: !!c.material.wireframe,
				});
			});

			if (isBloom) {
				child.base.traverse((c) => {
					if (!c.isMesh) return;
					if (child.needBloom) c.material = c.baseMaterial;
					else c.material = c.darkMaterial;
				});
			} else {
				child.base.traverse((c) => {
					if (!c.isMesh) return;
					if (child.needBloom) c.material = c.darkMaterial;
					else c.material = c.baseMaterial;
				});
			}
		}
	}

	attach() {
		BaseComponent.triggerAttached(this, this);
		const children = this.children.dynamic;
		for (let i = 0, l = children.length; i < l; i++) {
			const child = children[i];
			if (child) BaseComponent.triggerAttached(child, this);
			if (!child) continue;
			// Dirty - adjust loop if the item is destroyed during update
			if (child.isDestroyed) {
				l--;
				i--;
			}
		}
	}

	detach() {
		BaseComponent.triggerDetached(this, this);
		const children = this.children.dynamic;
		for (let i = 0, l = children.length; i < l; i++) {
			const child = children[i];
			if (child) BaseComponent.triggerDetached(child, this);
			if (!child) continue;
			// Dirty - adjust loop if the item is destroyed during update
			if (child.isDestroyed) {
				l--;
				i--;
			}
		}
	}

	update() {}
	init() {}

	get camera() {
		return this._cam.current;
	}
	set camera(v) {
		if (!v || !v.isCamera) v = false;
		const cam = this._cam;
		if (cam.current === v) return;
		toggleCam(cam.current, false);
		cam.current = v;
		if (!cam.forced) toggleCam(cam.current, false);

		this.$hooks.onCameraChange.emit(this.getCurrentCamera());
	}

	get overrideCamera() {
		return this._cam.forced;
	}
	set overrideCamera(v) {
		if (!v || !v.isCamera) v = false;
		const cam = this._cam;
		if (cam.forced === v) return;
		toggleCam(cam.forced, false);
		toggleCam(cam.current, false);
		cam.forced = v;
		toggleCam(cam.forced, true);

		this.$hooks.onCameraChange.emit(this.getCurrentCamera());
	}

	getCurrentCamera() {
		return this._cam.forced || this._cam.current;
	}

	async triggerEnter() {
		this.beforeEnter && (await this.beforeEnter());
		this.enter && (await this.enter());

		const children = this.children.dynamic;
		for (let i = 0, l = children.length; i < l; i++) {
			const child = children[i];
			if (child) child.enter && (await child.enter());
			if (!child) continue;
			// Dirty - adjust loop if the item is destroyed during update
			if (child.isDestroyed) {
				l--;
				i--;
			}
		}

		this.afterEnter && (await this.afterEnter());
	}

	async triggerLeave() {
		this.beforeLeave && (await this.beforeLeave());

		const children = this.children.dynamic;
		for (let i = 0, l = children.length; i < l; i++) {
			const child = children[i];
			if (child) child.leave && (await child.leave());
			if (!child) continue;
			// Dirty - adjust loop if the item is destroyed during update
			if (child.isDestroyed) {
				l--;
				i--;
			}
		}

		this.leave && (await this.leave());
		this.afterLeave && (await this.afterLeave());
	}

	render() {
		const renderer = this.webgl.$threeRenderer;
		const camera = this.getCurrentCamera();
		if (!camera) return;
		renderer.render(this.base, camera.cam);
	}

	triggerRender() {
		if (this.beforeRender) this.beforeRender();
		this.render();
		if (this.afterRender) this.afterRender();
	}

	destroy() {
		this.detach();
		for (let k in this.$hooks) this.$hooks[k].unwatchAll();
		super.destroy();
	}
}
