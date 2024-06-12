import { clamp } from '#utils/maths';
import { w } from '#utils/state';
import { Vector3 } from 'three';

import FpsCamera from '#webgl/core/FpsCamera';
import OrbitCamera from '#webgl/core/OrbitCamera';

import cinematicTool from './cinematicTool';
import DebugCameraMixin from './DebugCameraMixin';

import scene from './scene';

const FOV_MIN = 10;
const FOV_MAX = 170;
const DEFAULT_FOV = 75;

export function debugCameraPlugin(webgl) {
	const scenes = new Map();

	const storage = webgl.$app.$debug.storage ?? storage;

	const api = {
		init,
		update,
		enabled: w(!!+storage.getItem(lsKey('enabled'))),
		'Camera enabled': !!+storage.getItem(lsKey('enabled')),
		fps: w(),
		registerScene,
		unregisterScene,
		refreshGUI,
		currentCamera: null,
		currentTarget: null,
		fov: w(clamp(FOV_MIN, FOV_MAX, +storage.getItem(lsKey('fov')) || DEFAULT_FOV)),
		gui: {},
	};

	let copiedTimeout, cam, isInit;

	// webgl.registerMixin('debugCamera', DebugCameraMixin);
	// webgl.$hooks.afterStart.watch(init);

	const cinematicMode = cinematicTool(webgl, api);

	initGUI();
	const currentScene = { Scene: '' };

	let orbitCamera, fpsCamera;
	fpsCamera = api.fpsCamera = new FpsCamera({ fps: true });
	orbitCamera = api.orbitCamera = new OrbitCamera({});

	function updateFOV(v) {
		v = clamp(FOV_MIN, FOV_MAX, v);
		fpsCamera.cam.fov = v;
		orbitCamera.cam.fov = v;
		fpsCamera.cam.updateProjectionMatrix();
		orbitCamera.cam.updateProjectionMatrix();
		storage.setItem(lsKey('fov'), v);
	}

	function init() {
		isInit = true;
		api.enabled.watch(onCameraToggle);
		onCameraToggle(api.enabled.value);

		const scene = setScene(storage.getItem(lsKey('scene')));

		webgl.$hooks.afterUpdate.watch(update);
		cinematicMode.init();

		api.fov.watchImmediate(updateFOV);
	}

	function restoreCameras(scene) {
		if (!scene) return;
		if (scene.state.fpsCamera) {
			if (fpsCamera) fpsCamera.restoreCamera(scene.state.fpsCamera);
		}

		if (scene.state.orbitCamera) {
			if (orbitCamera) orbitCamera.restoreCamera(scene.state.orbitCamera);
		}
	}

	function lsKey(k) {
		return 'cam_debug_' + '_' + k;
	}

	function initGUI() {
		const gui = (api.gui = webgl.$gui.addFolder(
			Object.assign({
				title: '🎥 Debug Camera',
				index: 0,
			}),
		));

		let btn = (gui.toggleButton = gui.addBinding(api, 'Camera enabled', {
			index: 1,
		}));
		btn.on('change', ({ value }) => api.enabled.set(value));

		// btn = gui.resetButton = gui.addButton({ title: `Reset Camera`, index: 4 });
		// btn.on('click', () => resetCamera());
		btn = gui.copyButton = gui.addButton({ title: `Copy Coords` });
		btn.on('click', () => copyCoords());

		gui.resetToTarget = gui
			.addButton({ title: `Reset to Target` })
			.on('click', () => resetToTarget());

		gui.addBinding(api, 'fov', {
			label: 'FOV',
			index: 2,
			min: FOV_MIN,
			max: FOV_MAX,
			step: 0.05,
		});

		cinematicMode.initGui(gui);
	}

	function resetToTarget() {
		setTarget();
		fpsCamera.restoreCamera({
			position: new Vector3(),
			lat: 0,
			lon: 0,
		});
		api.fov.set(DEFAULT_FOV);
	}

	function copyCoords() {
		clearTimeout(copiedTimeout);
		if (!api.currentCamera) return;
		const posStr = api.currentCamera.cam.position
			.toArray()
			.map((v) => v.toFixed(5))
			.join(', ');
		const qtStr = api.currentCamera.cam.quaternion
			.toArray()
			.map((v) => v.toFixed(6))
			.join(', ');
		console.log(api.currentCamera.cam.rotation);
		console.log(api.currentCamera.cam.rotation.toArray());
		const eulerStr = api.currentCamera.cam.rotation
			.toArray()
			.filter((v) => typeof v !== 'string')
			.map((v) => v.toFixed(4))
			.join(', ');

		const str = [
			'{',
			'	position: [ ' + posStr + ' ],',
			'	quaternion: [ ' + qtStr + ' ],',
			'	euler: [ ' + eulerStr + ' ],',
			'   fov: ' + api.currentCamera.cam.fov.toFixed(2) + '',
			'}',
		].join('\n');

		const { gui } = api;
		navigator.clipboard
			.writeText(str)
			.then(() => {
				gui.copyButton.title = 'Copied!';
				return new Promise((r) => (copiedTimeout = setTimeout(r, 700)));
			})
			.then(() => (gui.copyButton.title = 'Copy Coords'));
	}

	function onCameraToggle(v) {
		api['Camera enabled'] = v;
		if (!v) {
			fpsCamera.controls.enabled = false;
			orbitCamera.controls.enabled = false;
		} else {
			if (api.currentCamera) api.currentCamera.controls.enabled = true;
		}

		if (api.scene) api.scene.stateUpdate.emit();
		storage.setItem(lsKey('enabled'), +v);
	}

	function registerScene(data) {
		const name = data.scene.name;
		if (!name) return;
		if (scenes.has(name)) return;

		const newScene = scene(data, webgl, {
			fps: fpsCamera,
			orbit: orbitCamera,
		});

		scenes.set(name, newScene);

		if ([...scenes.keys()].length === 1 && isInit) setScene(name);
		refreshGUI(true, false, false);
		return newScene;
	}

	function unregisterScene(name) {
		if (!name) return;
		if (!scenes.has(name)) return;
		scenes.get(name).destroy();
		scenes.delete(name);

		const keys = [...scenes.keys()];
		if (keys.length) {
			setScene(currentScene.Scene);
			refreshGUI(true, false, false);
		} else {
			setScene(null);
			refreshGUI();
		}
	}

	function setCamera(cam) {
		if (!api.scene) return;

		if (cam === 'FPS') {
			api.currentCamera = fpsCamera;
			orbitCamera.controls.enabled = false;
		} else {
			api.currentCamera = orbitCamera;
			fpsCamera.controls.enabled = false;
		}

		api.scene.setCamera(cam);
		api.currentCamera.controls.enabled = api.enabled.value;
		restoreCameras(api.scene);
	}

	function refreshScenes() {
		const { gui } = api;
		if (gui.scenesList) gui.scenesList.dispose();
		if (![...scenes.keys()].length) return;

		const options = [...scenes.keys()].reduce((p, c) => ((p[c] = c), p), {});

		gui.scenesList = gui.addBinding(currentScene, 'Scene', {
			index: 3,
			options,
		});

		gui.scenesList.on('change', ({ value }) => setScene(value));
	}

	function refreshCameras() {
		const { gui } = api;
		if (gui.camerasList) gui.camerasList.dispose();

		if (!api.scene) return;

		const scene = api.scene;

		const options = ['Orbit', 'FPS'].reduce((p, c) => ((p[c] = c), p), {});

		if (!scene) return;
		gui.camerasList = gui.addBinding(scene.state, 'Camera', {
			index: 4,
			options,
		});

		gui.camerasList.on('change', (v) => {
			setCamera(scene.state.Camera);

			gui.camerasList.refresh();
			if (scene.state.Camera === 'FPS') {
				gui.targetsList.disabled = true;
			} else {
				gui.targetsList.disabled = false;
			}
		});
	}

	function refreshTargets() {
		const { gui } = api;
		if (gui.targetsList) gui.targetsList.dispose();
		const scene = api.scene;
		if (!scene) return;

		const options = [...api.scene.targets.keys()].reduce(
			(p, c) => ((p[c] = c), p),
			{},
		);

		gui.targetsList = gui.addBinding(scene.state, 'Target', {
			index: 5,
			options,
		});

		if (scene.state.Camera === 'FPS') gui.targetsList.disabled = true;

		gui.targetsList.on('change', (v) => setTarget());
	}

	function setTarget() {
		api.currentTarget = api.scene.getCurrentTarget();
		api.scene.setTarget(api.scene.state.Target);
		orbitCamera.setTarget(api.currentTarget);
	}

	function setScene(n) {
		let name = n;
		let scene = scenes.get(name);
		if (!scene) {
			currentScene.Scene = null;
			api.scene = null;
		}
		if (!scene) name = [...scenes.keys()][0];
		scene = scenes.get(name);
		if (!scene) return;

		currentScene.Scene = name;
		if (api.scene) api.scene.unuse();
		api.scene = scene;

		setTarget();

		storage.setItem(lsKey('scene'), name);

		refreshGUI(false);
		const { gui } = api;
		if (gui.scenesList) gui.scenesList.refresh();
		setCamera(scene.state.Camera);
		api.scene.use();
		return scene;
	}

	function refreshGUI(
		needScenesRefresh = true,
		needCamerasRefresh = true,
		needTargetsRefresh = true,
	) {
		needScenesRefresh && refreshScenes();
		needCamerasRefresh && refreshCameras();
		needTargetsRefresh && refreshTargets();
	}

	function reset() {
		// const scene = scenes.get(currentScene.Scene);
		// if(scene) scene.update(api.currentCamera)
		// scene.reset();
	}

	function update() {
		if (!api.enabled.value) return;
		const scene = api.scene;
		if (!scene) return;
		if (api.currentCamera) {
			api.currentCamera.update();
			api.currentCamera.controls.enabled = !cinematicMode.enabled.value;
		}
		scene.update(api.currentCamera);
		cinematicMode.update(api.currentCamera);
	}

	return {
		install: () => {
			webgl.$debugCamera = api;
			webgl.registerMixin('debugCamera', DebugCameraMixin);
		},
		load: () => {
			webgl.$hooks.afterStart.watch(init);
		},
	};
}
