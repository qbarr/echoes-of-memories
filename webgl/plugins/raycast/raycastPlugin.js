import { Raycaster, Vector2 } from 'three';

import { clampedMap } from '#utils/maths';
import { w } from '#utils/state';

const NOOP = (v) => v;
const opts = { passive: false };

export function raycastPlugin(webgl) {
	const scenes = new WeakMap();
	let currentScene = null;

	const intersects = [];
	let holdingMouseTimeout = null;
	let cameraNeedsUpdate = false;

	const pointer = {
		hasClicked: false,
		justClicked: false,
		isHolding: false,
		isPressed: false,

		clickPosition: new Vector2(-Infinity, -Infinity),
		position: new Vector2(-Infinity, -Infinity),
	};

	const raycaster = new Raycaster();

	const api = {
		get count() {
			const scene = webgl.$scenes.current;
			if (!scenes.has(scene?.id)) return 0;
			const { objects } = scenes.get(scene.id);
			return objects.size;
		},
		get objects() {
			const scene = webgl.$scenes.current;
			if (!scenes.has(scene?.id)) return [];
			const { objects } = scenes.get(scene.id);
			return objects;
		},
		get raycaster() {
			return raycaster;
		},

		add,
		remove,

		listen,
		stop,

		update,
	};

	function toggle(shouldListen, { $el = document } = {}) {
		const ev = shouldListen ? 'addEventListener' : 'removeEventListener';

		$el[ev]('touchstart', onDown, opts);
		$el[ev]('touchmove', onMove, opts);
		$el[ev]('touchend', onUp, opts);
		$el[ev]('touchcancel', onUp, opts);

		$el[ev]('mousedown', onDown, opts);
		$el[ev]('mousemove', onMove, opts);
		$el[ev]('mouseup', onUp, opts);
		$el[ev]('mouseleave', onUp, opts);
	}

	function listen() {
		toggle(true);
	}
	function stop() {
		toggle(false);
	}

	function onDown(ev) {
		/// #if __DEBUG__
		if (preventDebug(ev)) return;
		/// #endif

		// if (ev.target.closest('[prevent-drag]')) return;
		// if (ev.target.closest('button')) return;

		pointer.isPressed = true;
		pointer.justClicked = true;
		pointer.clickPosition.copy(pointer.position);

		holdingMouseTimeout = setTimeout(
			() => (pointer.isHolding = pointer.isPressed),
			150,
		);
	}

	function onUp() {
		pointer.isPressed = false;
		pointer.hasClicked =
			pointer.position.distanceTo(pointer.clickPosition) < 0.01 &&
			!pointer.isHolding;

		holdingMouseTimeout && clearTimeout(holdingMouseTimeout);
		holdingMouseTimeout = null;
		pointer.isHolding = false;
		pointer.justClicked = false;

		const scene = webgl.$scenes.current;
		if (!scenes.has(scene?.id)) return;
		const { objects, rawList } = scenes.get(scene.id);

		for (let i = 0; i < rawList.length; i++) {
			const obj = objects.get(rawList[i]);
			if (!obj) continue;
			if (!obj.isRaycasted.value) continue;
			const raycastedObject = raycaster.intersectObject(
				obj.object,
				true,
			)[0];
			pointer.hasClicked && obj.onClick(raycastedObject);
			obj.onUp(raycastedObject);
		}
	}

	function onMove({ clientX, clientY, touches = null }) {
		const { x: width, y: height } = webgl.$viewport.size.value;

		let x = 0;
		let y = 0;

		if (touches) {
			x = touches[0].clientX;
			y = touches[0].clientY;
		} else {
			x = clientX;
			y = clientY;
		}

		pointer.position.set(
			clampedMap(x, 0, width, -1, 1),
			clampedMap(y, 0, height, 1, -1),
		);
	}

	function createRaycastableObject(
		object,
		{
			onEnter: onOriginalEnter = NOOP,
			onLeave: onOriginalLeave = NOOP,
			onMove = NOOP,
			onDown = NOOP,
			onUp = NOOP,
			onHold = NOOP,
			onHover = NOOP,
			onClick = NOOP,

			onBeforeSetCamera = NOOP,
			onAfterSetCamera = NOOP,

			onBeforeRaycast = NOOP,
			onAfterRaycast = NOOP,
			forceVisible = false,
			...opts
		} = {},
	) {
		const isRaycasted = w(false);

		const onEnter = (a) => {
			isRaycasted.set(true);
			onOriginalEnter?.(a);
		};

		const onLeave = (e) => {
			isRaycasted.set(false);
			onOriginalLeave?.(e);
		};

		return {
			object,
			isRaycasted,
			pointer,
			onEnter,
			onLeave,
			onMove,
			onDown,
			onUp,
			onHold,
			onHover,
			onClick,

			onBeforeSetCamera,
			onAfterSetCamera,

			onBeforeRaycast,
			onAfterRaycast,

			forceVisible,
			...opts,
		};
	}

	function add(object, opts = {}) {
		let scene = null;

		if (opts.forcedScene) scene = opts.forcedScene;
		else if (object.parent?.isScene) scene = object.parent;
		else scene = object.scene ?? webgl.$getCurrentScene();

		const { id } = webgl.$scenes.getSceneByComponent(scene);

		if (!scenes.has(scene)) {
			scenes.set(id, {
				objects: new WeakMap(),
				rawList: [],
			});
		}

		const { objects, rawList } = scenes.get(id);

		if (objects.has(object)) return;
		const obj = createRaycastableObject(object, opts);

		objects.set(object, obj);
		rawList.push(object);

		cameraNeedsUpdate = !!rawList.filter(
			(o) => o.onBeforeSetCamera === NOOP || o.onAfterSetCamera === NOOP,
		).length;

		return { object: obj, remove: () => remove(object) };
	}

	function remove(...listObjects) {
		for (let i = 0; i < listObjects.length; i++) {
			const object = listObjects[i];

			const scene = webgl.$scenes.current;
			if (!scenes.has(scene?.id)) return;
			const { objects, rawList } = scenes.get(scene.id);

			if (!objects.has(object))
				return (
					__DEBUG__ && console.warn(`Object ${object} not registered`)
				);

			// Remove from objects
			rawList.splice(rawList.indexOf(object), 1);
			objects.delete(object);
		}

		cameraNeedsUpdate = !!rawList.filter(
			(o) => o.onBeforeSetCamera === NOOP || o.onAfterSetCamera === NOOP,
		).length;
	}

	function update() {
		const scene = webgl.$scenes.current;
		if (!scenes.has(scene?.id)) return;

		const { objects, rawList } = scenes.get(scene.id);

		if (!rawList.length) return;

		const cam = scene.component.getCurrentCamera().base;

		// Update raycaster globally
		if (!cameraNeedsUpdate) {
			for (let i = 0; i < rawList.length; i++) {
				const obj = objects.get(rawList[i]);
				if (!obj) continue;
				obj.onBeforeSetCamera(cam);
			}

			raycaster.setFromCamera(pointer.position, cam);

			for (let i = 0; i < rawList.length; i++) {
				const obj = objects.get(rawList[i]);
				if (!obj) continue;
				obj.onAfterSetCamera(cam);
			}
		}

		for (let i = 0; i < rawList.length; i++) {
			const obj = objects.get(rawList[i]);
			if (!obj) continue;

			const {
				onLeave,
				isRaycasted: _isRaycasted,
				object,
				onEnter,
				onHover,
				onMove,
				onDown,
				onHold,
				onBeforeSetCamera,
				onAfterSetCamera,
				onBeforeRaycast,
				onAfterRaycast,
				forceVisible,
			} = obj;

			// Update raycaster for each object if any of them has callbacks
			if (cameraNeedsUpdate) {
				onBeforeSetCamera(cam);
				raycaster.setFromCamera(pointer.position, cam);
				onAfterSetCamera(cam);
			}

			onBeforeRaycast(raycaster);

			intersectObject(object, raycaster, intersects, true);

			onAfterRaycast(raycaster);

			const intersect = intersects.find((i) => i.object === object);
			const shouldIntersect = !!intersect;

			if (_isRaycasted.value !== shouldIntersect) {
				shouldIntersect && onEnter(intersect);
				!shouldIntersect && onLeave(intersect);
			}

			if (pointer.justClicked && shouldIntersect) {
				pointer.justClicked = false;
				onDown(intersect);
			}

			if (!shouldIntersect || (!object.visible && !forceVisible))
				continue;

			onHover(intersect);
			onMove(intersect);

			pointer.isHolding && onHold(intersect);
		}

		pointer.hasClicked = false;
		intersects.length = 0;
	}

	return {
		install: () => {
			webgl.$raycast = api;
		},
		load: () => {
			webgl.$hooks.afterSetup.watchOnce(listen);
			webgl.$hooks.beforeUpdate.watch(update);
		},
	};
}

/// #if __DEBUG__
function preventDebug(ev) {
	return ev.target.closest('.debug');
}
/// #endif

function intersectObject(object, raycaster, intersects, recursive) {
	if (object.layers.test(raycaster.layers))
		object.raycast(raycaster, intersects);

	if (recursive === true) {
		const children = object.children;

		for (let i = 0, l = children.length; i < l; i++) {
			intersectObject(children[i], raycaster, intersects, true);
		}
	}
}
