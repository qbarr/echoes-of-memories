import { storageSync, w } from '#utils/state/index.js';
import { webgl } from '#webgl/core';
import {
	IcosahedronGeometry,
	Mesh,
	MeshBasicMaterial,
	SphereGeometry,
} from 'three';

const NOOP = () => {};
const surchargeMethod = (_class, id, cb, before) => {
	const orig = _class[id];
	return (_class[id] = (...args) => {
		if (before) {
			cb();
			orig?.call(_class, ...args);
		} else {
			orig?.call(_class, ...args);
			cb();
		}
	});
};

export function useProximity(Class) {
	let camera = null;

	const onEnter = (Class.onEnterPerimeter ?? NOOP).bind(Class);
	const onLeave = (Class.onLeavePerimeter ?? NOOP).bind(Class);
	const onInside = (Class.onInsidePerimeter ?? NOOP).bind(Class);

	const states = {
		inside: false,
		outside: true,
	};

	const threshold = w(5);

	/// #if __DEBUG__
	let debugMesh = null;
	const displayDebug = storageSync(
		'webgl:' + Class.name + ':proximity:debug',
		w(false),
	);
	const forcedStates = {
		inside: false,
	};
	/// #endif

	function init() {
		const scene = Class.scene ?? webgl.$getCurrentScene();
		scene.$hooks.onCameraChange.watch(onCameraChange);
		camera = scene.getCurrentCamera().base;

		/// #if __DEBUG__
		const geo = new IcosahedronGeometry(1, 1);
		const mat = new MeshBasicMaterial({ color: 0xff0000, wireframe: true });
		debugMesh = new Mesh(geo, mat);
		Class.base.add(debugMesh);

		const baseScale = Class.base.scale;
		threshold.watchImmediate((v) => debugMesh.scale.setScalar(v));
		displayDebug.watchImmediate((v) => (debugMesh.visible = v));
		/// #endif
	}

	function onCameraChange(cam) {
		camera = cam.base;
	}

	function update() {
		const distance = camera.position.distanceTo(Class.base.position);
		const normDistance = distance / threshold.value;

		if (distance < threshold.value && states.outside) {
			states.inside = true;
			states.outside = false;
			onEnter();
			__DEBUG__ && debugMesh.material.color.setHex(0x00ff00);
		} else if (distance > threshold.value && states.inside) {
			states.inside = false;
			states.outside = true;
			onLeave();
			__DEBUG__ && debugMesh.material.color.setHex(0xff0000);
		}

		/// #if __DEBUG__
		if (forcedStates.inside || states.inside)
			onInside(distance, normDistance);
		/// #else
		if (states.inside) onInside(distance, normDistance);
		/// #endif

		// /// #if __DEBUG__
		// if (forcedStates.inside || states.inside)
		// 	debugMesh.material.color.setHex(0x00ff00);
		// else debugMesh.material.color.setHex(0xff0000);
		// /// #endif
	}

	function destroy() {
		scene.$hooks.onCameraChange.unwatch(onCameraChange);
		__DEBUG__ && Class.base.remove(debugMesh);
	}

	/// #if __DEBUG__
	function devtools(_gui) {
		const gui = (Class.gui ?? webgl.$gui).addFolder({ title: 'Proximity' });

		gui.addButton({ title: 'Enter' }).on('click', onEnter);
		gui.addButton({ title: 'Leave' }).on('click', onLeave);
		gui.addBinding(forcedStates, 'inside', { label: 'Force Inside' });
		gui.addSeparator();
		gui.addBinding(displayDebug, 'value', { label: 'Debug' });
		gui.addBinding(threshold, 'value', {
			label: 'Threshold',
			min: 0,
			max: 10,
			step: 0.01,
		});
	}
	/// #endif

	surchargeMethod(Class, 'afterInit', init);
	surchargeMethod(Class, 'afterUpdate', update);
	__DEBUG__ && surchargeMethod(Class, 'devtools', devtools);

	return { destroy, threshold };
}
