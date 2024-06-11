import {
	Vector3,
	Quaternion,
	Object3D,
	BoxGeometry,
	MeshBasicMaterial,
	Mesh,
} from 'three';
import BaseCamera from '#webgl/core/BaseCamera';
import POVController from '#webgl/utils/POVController.js';

import Wobble from './Wobble.js';
import { useCameraHelper } from './useDebugHelper.js';

const HEIGHT = 1.95;
const DEFAULT_CAM = {
	position: new Vector3(-8.67, HEIGHT, 4.88),
	// position: new Vector3(-2, HEIGHT, -3.88),
	rotation: new Vector3(0, 0, 0),
	fov: 55,
};
const DEFAULT_TARGET = {
	position: new Vector3(4, 1.4, 0),
	// position: new Vector3(-7, 0, 3),
};

export class POVCamera extends BaseCamera {
	init() {
		this.$pointerLocked = false;

		this.onClick = this.onClick.bind(this);
		this.onPointerLockChange = this.onPointerLockChange.bind(this);

		this.$wobbleIntensity = 0.0005;
	}

	/// #if __DEBUG__
	devtools() {
		this.gui = this.webgl.$gui.addFolder({ title: '👁️ POVCamera' });

		this.wobble.devtools(this.gui);
		useCameraHelper(this);

		const { $getCurrentScene } = this.webgl;
		const scene = $getCurrentScene();

		const cubeGeo = new BoxGeometry(1, 1, 1);
		const cubeMaterial = new MeshBasicMaterial({ color: 0x00ff00 });

		this.debugTarget = new Mesh(cubeGeo, cubeMaterial);
		// const sub = DEFAULT_CAM.position.clone().divideScalar(1);
		this.debugTarget.position.copy(DEFAULT_TARGET.position);
		// this.debugTarget.position.add(sub);

		// this.webgl.$scenes._current.watchImmediate((scene) => {
		// 	if (!scene) return;
		// 	scene.component.base.add(this.debugTarget);
		// });
	}
	/// #endif

	onSceneSwitch(scene) {
		scene.camera = scene.add(this);
	}

	afterInit() {
		super.afterInit();

		// Create POV Camera
		this.base.position.copy(DEFAULT_CAM.position);
		this.base.fov = DEFAULT_CAM.fov;
		this.base.updateProjectionMatrix();

		// Create POV Controller
		this.controls = POVController(this.base, {
			enabled: this.$pointerLocked,
			target: DEFAULT_TARGET.position,
			/// #if __DEBUG__
			debug: true,
			/// #endif
		});

		// Create Wobble (idle) effect
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
