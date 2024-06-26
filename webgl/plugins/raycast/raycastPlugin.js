/// #if __DEBUG__
/// #code import { BufferGeometry, Line, LineBasicMaterial, Vector3 } from 'three';
/// #endif
import { Raycaster, Vector2 } from 'three';

import { clampedMap } from '#utils/maths';
import { storageSync, w } from '#utils/state';

const NOOP = (v) => v;
const opts = { passive: false };
const RAYCAST_ONLY_FIRST = true;

export function raycastPlugin(webgl) {
	/// #if __DEBUG__
	const geometry = new BufferGeometry();
	const material = new LineBasicMaterial({ color: 0xff0000 });
	const debugLine = new Line(geometry, material);
	/// #endif

	const scenes = new Map();
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

	const needsUpdate = w(true);

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

		enable: () => needsUpdate.set(true),
		disable: () => needsUpdate.set(false),

		add,
		remove,

		listen,
		unlisten: stop,
		stop,

		update,
	};

	function init() {
		listen();
		__DEBUG__ && devtools();
	}

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

		if (shouldListen) pointer.position.set(0, 0);
		else pointer.position.set(-Infinity, -Infinity);
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

		const { $store } = webgl.$app;

		if (!$store.pointerLocked && !$store.isPaused) return;

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

		const { $app, $scenes } = webgl;
		// const scene = webgl.$scenes.current;
		const scene = $app.$store.isPaused ? $scenes.ui : $scenes.current;
		if (!scenes.has(scene?.id)) return;
		const { objects, rawList } = scenes.get(scene.id);

		for (let i = 0; i < rawList.length; i++) {
			const obj = objects.get(rawList[i]);
			// console.log(obj);
			if (!obj) continue;
			if (!obj.isRaycasted.value) continue;
			const raycastedObject = raycaster.intersectObject(obj.object, true)[0];
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
			needRaycast: true,
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

		const { id, name } = webgl.$scenes.getSceneByComponent(scene);

		if (!scenes.has(id)) {
			scenes.set(id, {
				objects: new Map(),
				rawList: [],
				intersectedObject: null,
				raycastOnlyOne: name !== 'ui',
				lastRaycastedObject: null,
			});
		}

		const { objects, rawList } = scenes.get(id);

		// console.log('ADD', id, rawList);

		if (objects.has(object)) return;
		opts.sceneId = id;
		const obj = createRaycastableObject(object, opts);

		objects.set(object, obj);
		rawList.push(object);

		cameraNeedsUpdate = !!rawList.filter(
			(o) => o.onBeforeSetCamera === NOOP || o.onAfterSetCamera === NOOP,
		).length;

		return {
			object: obj,
			remove: () => remove(object, scene),
			disable: () => disableObject(object, scene),
			enable: () => enableObject(object, scene),
		};
	}

	function remove(object, forcedScene = null) {
		// for (let i = 0; i < listObjects.length; i++) {
		// const object = listObjects[i];

		let scene = null;
		if (forcedScene) scene = forcedScene;
		else if (object.parent?.isScene) scene = object.parent;
		// else scene = object.scene ?? webgl.$getCurrentScene();
		else scene = $app.$store.isPaused ? $scenes.ui : $scenes.current;

		const { id } = webgl.$scenes.getSceneByComponent(scene);

		const raycastScene = scenes.get(id);

		if (!scenes.has(id)) return;
		const { objects, rawList } = scenes.get(id);

		// console.log(objects, rawList, object);

		if (!objects.has(object))
			return __DEBUG__ && console.warn(`Object ${object} not registered`);

		if (raycastScene.lastRaycastedObject) {
			const obj = objects.get(object);
			if (raycastScene.lastRaycastedObject === obj) {
				obj.onLeave();
				raycastScene.lastRaycastedObject = null;
			}
		}

		// Remove from objects
		rawList.splice(rawList.indexOf(object), 1);
		objects.delete(object);
		// }

		cameraNeedsUpdate = !!rawList.filter(
			(o) => o.onBeforeSetCamera === NOOP || o.onAfterSetCamera === NOOP,
		).length;
	}

	function disableObject(object, forcedScene) {
		const scene = forcedScene ?? object.scene ?? webgl.$getCurrentScene();
		const { id } = webgl.$scenes.getSceneByComponent(scene);

		if (!scenes.has(id)) return;
		const raycastScene = scenes.get(id);
		const { objects } = raycastScene;

		if (!objects.has(object)) return;
		const obj = objects.get(object);

		if (raycastScene.lastRaycastedObject) {
			if (raycastScene.lastRaycastedObject === obj.object) {
				obj.onLeave();
				raycastScene.lastRaycastedObject = null;
			}
		}

		obj.needRaycast = false;
	}

	function enableObject(object, forcedScene) {
		const scene = forcedScene ?? object.scene ?? webgl.$getCurrentScene();
		const { id } = webgl.$scenes.getSceneByComponent(scene);

		if (!scenes.has(id)) return;
		const { objects } = scenes.get(id);

		if (!objects.has(object)) return;
		const obj = objects.get(object);

		obj.needRaycast = true;
	}

	function update() {
		const { $app, $scenes } = webgl;
		const scene = $app.$store.isPaused ? $scenes.ui : $scenes.current;

		if (!scenes.has(scene?.id)) return;

		const raycastScene = scenes.get(scene.id);
		const { objects, rawList } = raycastScene;

		if (!rawList.length) return;

		// const cam = scene.component.getCurrentCamera().base;
		const cameraComponent = scene.component._cam.current;
		const cam = cameraComponent.cam;
		if (!cam) return;
		// if (!cameraComponent.$pointerLocked) return;

		/// #if __DEBUG__
		const idDebugCamera = !!scene.component._cam.forced;
		if (idDebugCamera) return;
		/// #endif

		// pointer.position.set(0, 0);
		!$app.$store.isPaused && pointer.position.set(0, 0);

		// Update raycaster globally
		if (!cameraNeedsUpdate) {
			for (let i = 0; i < rawList.length; i++) {
				const obj = objects.get(rawList[i]);
				if (!obj) continue;
				obj.onBeforeSetCamera(cam);
			}

			raycaster.setFromCamera(pointer.position, cam);

			/// #if __DEBUG__
			if (debugLine.parent !== scene.component.base) {
				scene.component.base.add(debugLine);
			}

			const vec3 = Vector3.get();
			raycaster.ray.at(20, vec3),
				debugLine.geometry.setFromPoints([raycaster.ray.origin, vec3]);
			vec3.release();
			/// #endif

			// for (let i = 0; i < rawList.length; i++) {
			// 	const obj = objects.get(rawList[i]);
			// 	if (!obj) continue;
			// 	obj.onAfterSetCamera(cam);
			// }
		}

		raycaster.intersectObjects(rawList, true, intersects);
		intersects.sort((a, b) => a.distance - b.distance);

		let closest = intersects[0];

		for (let i = 0; i < intersects.length; i++) {
			if (closest) {
				if (!objects.get(closest.object).needRaycast) closest = intersects[i];
				else break;
			}
		}

		if (closest) {
			if (raycastScene.lastRaycastedObject) {
				if (raycastScene.lastRaycastedObject !== closest.object) {
					const prevObj = objects.get(raycastScene.lastRaycastedObject);
					prevObj.onLeave();
				}
			}

			const obj = objects.get(closest.object);
			raycastScene.lastRaycastedObject = closest.object;
			if (obj) {
				const {
					onEnter,
					isRaycasted: _isRaycasted,
					needRaycast,
					object,
					onLeave,
					onHover,
					onMove,
					onDown,
					onHold,
					onBeforeRaycast,
					onAfterRaycast,
					forceVisible,
				} = obj;

				if (needRaycast) {
					if (_isRaycasted.value !== true) {
						onEnter(closest);
					}

					onAfterRaycast(raycaster);

					const shouldIntersect = !!closest && needsUpdate.value;

					if (_isRaycasted.value !== shouldIntersect) {
						if (shouldIntersect) {
							onEnter(closest);
						}
						if (!shouldIntersect) {
							onLeave(closest);
						}
					}

					if (pointer.justClicked && shouldIntersect) {
						pointer.justClicked = false;
						onDown(closest);
					}

					if (shouldIntersect && (object.visible || forceVisible)) {
						onHover(closest);
						onMove(closest);

						pointer.isHolding && onHold(closest);
					}
				}
			}
		} else {
			if (raycastScene.lastRaycastedObject) {
				const obj = objects.get(raycastScene.lastRaycastedObject);
				obj.onLeave();
				raycastScene.lastRaycastedObject = null;
			}
		}

		pointer.hasClicked = false;
		intersects.length = 0;
	}

	/// #if __DEBUG__
	function devtools() {
		const gui = webgl.$gui.addFolder({ title: '📌 Raycast', index: 1 });

		const enabledDebugLigne = storageSync('webgl:raycast:debugLine', w(false));
		enabledDebugLigne.watchImmediate((v) => (debugLine.visible = v));
		gui.addBinding(enabledDebugLigne, 'value', { label: 'Debug Line' });
	}
	/// #endif

	return {
		install: () => {
			webgl.$raycast = api;
		},
		load: () => {
			webgl.$hooks.afterSetup.watchOnce(init);
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
	if (object.layers.test(raycaster.layers)) object.raycast(raycaster, intersects);

	if (recursive === true) {
		const children = object.children;

		for (let i = 0, l = children.length; i < l; i++) {
			intersectObject(children[i], raycaster, intersects, true);
		}
	}
}
