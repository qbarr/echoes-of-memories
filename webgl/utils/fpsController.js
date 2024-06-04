// Code from OGL
// https://github.com/oframe/ogl/blob/master/src/extras/Orbit.js

import { clamp } from '#utils/maths';
import {
	MathUtils,
	Object3D,
	Vector3 as Vec3,
	Vector2 as Vec2,
	Vector3,
} from 'three';

const STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, DOLLY_PAN: 3 };
const tempVec3a = new Vec3();
const tempVec3b = new Vec3();
const tempVec2a = new Vec2();
const tempVec2b = new Vec2();

const dummy = new Object3D();
const cam = new Object3D();

function fpsController(
	object,
	{
		element = document,
		enabled = true,
		target = new Vec3(),
		ease = 0.25,
		inertia = 0.75,
		enableRotate = true,
		rotateSpeed = 0.1,
		autoRotate = false,
		autoRotateSpeed = 1.0,
		enableZoom = true,
		zoomSpeed = 1,
		enablePan = true,
		panSpeed = 0.1,
		fps = false,
		minDistance = 0.5,
		maxDistance = Infinity,
		useOrbitKeyboard = true,
	} = {},
) {
	const targetOffset = new Vec3();
	const position = new Vector3();
	const lookAt = new Vector3();
	let lat = 0;
	let lon = 0;

	// Catch attempts to disable - set to 1 so has no effect
	ease = ease || 1;
	inertia = inertia || 0;

	// current position in sphericalTarget coordinates
	const panDelta = new Vec3();

	// Grab initial position values
	const offset = new Vec3();
	const verticalMin = 0;
	const verticalMax = Math.PI;
	updatePosition();

	// Touch pressed
	const pressed = [
		'ShiftLeft',
		'KeyW',
		'KeyA',
		'KeyS',
		'KeyD',
		'KeyC',
		'Space',
		'KeyE',
	].reduce((p, v) => ((p[v] = false), p), {});
	const zKeyDelta = new Vector3();

	function updatePosition() {
		object.lookAt(lookAt);
		object.position.copy(position);
	}

	function update() {
		// apply delta

		position.add(panDelta);

		updatePosition();

		// Apply inertia to values

		panDelta.multiplyScalar(inertia * 1.13);

		const keyMult = pressed.ShiftLeft ? 4 : pressed.KeyC ? 0.11 : 1;
		const keySpeed = panSpeed;
		if (enabled) {
			if (pressed.KeyW || pressed.KeyS) {
				object.getWorldPosition(tempVec3b);
				object
					.localToWorld(zKeyDelta.set(0, 0, pressed.KeyW ? -1 : 1))
					.sub(tempVec3b)
					.multiplyScalar(0.25 * (keySpeed / 0.05) * keyMult);
			}
			if (pressed.Space) panUp(keySpeed * keyMult, object.matrix);
			if (pressed.KeyE) panDown(keySpeed * keyMult, object.matrix);
			if (pressed.KeyA) panLeft(keySpeed * keyMult, object.matrix);
			else if (pressed.KeyD) panLeft(-keySpeed * keyMult, object.matrix);
		}

		let phi = MathUtils.degToRad(90 - lat);
		const theta = MathUtils.degToRad(lon);

		lookAt.setFromSphericalCoords(1, phi, theta).add(position);

		position.add(zKeyDelta);
		zKeyDelta.multiplyScalar(inertia * 1.13);
	}

	// Everything below here just updates panDelta and sphericalDelta
	// Using those two objects' values, the orbit is calculated

	const rotateStart = new Vec2();
	const panStart = new Vec2();

	let state = STATE.NONE;
	const mouseButtons = { ORBIT: 0, ZOOM: 1, PAN: 2 };

	function getZoomScale() {
		return Math.pow(0.95, zoomSpeed);
	}

	function panLeft(distance, m) {
		m = m.elements;
		tempVec3a.set(m[0], m[1], m[2]);
		tempVec3a.multiplyScalar(-distance);
		panDelta.add(tempVec3a);
	}

	function panUp(distance, m) {
		m = m.elements;
		tempVec3a.set(m[4], m[5], m[6]);
		tempVec3a.multiplyScalar(distance);
		panDelta.add(tempVec3a);
	}

	const panDown = (distance, m) => panUp(-distance, m);

	const pan = (deltaX, deltaY) => {
		const el = element === document ? document.body : element;
		const height =
			el === document.body ? window.innerHeight : el.clientHeight;
		tempVec3a.copy(object.position).sub(targetOffset);
		let targetDistance = tempVec3a.length();
		targetDistance *= Math.tan(
			(((object.fov || 45) / 2) * Math.PI) / 180.0,
		);
		panLeft((2 * deltaX * targetDistance) / height, object.matrix);
		panUp((2 * deltaY * targetDistance) / height, object.matrix);
	};

	function handleMoveRotate(x, y) {
		tempVec2a.set(x, y);
		tempVec2b
			.subVectors(tempVec2a, rotateStart)
			.multiplyScalar(rotateSpeed);
		const el = element === document ? document.body : element;
		const height =
			el === document.body ? window.innerHeight : el.clientHeight;
		let verticalLookRatio = 1;
		verticalLookRatio = Math.PI / (verticalMax - verticalMin);

		lon -= tempVec2b.x;
		lat -= tempVec2b.y * verticalLookRatio;
		lat = Math.max(-85, Math.min(85, lat));

		rotateStart.copy(tempVec2a);
	}

	function getPath(e) {
		let path = [];
		let currentElem = e.target;
		while (currentElem) {
			path.push(currentElem);
			currentElem = currentElem.parentElement;
		}
		if (path.indexOf(window) === -1 && path.indexOf(document) === -1)
			path.push(document);
		if (path.indexOf(window) === -1) path.push(window);
		return path;
	}

	function canClick(e) {
		const path = getPath(e);
		for (const el of path) {
			if (!el || !el.classList) break;
			if (el.classList.contains('debug')) return false;
		}
		return true;
	}

	const onMouseDown = (e) => {
		if (!enabled) return;
		if (!canClick(e)) return;

		switch (e.button) {
			case mouseButtons.ORBIT:
				if (enableRotate === false) return;
				rotateStart.set(e.clientX, e.clientY);
				state = STATE.ROTATE;
				break;
		}

		if (state !== STATE.NONE) {
			window.addEventListener('mousemove', onMouseMove, false);
			window.addEventListener('mouseup', onMouseUp, false);
		}
	};

	const onMouseMove = (e) => {
		if (!enabled) return;

		switch (state) {
			case STATE.ROTATE:
				if (enableRotate === false) return;
				handleMoveRotate(e.clientX, e.clientY);
				break;
		}
	};

	const onMouseUp = () => {
		window.removeEventListener('mousemove', onMouseMove, false);
		window.removeEventListener('mouseup', onMouseUp, false);
		state = STATE.NONE;
	};

	const onTouchStart = (e) => {
		if (!enabled) return;
		if (!canClick(e)) return;

		e.preventDefault();

		if (enableRotate === false) return;
		rotateStart.set(e.touches[0].pageX, e.touches[0].pageY);
		state = STATE.ROTATE;
	};

	const onTouchMove = (e) => {
		if (!enabled) return;
		e.preventDefault();
		e.stopPropagation();

		if (enableRotate === false) return;
		handleMoveRotate(e.touches[0].pageX, e.touches[0].pageY);
	};

	const onTouchEnd = () => {
		if (!enabled) return;
		state = STATE.NONE;
	};

	const onContextMenu = (e) => {
		if (!enabled) return;
		if (!canClick(e)) return;
		e.preventDefault();
	};

	const keyBlacklistTag = ['INPUT', 'TEXTAREA', 'SELECT'];
	const keyAliases = {
		ArrowUp: 'KeyW',
		ArrowDown: 'KeyS',
		ArrowLeft: 'KeyA',
		ArrowRight: 'KeyD',
	};

	const keyCodes = Object.keys(pressed).reduce(
		(p, v) => ((p[v] = true), p),
		{},
	);

	const onKeyDown = (e) => {
		if (!enabled) return;
		// if (!canClick(e)) return;
		if (!useOrbitKeyboard && !fps) return;
		const code = keyAliases[e.code] || e.code;
		// if (keyBlacklistTag.includes(e.target.tagName)) return;
		if (!keyCodes[code] || pressed[code]) return;
		pressed[code] = true;
	};

	const onKeyUp = (e) => {
		const code = keyAliases[e.code] || e.code;
		if (!keyCodes[code] || !pressed[code]) return;
		pressed[code] = false;
	};

	const unpressAllKeys = () => {
		for (const k in pressed) {
			pressed[k] = false;
		}
	};

	function addHandlers() {
		window.addEventListener('blur', unpressAllKeys, false);
		element.addEventListener('keydown', onKeyDown, false);
		element.addEventListener('keyup', onKeyUp, false);
		element.addEventListener('contextmenu', onContextMenu, false);
		element.addEventListener('mousedown', onMouseDown, false);
		element.addEventListener('touchstart', onTouchStart, {
			passive: false,
		});
		element.addEventListener('touchend', onTouchEnd, false);
		element.addEventListener('touchmove', onTouchMove, { passive: false });
	}

	function remove() {
		window.removeEventListener('blur', unpressAllKeys);
		element.removeEventListener('contextmenu', onContextMenu);
		element.removeEventListener('mousedown', onMouseDown);
		element.removeEventListener('touchstart', onTouchStart);
		element.removeEventListener('touchend', onTouchEnd);
		element.removeEventListener('touchmove', onTouchMove);
		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseup', onMouseUp);
	}

	addHandlers();

	return {
		remove,
		update,
		updatePosition,
		position,
		lookAt,

		get lat() {
			return lat;
		},
		get lon() {
			return lon;
		},
		set lat(v) {
			lat = v;
		},
		set lon(v) {
			lon = v;
		},

		set enabled(v) {
			enabled = v;
		},
		get enabled() {
			return enabled;
		},

		set panSpeed(v) {
			panSpeed = v;
		},
		get panSpeed() {
			return panSpeed;
		},
	};
}

export default fpsController;
export { fpsController };
