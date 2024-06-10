import { Vector3, Object3D } from 'three';
import BaseCamera from '#webgl/core/BaseCamera';
import POVController from '#webgl/utils/POVController.js';

import Wobble from './Wobble.js';
import { useCameraHelper } from './useDebugHelper.js';

const HEIGHT = 2.75;
const DEFAULT_FOV = 55;

const DEFAULT_TARGET = {
	object: new Object3D(),
	offset: new Vector3(0, HEIGHT, 0),
};

export class POVCamera extends BaseCamera {
	init() {
		this.$pointerLocked = false;

		this.onClick = this.onClick.bind(this);
		this.onPointerLockChange = this.onPointerLockChange.bind(this);

		// this.$wobbleIntensity = 0.001;
		// this.$wobbleIntensity = 0.0001;
		this.$wobbleIntensity = 0.0005;
	}

	/// #if __DEBUG__
	devtools() {
		this.gui = this.webgl.$gui.addFolder({ title: '👁️ POVCamera' });

		this.wobble.devtools(this.gui);

		useCameraHelper(this);
	}
	/// #endif

	afterInit() {
		super.afterInit();

		this.base.position.fromArray([-8.67082, HEIGHT, 4.88725]);
		this.base.quaternion.fromArray([-0.095825, -0.464204, -0.050601, 0.879074]);
		this.base.fov = DEFAULT_FOV;
		this.base.updateProjectionMatrix();

		this.controls = POVController(this.base, {
			enabled: this.$pointerLocked,
		});

		this.wobble = new Wobble(this.base.position);

		document.addEventListener('click', this.onClick); // temp
		document.addEventListener('pointerlockchange', this.onPointerLockChange);
	}

	onPointerLockChange(ev) {
		this.log('onPointerLockChange', this.$pointerLocked);

		if (!this.$pointerLocked) {
			this.$pointerLocked = true;
			this.controls.enabled = this.$pointerLocked;
		} else {
			this.$pointerLocked = false;
			this.controls.enabled = this.$pointerLocked;
		}
	}

	onClick(ev) {
		/// #if __DEBUG__
		if (preventDebug(ev)) return;
		/// #endif

		const { $getCurrentScene, $canvas } = this.webgl;
		const scene = $getCurrentScene();
		const currentCam = scene.getCurrentCamera();

		if (!this.$pointerLocked && currentCam.name !== 'Debug Camera') {
			this.log('onClick');
			$canvas.requestPointerLock();
		}
	}

	update() {
		this.wobble.update(this.webgl.$time.elapsed * this.$wobbleIntensity);
		this.controls?.update?.();
		this.base.updateProjectionMatrix();
	}
}

/// #if __DEBUG__
function preventDebug(ev) {
	return ev.target.closest('.debug');
}
/// #endif
