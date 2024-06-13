import { clamp, damp } from '#utils/maths/map.js';
import { mod } from '#utils/maths/mod.js';
import { w } from '#utils/state/index.js';
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

	// return { lat: phiDegrees, lon: thetaDegrees };
	// return { lat: 90, lon: 90 };
	return { lat: w(phiDegrees), lon: w(thetaDegrees) };
}

function POVController(
	Class,
	{
		element = document,
		enabled = false,
		speed = 1,
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

	const introSheet = webgl.$theatre.getProject('Clinique-Camera').getSheet('intro');

	const FREE_CAM = w(false);
	const CINEAMATIC_CAM = w(true);

	const state = w({
		FREE_CAM,
		CINEAMATIC_CAM,
	});

	updateLookAt();
	attachAnimationToSheet();

	function updateLookAt() {
		cam.lookAt(target);
	}

	function attachAnimationToSheet() {
		if (!introSheet) return;

		introSheet.$compound('POVController', { lat, lon });
	}

	function update() {
		const dt = webgl.$time.dt;
		const { FREE_CAM, CINEAMATIC_CAM } = state.value;

		if (FREE_CAM.value) {
			updateFreeCamMode(dt);
		} else if (CINEAMATIC_CAM.value) {
			updateCineamaticCamMode(dt);
		}
	}

	function updateFreeCamMode(dt) {
		console.log('updateFreeCamMode');
		lerpedLat = damp(lerpedLat, lat.value, 0.4, dt);
		lerpedLon = damp(lerpedLon, lon.value, 0.4, dt);

		const phi = MathUtils.degToRad(90 - lerpedLat);
		const theta = MathUtils.degToRad(lerpedLon);
		target.setFromSphericalCoords(1, phi, theta).add(cam.position);

		updateLookAt();
	}

	function updateCineamaticCamMode(dt) {
		lerpedLat = damp(lerpedLat, lat.value, 0.4, dt);
		lerpedLon = damp(lerpedLon, lon.value, 0.4, dt);

		const phi = MathUtils.degToRad(90 - lerpedLat);
		const theta = MathUtils.degToRad(lerpedLon);
		target.setFromSphericalCoords(1, phi, theta).add(cam.position);

		updateLookAt();
	}

	function handleMoveRotate(x, y) {
		const dt = webgl.$time.dt * 0.001;
		tempVec2a.set(x, y);
		tempVec2b.add(tempVec2a, rotateStart).multiplyScalar(speed * dt);

		const el = element === document ? document.body : element;
		const height = el === document.body ? window.innerHeight : el.clientHeight;

		const verticalLookRatio = Math.PI / (verticalMax - verticalMin);
		const horizontalLookRatio = Math.PI / (horizontalMax - horizontalMin);

		lon -= tempVec2b.x * horizontalLookRatio;
		lat -= tempVec2b.y * verticalLookRatio;
		lat = clamp(lat, -70, 50);

		rotateStart.copy(tempVec2a);
	}

	function goFreeCamMode() {
		state.value.FREE_CAM.value = true;
		state.value.CINEAMATIC_CAM.value = false;
	}

	function goCineamaticCamMode() {
		state.value.FREE_CAM.value = false;
		state.value.CINEAMATIC_CAM.value = true;
	}

	const onMouseMove = (e) => {
		if (!enabled) return;

		const { CINEAMATIC_CAM, FREE_CAM } = state.value;

		if (CINEAMATIC_CAM.value) return;

		const x = e.movementX;
		const y = e.movementY;
		handleMoveRotate(x, y);
	};

	const onTouchMove = (e) => {
		if (!enabled) return;

		const { CINEAMATIC_CAM, FREE_CAM } = state.value;

		if (CINEAMATIC_CAM.value) return;

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
