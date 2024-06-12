import BaseCamera from '#webgl/core/BaseCamera';
import POVController from '#webgl/utils/POVController.js';
import {
	BoxGeometry,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	PerspectiveCamera,
	Vector3,
} from 'three';

import { useTheatre } from '#webgl/utils/useTheatre.js';
import Wobble from './Wobble.js';
import { useCameraHelper } from './useDebugHelper.js';

import { TheatreSheet } from '#webgl/plugins/theatre/utils/index.js';
import { scenesDatas } from '../Scenes/datas.js';

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

		this.$wobbleIntensity = { value: 0.0004 };

		this.base = new Object3D();
		this.target = new Object3D();
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

		// Create Theatre Projects
		useTheatre(this, 'Bedroom:Camera');
		useTheatre(this, 'Clinique:Camera');

		this.webgl.$hooks.afterStart.watchOnce(this.createSheets.bind(this));
	}

	async createSheets() {
		const { clinique, bedroom } = scenesDatas;

		const cliniqueProject = this.$theatre['Clinique:Camera'];
		const bedroomProject = this.$theatre['Bedroom:Camera'];

		/// #if __DEBUG__
		// Need an await only if we use @theatre/studio
		await cliniqueProject.ready;
		await bedroomProject.ready;
		/// #endif

		const introSheet = new TheatreSheet('intro', { project: cliniqueProject });

		const audio = (await import('/assets/audios/clinique/intro.wav')).default;
		await introSheet.attachAudio(audio, 1);

		introSheet.$target('camera', this.target, { nudgeMultiplier: 0.01 });
		introSheet.$composer(['global', 'bokeh', 'lut', 'bloom']);
		// introSheet.$subtitles('subtitles', clinique.subtitles);

		introSheet.$compound('wobble', {
			intensity: this.$wobbleIntensity,
		});

		// const testSheet = new TheatreSheet('intro test', { project: cliniqueProject });
		// testSheet.$composer(['global', 'bokeh', 'lut', 'bloom']);
	}

	goTo({ x, y, z }) {
		this.target.position.set(x, HEIGHT - y, z);
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
		// this.wobble.update(this.webgl.$time.elapsed * this.$wobbleIntensity);
		// this.controls?.update?.();
		const { dt } = this.webgl.$time;

		this.base.position.damp(this.target.position, 0.1, dt);
		this.base.rotation.damp(this.target.rotation, 0.1, dt);
		// this.base.position.copy(this.target.position);
		// this.base.rotation.copy(this.target.rotation);

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
