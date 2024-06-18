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
	let mesh = null;
	let raycastIntance = null;

	const onClick = (Class.onClick ?? NOOP).bind(Class);
	const onHold = (Class.onHold ?? NOOP).bind(Class);
	const onEnter = (Class.onEnter ?? NOOP).bind(Class);
	const onLeave = (Class.onLeave ?? NOOP).bind(Class);

	const padding = w(0);

	/// #if __DEBUG__
	const displayDebug = storageSync(
		'webgl:' + Class.name + ':interaction:debug',
		w(false),
	);
	/// #endif

	function init() {
		const debugMat = new MeshBasicMaterial({ wireframe: true });
		mesh = Class.raycastMesh;
		mesh.material = debugMat;
		Object.assign(mesh.userData, { isDebug: true });

		const baseScale = mesh.scale.clone();
		padding.watchImmediate((v) => {
			mesh.scale.set(baseScale.x + v, baseScale.y + v, baseScale.z + v);
		});

		/// #if __DEBUG__
		displayDebug.watchImmediate((v) => (mesh.visible = v));
		/// #else
		mesh.visible = false;
		/// #endif

		raycastIntance = webgl.$raycast.add(mesh, {
			onDown: onClick,
			onHold: onHold,
			onEnter: onEnter,
			onLeave: onLeave,
			forceVisible: true,
			forcedScene: Class.scene,
		});

		Class.scene.base.add(mesh);
	}

	function destroy() {
		if (!mesh) return;
		raycastIntance?.remove();
		mesh.parent?.remove(mesh);
		delete Class.$composables['interaction'];
	}

	function disable() {
		raycastIntance?.disable();
	}

	function enable() {
		raycastIntance?.enable();
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
		const _disable = storageSync(
			'webgl:' + Class.name + ':interaction:isDisable',
			w(false),
		);
		gui.addBinding(_disable, 'value', { label: 'Disable' });
		_disable.watchImmediate((v) => (v ? disable() : enable()));
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

	Class.$composables['interaction'] = { padding, disable, enable, destroy };
	return { destroy, padding };
}
