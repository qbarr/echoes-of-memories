import BaseCamera from '#webgl/core/BaseCamera';
import POVController from './POVController.js';
import {
	BoxGeometry,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	PerspectiveCamera,
	Vector2,
	Vector3,
	Vector4,
	Group,
} from 'three';

import Wobble from './Wobble.js';
import { useCameraHelper } from './useDebugHelper.js';

import { TheatreSheet } from '#webgl/plugins/theatre/utils/index.js';
import { scenesDatas } from '../Scenes/datas.js';
import { types } from '@theatre/core';

import { damp, dampPrecise, lerp } from '#utils/maths/map.js';
import { w } from '#utils/state/index.js';
import { throttle } from '#utils/async/throttle.js';

const HEIGHT = 3;
const DEFAULT_CAM = {
	position: new Vector3(-8.67, HEIGHT, 4.88),
	fov: 55,
};
const DEFAULT_TARGET = {
	position: new Vector3(4, 1, 0), // on clinique room
};

const audiosID = {
	'clinique': 'clinique',
	'tv-room': 'clinique',
	'bedroom': 'chambre',
};
export class POVCamera extends BaseCamera {
	init() {
		this.$pointerLocked = false;

		this.onClick = this.onClick.bind(this);
		this.onPointerLockChange = this.onPointerLockChange.bind(this);

		this.base = new Object3D();
		this.target = new Vector4(0, 0, 0, 0.2);

		this.walkSettings = {
			prev: new Vector2(),
			current: new Vector2(),
			velocity: new Vector2(),
		};

		this.wobble_intentisty = w(0.0004);
		this.wobble_frequency = w(new Vector3(0, 0.3, 0));
		this.wobble_amplitude = w(new Vector3(0, 0.1, 0));
		this.wobble_scale = w(0);

		this.$statesMachine = this.webgl.$statesMachine.create('Camera', {
			filter: 'camera',
			camera: this,
		});
		this.$setState = this.$statesMachine.setState.bind(this.$statesMachine);

		this.isSfxActive = false;
		this.triggerStepSFX = throttle(this.triggerStepSFX.bind(this), 600);

		this.webgl.$hooks.afterStart.watchOnce(this.createSheets.bind(this));
	}

	createSheets() {
		const $project = this.webgl.$theatre.get('Common');

		this.$generiqueSheet = $project.getSheet('Generique');
		this.$generiqueSheet.$addCamera();
		this.$generiqueSheet
			.$list('Switch Scene', ['clinique', 'tv-room', 'bedroom'])
			.onChange((v) => {
				v && this.webgl.$scenes.switch(v, true);
			});
		this.$generiqueSheet.$composer(['*']);

		const uiScene = this.webgl.$scenes.ui.component;
		const generiqueScreen = uiScene.generiqueScreen;
		this.$generiqueSheet.$float('Generique Text Index', generiqueScreen.currentIndex, {
			range: [-1, generiqueScreen.texts.length - 1],
		}).onChange((v) => generiqueScreen.currentIndex.set(v, true));
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
		const { $getCurrentScene } = this.webgl;
		const scene = $getCurrentScene();
		const ratio = window.innerWidth / window.innerHeight;

		// this.webgl.$hooks.afterStart.watchOnce(this.afterStart.bind(this));

		// Create POV Camera
		this.cam = new PerspectiveCamera(DEFAULT_CAM.fov, ratio, 0.1, 100);
		this.cam.fov = DEFAULT_CAM.fov;
		this.cam.updateProjectionMatrix();

		this.base.add(this.cam);
		this.base.position.copy(DEFAULT_CAM.position);

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
			walksSettings: this.walkSettings,
		});

		document.addEventListener('click', this.onClick);
		document.addEventListener('pointerlockchange', this.onPointerLockChange);

		const dbs = this.webgl.$renderer.drawingBufferSize;
		this.resizeSignal = dbs.watchImmediate(this.resize, this);
	}

	setPosition(pos) {
		Array.isArray(pos) ? this.target.fromArray(pos) : this.target.copy(pos);
		this.target.y = HEIGHT;
		this.target.w = 0.2;
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

	triggerStepSFX() {
		if (!this.isSfxActive) return;

		const { $scenes, $audio } = this.webgl;
		const suffix = audiosID[$scenes.current.name];
		$audio.play('common/pas-' + suffix);
	}

	walkAnimation(dt) {
		const { position: camPostion } = this.base;
		const { walkSettings } = this;

		walkSettings.prev.copy(walkSettings.current);
		walkSettings.current.set(camPostion.x, camPostion.z);

		walkSettings.velocity
			.subVectors(walkSettings.current, walkSettings.prev)
			.multiplyScalar(dt);

		if (walkSettings.velocity.lengthSq() > 0.1) this.triggerStepSFX();

		walkSettings.velocityLength = walkSettings.velocity.lengthSq();

		if (walkSettings.velocityLength > 0.1) this.wobble.goWalkMode();
		else this.wobble.goDefaultMode();
	}

	update() {
		const { dt, elapsed } = this.webgl.$time;

		// this.triggerStepSFX();

		this.wobble.update(elapsed * this.wobble_intentisty.value);

		if (!this.$statesMachine?.currentState?.id.includes(['GENERIQUE'])) {
			this.base.position.set(this.target.x, this.target.y, this.target.z);
		} else if (!this.$statesMachine?.currentState?.id.includes(['FLASHBACK_FREE'])) {
			this.base.position.damp(this.target, this.target.w, dt);
		}

		this.controls?.update();

		this.walkAnimation(dt);
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
