import { Vector3, Object3D, PerspectiveCamera, Vector2 } from 'three';
import BaseCamera from '#webgl/core/BaseCamera';
import POVController from '#webgl/utils/POVController.js';

import Wobble from './Wobble.js';
import { useCameraHelper } from './useDebugHelper.js';
import { useTheatre } from '#webgl/utils/useTheatre.js';

import { scenesDatas } from '../Scenes/datas.js';
import { types } from '@theatre/core';
import { TheatreSheet } from '#webgl/plugins/theatre/utils/index.js';
import { w } from '#utils/state/index.js';

const HEIGHT = 3;
const DEFAULT_FOV = 55;

export class POVCamera extends BaseCamera {
	init() {
		this.$pointerLocked = false;

		this.onClick = this.onClick.bind(this);
		this.onPointerLockChange = this.onPointerLockChange.bind(this);

		this.$wobbleIntensity = 0.0004;

		this.base = new Object3D();
		this.target = new Object3D();
	}

	afterInit() {
		const ratio = window.innerWidth / window.innerHeight;
		this.cam = this.base = new PerspectiveCamera(DEFAULT_FOV, ratio, 0.1, 100);

		// this.base.position.fromArray([-8.67082, 0, 4.88725]);
		// this.cam.position.fromArray([0, HEIGHT, 0]);
		this.cam.quaternion.fromArray([-0.095825, -0.464204, -0.050601, 0.879074]);
		this.cam.fov = DEFAULT_FOV;
		this.cam.updateProjectionMatrix();

		// this.base.add(this.cam);

		this.controls = POVController(this, {
			enabled: this.$pointerLocked,
		});

		this.wobble = new Wobble(this.base.position);

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
		/// #if __DEBUG__
		const audio = (await import('/assets/audios/clinique/intro.wav')).default;
		console.log(audio);
		await introSheet.attachAudio(audio, 1);
		/// #endif
		introSheet.$target('camera', this.target, { nudgeMultiplier: 0.01 });
		introSheet.$composer(['bokeh', 'lut', 'bloom']);
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
