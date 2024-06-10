/// #if __DEBUG__
/// #code import { raf } from '#utils/raf';
/// #code import { storageSync} from '#utils/state';
/// #endif

import { w } from '#utils/state';
import { webgl } from '#webgl/core';
import { Box3, BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { OBB } from 'three/addons/math/OBB.js';

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

export function useInteraction(Class) {
	let raycastableMesh = null;

	const onClick = (Class.onClick ?? NOOP).bind(Class);
	const onHold = (Class.onHold ?? NOOP).bind(Class);
	const onEnter = (Class.onEnter ?? NOOP).bind(Class);
	const onLeave = (Class.onLeave ?? NOOP).bind(Class);

	const padding = w(0.3);

	/// #if __DEBUG__
	const displayDebug = storageSync(
		'webgl:' + Class.name + ':interaction:debug',
		w(false),
	);
	/// #endif

	function init() {
		// Scale the box to the object size
		// const box = new Box3().expandByObject(Class.base);
		// const vec3 = Vector3.get();
		// box.getSize(vec3);
		// const geo = new BoxGeometry(vec3.x, vec3.y, vec3.z);
		const debugMat = new MeshBasicMaterial({ wireframe: true });
		// const mesh = (raycastableMesh = new Mesh(geo, debugMat));
		const mesh = (raycastableMesh = Class.mesh.clone());
		mesh.material = debugMat;
		// mesh.rotation.copy(Class.base.rotation);
		Object.assign(mesh.userData, { isDebug: true });

		// Center the mesh
		// box.getCenter(vec3);
		// mesh.position.copy(vec3);
		// vec3.release();

		const baseScale = mesh.scale.clone();
		padding.watchImmediate((v) => {
			mesh.scale.set(baseScale.x + v, baseScale.y + v, baseScale.z + v);
		});

		/// #if __DEBUG__
		displayDebug.watchImmediate((v) => (mesh.visible = v));
		/// #else
		mesh.visible = false;
		/// #endif

		// console.log(Class, mesh);
		webgl.$raycast.add(mesh, {
			onDown: onClick,
			onHold: onHold,
			onEnter: onEnter,
			onLeave: onLeave,
			forceVisible: true,
			forcedScene: Class.scene,
		});

		Class.base.add(mesh);
	}

	function destroy() {
		webgl.$raycast.remove(raycastableMesh);
		Class.base?.remove?.(raycastableMesh);
	}

	/// #if __DEBUG__
	function devtools() {
		const gui = (Class.gui ?? webgl.$gui).addFolder({ title: 'Interaction' });

		gui.addButton({ title: 'Click' }).on('click', onClick);
		gui.addBinding({ hold: false }, 'hold', { label: 'Hold' }).on(
			'change',
			({ value }) => (value ? raf.add(onHold) : raf.remove(onHold)),
		);
		gui.addButton({ title: 'Enter' }).on('click', onEnter);
		gui.addButton({ title: 'Leave' }).on('click', onLeave);
		gui.addSeparator();
		gui.addBinding(displayDebug, 'value', { label: 'Debug' });
		gui.addBinding(padding, 'value', {
			label: 'Padding',
			min: 0,
			max: 10,
			step: 0.01,
		});
	}
	/// #endif

	init(); // Init here because it's use directly from afterInit
	// surchargeMethod(Class, 'afterInit', init);
	surchargeMethod(Class, 'beforeDestroy', destroy, true);
	__DEBUG__ && surchargeMethod(Class, 'devtools', devtools);

	return { destroy, padding };
}
