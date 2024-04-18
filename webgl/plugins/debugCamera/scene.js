import { Object3D, Vector3 } from 'three';

import { s, w } from '#utils/state';

const defaultTarget = {
	object: new Object3D(),
	offset: new Vector3(10, 10, 8)
};

export default function scene(props, webgl, cams) {
	const gui = webgl.$debugCamera.gui;
	const storage = webgl?.$debug?.storage ?? localStorage;

	const targets = new Map();
	let targetsByName, _target;
	let tVec3a = new Vector3();
	let tVec3b = new Vector3();

	if (!props.targets) props.targets = {};

	props.targets.Origin = defaultTarget;

	const saved = storage.getItem(lsKey('backup'));
	const state = saved ? JSON.parse(saved) : {};

	state.Target = state.Target || Object.keys(props.targets)[ 0 ];
	state.Camera = state.Camera || 'Orbit';

	for (const k in props.targets) {
		addTarget(props.targets[ k ], { name: k });
	}

	setTarget(state.Target);
	let api = {
		addTarget,
		removeTarget,
		setTarget,
		setCamera,
		reset,
		targets,
		getTargetsByName,
		getCurrentTarget,
		used: w(false),
		update,
		use,
		camera: w(null),
		stateUpdate: s(),
		unuse,
		destroy,
		state,
	};

	api.stateUpdate.watch(()=>{
		if (webgl.$debugCamera) {
			if (webgl.$debugCamera.enabled.value && api.used.value) {
				props.scene.overrideCamera = webgl.$debugCamera.currentCamera;
			} else props.scene.overrideCamera = null;
		}
	});

	setCamera(state.Camera);

	function use(gui) {
		api.used.set(true);
		api.stateUpdate.emit();
	}
	function unuse() {
		api.used.set(false);
		api.stateUpdate.emit();
	}

	function destroy() {
		unuse();
		api.stateUpdate.emit();
		api.used.unwatchAll();
		api.camera.unwatchAll();
		api.stateUpdate.unwatchAll();
		api.state = null;
		api = null;
	}

	function setCamera(v) {
		state.Camera = v;
		api.camera.set(state.Camera);
		api.stateUpdate.emit();
		lsBackup();
	}

	function lsKey(k) {
		return 'cam_debug_' + props.scene.name + '_' + k;
	}

	function addTarget(obj, data) {
		if (targets.has(obj)) return;
		targets.set(data.name, obj);
		targetsByName = [ ...targets.entries() ]
			.reduce((p, v) => (p[ v[ 0 ] ] = v[ 1 ], p), {});

		if (data.use) setTarget(data.name);
		refreshTargets();
	}

	function getTargetsByName() {
		return targetsByName;
	}

	function getCurrentTarget() {
		if (targetsByName[ state.Target ]) return targetsByName[ state.Target ];
		else return targetsByName[ 'Origin' ];
	}

	function refreshTargets() {
		webgl.$debugCamera
		&& webgl.$debugCamera.refreshGUI
		&& webgl.$debugCamera.refreshGUI(false, false, true);
	}

	function setTarget(name, force) {
		const target = targetsByName[ name ] || targetsByName.Origin;
		if (!target) return;
		if (!force && _target === target) return;

		state.Target = name;
		webgl.$debugCamera.gui
		&& webgl.$debugCamera.gui.targetsList
		&& webgl.$debugCamera.gui.targetsList.refresh();
		_target = target;
		lsBackup();

		tVec3a.copy(target.offset || defaultTarget.offset);

		if (target.object) {
			target.object.getWorldPosition(tVec3b);
			target.object.localToWorld(tVec3a).sub(tVec3b);
		}

		// this.controls.target = target.object || target.position || defaultTarget.position;
		// this.controls.offsetedTarget.multiplyScalar(0);
		// this.controls.targetOffset.multiplyScalar(0);
		// this.controls.offsetToSpherical(tVec3a, this.controls.sphericalTarget);
		// this.controls.spherical.copy(this.controls.sphericalTarget);
		// this.controls.updatePosition();
	}


	function lsBackup() {
		storage.setItem(lsKey('backup'), JSON.stringify(state));
	}

	function removeTarget(name) {
		const targetName = targets.get(name);
		if (!targetName) return;
		targets.delete(name);
		delete targetsByName[ targetName ];
		refreshTargets();
	}

	// function backupCamera() {
	// 	// const targetOffset = { ...this.controls.targetOffset };
	// 	// const position = { ...this.cam.position };
	// 	// const sphericalTarget = { ...this.controls.sphericalTarget };
	// 	// return { position, targetOffset, sphericalTarget };
	// 	return {}
	// }

	function reset() {

	}

	function backupOrbitCamera(cam) {
		const targetOffset = { ...cam.controls.targetOffset };
		const position = { ...cam.cam.position };
		const sphericalTarget = { ...cam.controls.sphericalTarget };
		return { position, targetOffset, sphericalTarget };
	}

	function backupFpsCamera(cam) {
		const position = { ...cam.base.position };
		const lat = cam.controls.lat;
		const lon = cam.controls.lon;
		return { position, lat, lon };
	}

	function update(cam) {
		if (!api) return;
		if (!api.used.value) return;
		if (cam.fps.value) {
			api.state.fpsCamera = backupFpsCamera(cam);
		} else {
			api.state.orbitCamera = backupOrbitCamera(cam);
		}

		if (webgl.$time) {
			if (webgl.$time.frameNum % 20 == 0) {
				lsBackup();
			}
		}
	}

	return api;
}
