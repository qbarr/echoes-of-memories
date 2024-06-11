import { clamp, damp } from '#utils/maths/map.js';
import { mod } from '#utils/maths/mod.js';
// import { mod } from '#utils/maths/mod.js';
import { webgl } from '#webgl/core';
import { Vector2, Vector3, MathUtils, Euler } from 'three';

const tempVec2a = new Vector2();
const tempVec2b = new Vector2();

const lerp = (x, y, a) => x * (1 - a) + y * a;

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

	return { lat: phiDegrees, lon: thetaDegrees };
	// return { lat: 90, lon: 90 };
}

function POVController(
	object,
	{
		element = document,
		enabled = false,
		speed = 1,
		target = new Vector3(),
		debug = false,
	} = {},
) {
	let { lat, lon } = vec3ToSphericalPos(target, object);

	console.log('lat', lat);
	console.log('lon', lon);

	let lerpedLat = lat;
	let lerpedLon = lon;

	const rotateStart = new Vector2();

	const verticalMin = 0;
	const verticalMax = Math.PI;

	const horizontalMin = -Math.PI / 2;
	const horizontalMax = Math.PI / 2;

	updateLookAt();

	function updateLookAt() {
		object.lookAt(target);
	}

	function devtools() {
		console.log('[POVController] devtools');
	}

	function update() {
		const dt = webgl.$time.dt;
		lerpedLat = damp(lerpedLat, lat, 0.4, dt);
		lerpedLon = damp(lerpedLon, lon, 0.4, dt);

		const phi = MathUtils.degToRad(90 - lerpedLat);
		const theta = MathUtils.degToRad(lerpedLon);
		target.setFromSphericalCoords(1, phi, theta).add(object.position);

		updateLookAt();

		// console.log(debug);

		if (debug) devtools();
	}

	function handleMoveRotate(x, y) {
		const dt = webgl.$time.dt * 0.001;
		tempVec2a.set(x, y);
		tempVec2b
			// .subVectors(tempVec2a, rotateStart)
			.add(tempVec2a, rotateStart)
			.multiplyScalar(speed * dt);

		const el = element === document ? document.body : element;
		const height = el === document.body ? window.innerHeight : el.clientHeight;

		const verticalLookRatio = Math.PI / (verticalMax - verticalMin);
		const horizontalLookRatio = Math.PI / (horizontalMax - horizontalMin);

		// console.log('verticalLookRatio', verticalLookRatio);
		// console.log('horizontalLookRatio', horizontalLookRatio);

		lon -= tempVec2b.x * horizontalLookRatio;
		lat -= tempVec2b.y * verticalLookRatio;
		lat = clamp(lat, -70, 50);

		// console.log('lon', lon);
		// console.log('lat', lat);

		rotateStart.copy(tempVec2a);
	}

	const onMouseMove = (e) => {
		if (!enabled) return;
		const x = e.movementX;
		const y = e.movementY;
		handleMoveRotate(x, y);
	};

	const onTouchMove = (e) => {
		if (!enabled) return;

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

	const onLockEnter = () => {
		console.log('[POVController] onLockEnter');
		// enabled = true;
	};

	const onLockExit = () => {
		console.log('[POVController] onLockExit');
		// enabled = false;
	};

	addHandlers();

	return {
		remove,
		update,
		onLockEnter,
		onLockExit,

		target,

		set enabled(v) {
			console.log('[POVController] enabled', v);
			enabled = v;
		},
		get enabled() {
			return enabled;
		},
	};
}

export default POVController;
export { POVController };
