import { clamp, damp } from '#utils/maths/map.js';
import { mod } from '#utils/maths/mod.js';
import { w } from '#utils/state/index.js';
import { webgl } from '#webgl/core';
import { Vector2, Vector3, MathUtils, Euler } from 'three';

const tempVec2a = new Vector2();
const tempVec2b = new Vector2();

const lastCoords = { lon: 0, lat: 0 };

const lerp = (x, y, a) => x * (1 - a) + y * a;

const ONE_TOUR = 180;
const TWO_TOUR = 360;
function rLerp(start, end, t) {
	const s = Math.sign(end);
	const delta = ((end - start + TWO_TOUR + ONE_TOUR) % TWO_TOUR) - ONE_TOUR;
	return (start + delta * t + s * TWO_TOUR) % TWO_TOUR;
}

function rDamp(a, b, smoothing, dt) {
	return rLerp(a, b, 1 - Math.exp(-smoothing * 0.05 * dt));
}

// function cartesianToSpherical(x, y, z) {
// 	const radius = Math.sqrt(x * x + y * y + z * z);
// 	const phi = Math.acos(y / radius);
// 	const theta = Math.atan2(z, x);

// 	return { radius, phi, theta };
// }

// function lookAtSpherical(cameraPos, targetPos) {
// 	// Calculate direction vector from camera to target
// 	const directionX = targetPos.x - cameraPos.x;
// 	const directionY = targetPos.y - cameraPos.y;
// 	const directionZ = targetPos.z - cameraPos.z;

// 	// Convert direction vector to spherical coordinates
// 	const sphericalCoords = cartesianToSpherical(directionX, directionY, directionZ);

// 	return sphericalCoords;
// }

function vec3ToSphericalPos(v, cam) {
	const position1 = cam.position;
	const position2 = v;

	// Step 1: Compute the direction vector
	const direction = new Vector3();
	direction.subVectors(position2, position1);

	// Step 2: Normalize the direction vector
	direction.normalize();

	// Step 3: Compute the phi (azimuthal angle)
	// Phi is the angle in the XY plane from the positive X-axis
	const phi = Math.atan2(direction.y, direction.x);

	// Step 4: Compute the theta (polar angle)
	// Theta is the angle from the positive Z-axis
	const theta = Math.acos(direction.z);

	// Convert angles to degrees if needed
	const phiDegrees = MathUtils.radToDeg(phi);
	const thetaDegrees = MathUtils.radToDeg(theta);

	return { lat: w(phiDegrees), lon: w(thetaDegrees) };
}

function POVController(
	Class,
	{
		element = document,
		enabled = false,
		speed = 1.5,
		target = new Vector3(),
		debug = false,
	} = {},
) {
	const cam = Class.cam;
	const base = Class.base;

	const { lat, lon } = vec3ToSphericalPos(target, cam);

	let lerpedLat = lat.value;
	let lerpedLon = lon.value;

	const rotateStart = new Vector2();

	const verticalMin = 0;
	const verticalMax = Math.PI;

	const horizontalMin = -Math.PI / 2;
	const horizontalMax = Math.PI / 2;

	const $project = webgl.$theatre.getProject('Clinique');
	const introSheet = $project.getSheet('intro');

	const rawStates = ['FREE', 'CINEMATIC', 'FLASHBACK', 'FOCUS', 'FLASHBACK_FREE'];
	const states = rawStates.reduce((acc, key) => {
		acc[key] = key;
		return acc;
	}, {});
	const state = w(states.FREE);
	state.is = (s) => state.value === s;

	updateLookAt();

	function updateLookAt(forcedLookAt) {
		cam.lookAt(forcedLookAt ?? target);
	}

	function focusOn(_target) {
		_target = _target.position ?? _target;
		// console.log(_target);
		// const sphericalCoords = lookAtSpherical(cam.position, _target);
		// console.log(sphericalCoords);
		// lat.value = sphericalCoords.phi;
		// lon.value = sphericalCoords.theta;
		// // const f = vec3ToSphericalPos(position, cam);
		// // console.log(f);
		// // lat.value = f.lat.value;
		// // lon.value = f.lon.value;

		// target.copy(_target);
	}

	function update() {
		const dt = webgl.$time.dt;

		if (state.is(states.FLASHBACK)
			|| state.is(states.FLASHBACK_FREE)
		) updateFlashbackMode(dt);


		else updatePOVMode(dt);

	}

	function updatePOVMode(dt) {
		lerpedLat = damp(lerpedLat, lat.value, 0.4, dt);
		lerpedLon = rDamp(lerpedLon, lon.value, 0.4, dt);

		const phi = MathUtils.degToRad(90 - lerpedLat);
		const theta = MathUtils.degToRad(lerpedLon);
		target.setFromSphericalCoords(1, phi, theta).add(cam.position);

		updateLookAt();
	}

	function updateFlashbackMode(dt) {
		const lookat = Vector3.get().set(0, 0, 0);
		updateLookAt(lookat);
		lookat.release();
	}


	function handleMoveRotate(x, y) {
		const dt = webgl.$time.dt * 0.001;
		tempVec2a.set(x, y);
		tempVec2b.add(tempVec2a, rotateStart).multiplyScalar(speed * dt);

		const el = element === document ? document.body : element;
		const height = el === document.body ? window.innerHeight : el.clientHeight;

		const verticalLookRatio = Math.PI / (verticalMax - verticalMin);
		const horizontalLookRatio = Math.PI / (horizontalMax - horizontalMin);

		lon.value -= tempVec2b.x * horizontalLookRatio;
		lon.value = mod(lon.value, 360);

		lat.value -= tempVec2b.y * verticalLookRatio;
		lat.value = clamp(lat.value, -70, 50);

		if (state.is(states.FOCUS)) {
			const threshold = 5;
			lat.value = clamp(
				lat.value,
				lastCoords.lat - threshold,
				lastCoords.lat + threshold,
			);
			lon.value = clamp(
				lon.value,
				lastCoords.lon - threshold,
				lastCoords.lon + threshold,
			);
		}

		rotateStart.copy(tempVec2a);
	}

	function setMode(_mode) {
		const mode = _mode.toLowerCase();
		if (mode === 'free') goFreeMode();
		else if (mode === 'cinematic') goCinematicMode();
		else if (mode === 'flashback') goFlashbackMode();
		else if (mode === 'focus') goFocusMode();
		else if (mode === 'flashback_free') goFlashbackFreeMode();
	}

	function goFreeMode() {
		state.set(states.FREE);
	}

	function goFocusMode() {
		webgl.$hooks.afterFrame.watchOnce(() => {
			lastCoords.lat = lat.value;
			lastCoords.lon = lon.value;
		});
		state.set(states.FOCUS);
	}

	function goFlashbackFreeMode() {
		state.set(states.FLASHBACK_FREE);
	}

	function goCinematicMode() {
		state.set(states.CINEMATIC);
	}

	function goFlashbackMode() {
		state.set(states.FLASHBACK);
	}

	const onMouseMove = (e) => {
		if (!enabled) return;
		if (!state.is(states.FREE) && !state.is(states.FOCUS)) return;

		const x = e.movementX;
		const y = e.movementY;
		handleMoveRotate(x, y);
	};

	const onTouchMove = (e) => {
		if (!enabled) return;
		if (!state.is(states.FREE) && !state.is(states.FOCUS)) return;

		handleMoveRotate(e.touches[0].pageX, e.touches[0].pageY);
	};

	const addHandlers = () => {
		element.addEventListener('mousemove', onMouseMove, false);
		element.addEventListener('touchmove', onTouchMove, { passive: false });
	};

	const remove = () => {
		element.removeEventListener('mousemove', onMouseMove);
		element.removeEventListener('touchmove', onTouchMove);
	};

	addHandlers();

	return {
		remove,
		update,

		setMode,
		goFreeMode,
		goFocusMode,
		goCinematicMode,
		goFlashbackMode,

		focusOn,

		states,
		rawStates,
		state,

		target,
		lat,
		lon,

		set enabled(v) {
			enabled = v;
		},
		get enabled() {
			return enabled;
		},
	};
}

export default POVController;
export { POVController };
