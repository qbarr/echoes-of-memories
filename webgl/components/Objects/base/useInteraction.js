/// #if __DEBUG__
/// #code import { raf } from '#utils/raf';
/// #code import { storageSync} from '#utils/state';
/// #endif

import { w } from '#utils/state';
import { webgl } from '#webgl/core';
import { Box3, BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three';


const NOOP = () => {};
const surchargeMethod = (_class, id, cb, before) => {
	const orig = _class[id];
	return _class[id] = (...args) => {
		if (before) {
			cb();
			orig?.call(_class, ...args);
		} else {
			orig?.call(_class, ...args);
			cb();
		}
	}
}

export function useInteraction(Class) {
	let raycastableMesh = null

	const click = (Class.onClick ?? NOOP).bind(Class)
	const hold = (Class.onHold ?? NOOP).bind(Class)
	const enter = (Class.onEnter ?? NOOP).bind(Class)
	const leave = (Class.onLeave ?? NOOP).bind(Class)

	const padding = w(0);

	/// #if __DEBUG__
	const displayDebug = storageSync('webgl:'+Class.name+':interaction:debug', w(false));
	/// #endif

	function init() {
		// Scale the box to the object size
		const box = new Box3().expandByObject(Class.base)
		const vec3 = Vector3.get()
		box.getSize(vec3);
		const geo = new BoxGeometry(vec3.x, vec3.y, vec3.z);
		const debugMat = new MeshBasicMaterial({ wireframe: true });
		const mesh = raycastableMesh = new Mesh(geo, debugMat);

		// Center the mesh
		box.getCenter(vec3)
		mesh.position.copy(vec3);
		vec3.release()

		const baseScale = Class.base.scale
		padding.watchImmediate(v => {
			mesh.scale.set(
				baseScale.x + v,
				baseScale.y + v,
				baseScale.z + v
			)
		})

		/// #if __DEBUG__
		displayDebug.watchImmediate(v => mesh.visible = v);
		/// #else
		mesh.visible = false;
		/// #endif

		webgl.$raycast.add(mesh, {
			onDown: click,
			onHold: hold,
			onEnter: enter,
			onLeave: leave,
			forceVisible: true,
		});

		Class.base.add(mesh);
	}

	function destroy() {
		webgl.$raycast.remove(raycastableMesh);
		Class.base?.remove?.(raycastableMesh);
	}

	function devtools() {
		const gui = (Class.gui ?? webgl.$gui).addFolder({ title: 'Interaction' });

		gui.addButton({ title: 'Click' }).on('click', click);
		gui.addBinding({ hold: false }, 'hold', { label: 'Hold' })
			.on('change', ({ value }) => value ? raf.add(hold) : raf.remove(hold));
		gui.addButton({ title: 'Enter' }).on('click', enter);
		gui.addButton({ title: 'Leave' }).on('click', leave);
		gui.addSeparator();
		gui.addBinding(displayDebug, 'value', { label: 'Debug' })
			.on('change', ({ value }) => displayDebug.set(value))

		gui.addBinding(padding, 'value', { label: 'Padding', min: 0, max: 10, step: 0.01 })
			.on('change', ({ value }) => padding.set(value))

	}

	surchargeMethod(Class, 'afterInit', init);
	surchargeMethod(Class, 'beforeDestroy', destroy, true);
	surchargeMethod(Class, 'devtools', devtools);

	return { destroy, padding };
}
