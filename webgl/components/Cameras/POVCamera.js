import {
	Vector3,
	Quaternion,
	Object3D,
	BoxGeometry,
	MeshBasicMaterial,
	Mesh,
	PerspectiveCamera,
} from 'three';
import BaseCamera from '#webgl/core/BaseCamera';
import POVController from '#webgl/utils/POVController.js';

import Wobble from './Wobble.js';
import { useCameraHelper } from './useDebugHelper.js';
import { useTheatre } from '#webgl/utils/useTheatre.js';

import { scenesDatas } from '../Scenes/datas.js';
import { types } from '@theatre/core';

const HEIGHT = 1.95;
const DEFAULT_CAM = {
	position: new Vector3(-8.67, HEIGHT, 4.88),
	fov: 55,
};
const DEFAULT_TARGET = {
	position: new Vector3(4, 1.4, 0),
};

export class POVCamera extends BaseCamera {
	init() {
		this.$pointerLocked = false;

		this.onClick = this.onClick.bind(this);
		this.onPointerLockChange = this.onPointerLockChange.bind(this);

		this.$wobbleIntensity = 0.0004;

		this.base = new Object3D();
		this.target = new Object3D();

		useTheatre(this, { id: 'POVCamera' });

		this.createSheets();
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
		const ratio = window.innerWidth / window.innerHeight;

		// Create POV Camera
		this.cam = this.base = new PerspectiveCamera(DEFAULT_CAM.fov, ratio, 0.1, 100);
		this.cam.position.copy(DEFAULT_CAM.position);
		this.cam.fov = DEFAULT_CAM.fov;
		this.cam.updateProjectionMatrix();

		// Create POV Controller
		this.controls = POVController(this, {
			enabled: this.$pointerLocked,
			target: DEFAULT_TARGET.position,
			/// #if __DEBUG__
			debug: true,
			/// #endif
		});

		// Create Wobble (idle) effect
		this.wobble = new Wobble(this.cam.position);

		document.addEventListener('click', this.onClick); // TODO: temp
		document.addEventListener('pointerlockchange', this.onPointerLockChange);

		const dbs = this.webgl.$renderer.drawingBufferSize;
		this.resizeSignal = dbs.watchImmediate(this.resize, this);
	}

	createSheets() {
		const { clinique, bedroom } = scenesDatas;

		// Clinique
		// const cliniqueKeys = Object.keys(clinique);
		// cliniqueKeys.forEach((k) => {
		// 	const obj = clinique[k];
		// 	if (obj.class) {
		// 		cliniqueKeys.forEach((l) => {
		// 			if (l === k) return;
		// 			if (!clinique[l].class) return;
		// 			this.log('Creating sheet', `${l}_to_${k}`);
		// 			obj.tl = this.$createTimeline(`clinique_${l}_to_${k}`);
		// 			obj.tl.add('position', {
		// 				position: types.compound({
		// 					x: types.number(this.target.position.x),
		// 					y: types.number(this.target.position.y),
		// 					z: types.number(this.target.position.z),
		// 				}),
		// 			});
		// 			obj.tl.add('rotation', {
		// 				rotation: types.compound({
		// 					x: types.number(this.target.rotation.x),
		// 					y: types.number(this.target.rotation.y),
		// 					z: types.number(this.target.rotation.z),
		// 				}),
		// 			});
		// 		});
		// 	}
		// });
		// this.log('Clinique sheets created', clinique);

		// // Bedroom
		// const bedroomKeys = Object.keys(bedroom);
		// bedroomKeys.forEach((k) => {
		// 	const obj = bedroom[k];
		// 	if (obj.class) {
		// 		bedroomKeys.forEach((l) => {
		// 			if (l === k) return;
		// 			if (!bedroom[l].class) return;
		// 			this.log('Creating sheet', `${l}_to_${k}`);
		// 			obj.tl = this.$createTimeline(`bedroom_${l}_to_${k}`);
		// 		});
		// 	}
		// });
	}

	setPosition(x, y, z) {
		if (Array.isArray(x)) {
			this.base.position.fromArray(x);
			this.base.position.setY(HEIGHT);
			return;
		}
		if (typeof x === 'object') {
			!isNaN(x.x) && this.base.position.setX(x.x);
			// !isNaN(x.y) && this.base.position.setY(x.y);
			!isNaN(x.z) && this.base.position.setZ(x.z);
			return;
		}

		!isNaN(x) && this.base.position.setX(x);
		// !isNaN(y) && this.base.position.setY(y);
		!isNaN(z) && this.base.position.setZ(z);

		return this;
	}

	goTo({ x, y, z }) {
		this.log('goTo', x, y, z);
		this.base.position.set(x, HEIGHT - y, z);
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

	onInteractiveEnter() {
		this.wobble.onInteractiveEnter();
	}

	onInteractiveLeave() {
		this.wobble.onInteractiveLeave();
	}

	update() {
		this.wobble.update(this.webgl.$time.elapsed * this.$wobbleIntensity);
		this.controls?.update?.();
		this.cam.updateProjectionMatrix();
	}

	/// #if __DEBUG__
	devtools() {
		this.gui = this.webgl.$gui.addFolder({ title: '👁️ POVCamera' });
		this.wobble.devtools(this.gui);
		useCameraHelper(this);
	}
	/// #endif
}

/// #if __DEBUG__
function preventDebug(ev) {
	return ev.target.closest('.debug') || ev.target.closest('#theatrejs-studio-root');
}
/// #endif
