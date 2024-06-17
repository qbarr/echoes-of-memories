import BaseCamera from '#webgl/core/BaseCamera';
import POVController from './POVController.js';
import {
	BoxGeometry,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	PerspectiveCamera,
	Vector3,
	Vector4,
} from 'three';

import Wobble from './Wobble.js';
import { useCameraHelper } from './useDebugHelper.js';

import { TheatreSheet } from '#webgl/plugins/theatre/utils/index.js';
import { scenesDatas } from '../Scenes/datas.js';
import { types } from '@theatre/core';

import { damp, lerp } from '#utils/maths/map.js';

const HEIGHT = 3;
const DEFAULT_CAM = {
	position: new Vector3(-8.67, HEIGHT, 4.88),
	fov: 55,
};
const DEFAULT_TARGET = {
	position: new Vector3(4, 1, 0), // on clinique room
};

export class POVCamera extends BaseCamera {
	init() {
		this.$pointerLocked = false;

		this.onClick = this.onClick.bind(this);
		this.onPointerLockChange = this.onPointerLockChange.bind(this);

		this.base = new Object3D();
		this.target = new Vector4(0, 0, 0, 0.2);

		this.wobble_intentisty = { value: 0.0004 };
		this.wobble_frequency = { value: new Vector3(0.6, 0.6, 0.6) };
		this.wobble_amplitude = { value: new Vector3(0.2, 0.1, 0.1) };
		this.wobble_scale = { value: 1 };

		this.$statesMachine = this.webgl.$statesMachine.create('Camera', {
			filter: 'camera',
			camera: this,
		});
		this.$setState = this.$statesMachine.setState.bind(this.$statesMachine);
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

		// this.webgl.$hooks.afterStart.watchOnce(this.afterStart.bind(this));

		// Create POV Camera
		this.cam = this.base = new PerspectiveCamera(DEFAULT_CAM.fov, ratio, 0.1, 100);
		this.cam.position.copy(DEFAULT_CAM.position);
		this.cam.fov = DEFAULT_CAM.fov;
		this.cam.updateProjectionMatrix();

		// POV Controller
		this.controls = POVController(this, {
			enabled: this.$pointerLocked,
			target: DEFAULT_TARGET.position,
			/// #if __DEBUG__
			debug: true,
			/// #endif
		});

		// Create Wobble (idle) effect
		this.wobble = new Wobble({
			position: this.cam.position,
			frequency: this.wobble_frequency.value,
			amplitude: this.wobble_amplitude.value,
			scale: this.wobble_scale.value,
		});

		document.addEventListener('click', this.onClick); // TODO: temp
		document.addEventListener('pointerlockchange', this.onPointerLockChange);

		const dbs = this.webgl.$renderer.drawingBufferSize;
		this.resizeSignal = dbs.watchImmediate(this.resize, this);
	}

	goTo({ x, y, z }) {
		this.target.set(x, HEIGHT - y, z);
	}

	onPointerLockChange(ev) {
		if (!this.$pointerLocked) {
			this.$pointerLocked = true;
			this.webgl.$app.$store.pointerLocked = true;
			this.controls.enabled = this.$pointerLocked;
		} else {
			this.$pointerLocked = false;
			this.webgl.$app.$store.pointerLocked = false;
			this.controls.enabled = this.$pointerLocked;
		}
	}

	onClick(ev) {
		/// #if __DEBUG__
		if (preventDebug(ev)) return;
		/// #endif

		const { $getCurrentScene, $canvas, $app } = this.webgl;
		const { $store } = $app;
		const scene = $getCurrentScene();
		const currentCam = scene.getCurrentCamera();

		if (
			!this.$pointerLocked &&
			!$store.isPaused &&
			currentCam.name !== 'Debug Camera'
		) {
			$canvas.requestPointerLock();
		}
	}

	onInteractiveEnter() {
		this.wobble.setTargetLerpSpeed(0.002);
	}

	onInteractiveLeave() {
		this.wobble.setTargetLerpSpeed(0.02);
	}

	update() {
		const { dt, elapsed } = this.webgl.$time;

		this.wobble.update(elapsed * this.wobble_intentisty.value);
		this.base.position.damp(this.target, this.target.w, dt);

		if (this.controls) {
			this.controls.update();
		}

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
/// #code import { webgl } from '#webgl/core';
function preventDebug(ev) {
	const isStudioActive = webgl.$theatre.studioActive.value;
	return (
		ev.target.closest('.debug') ||
		ev.target.closest('#theatrejs-studio-root') ||
		isStudioActive
	);
}
/// #endif
