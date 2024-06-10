import { clamp, damp } from '#utils/maths/map.js';
import { mod } from '#utils/maths/mod.js';
// import { mod } from '#utils/maths/mod.js';
import { webgl } from '#webgl/core';
import { Vector2, Vector3, MathUtils, Euler } from 'three';

const tempVec2a = new Vector2();
const tempVec2b = new Vector2();

const lerp = (x, y, a) => x * (1 - a) + y * a;

function POVController(
	object,
	{ element = document, enabled = false, speed = 0.85 } = {},
) {
	const lookAt = new Vector3();
	const position = new Vector3();

	let lon = 105;
	let lat = -15;

	// TODO: calculate initial lon and lat based on object's quaternion
	// j'ai give up ça ma saoulé

	// const q = object.quaternion.clone().invert();
	// const rot = new Euler().setFromQuaternion(q, 'YXZ');
	// console.log(MathUtils.radToDeg(rot.x));
	// console.log(MathUtils.radToDeg(rot.y));
	// lat = MathUtils.radToDeg(rot.x);
	// lon = MathUtils.radToDeg(rot.y);

	let lerpedLat = lat;
	let lerpedLon = lon;

	const rotateStart = new Vector2();
	const panDelta = new Vector3();

	const verticalMin = 0;
	const verticalMax = Math.PI;

	const horizontalMin = -Math.PI / 2;
	const horizontalMax = Math.PI / 2;

	updatePosition();

	function updatePosition() {
		object.lookAt(lookAt);
	}

	function update() {
		updatePosition();

		const dt = webgl.$time.dt;
		lerpedLat = damp(lerpedLat, lat, 0.4, dt);
		lerpedLon = damp(lerpedLon, lon, 0.4, dt);

		const phi = MathUtils.degToRad(90 - lerpedLat);
		const theta = MathUtils.degToRad(lerpedLon);

		lookAt.setFromSphericalCoords(1, phi, theta).add(object.position);
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

		lookAt,

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
