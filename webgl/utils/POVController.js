import { getWebGL } from '#webgl/core';
import { Vector2 as Vec2, Vector3 as Vec3, Vector3, MathUtils } from 'three';

let webgl;

const tempVec2a = new Vec2();
const tempVec2b = new Vec2();

function POVController(
	object,
	{
		element = document,
		enabled = false,
		rotateSpeed = 0.1,
		panSpeed = 0.1,
	} = {},
) {
	if (!webgl) webgl = getWebGL();
	const lookAt = new Vector3();
	const position = new Vector3();
	let lon = 0;
	let lat = 0;

	const rotateStart = new Vec2();
	const panDelta = new Vec3();

	const verticalMin = 0;
	const verticalMax = Math.PI;

	const horizontalMin = -Math.PI / 2;
	const horizontalMax = Math.PI / 2;

	updatePosition();

	function updatePosition() {
		object.lookAt(lookAt);
	}

	function update() {
		// if (!enabled) return;

		updatePosition();

		let phi = MathUtils.degToRad(90 - lat);
		const theta = MathUtils.degToRad(lon);

		lookAt.setFromSphericalCoords(1, phi, theta).add(object.position);
	}

	function handleMoveRotate(x, y) {
		tempVec2a.set(x, y);
		tempVec2b
			// .subVectors(tempVec2a, rotateStart)
			.add(tempVec2a, rotateStart)
			.multiplyScalar(rotateSpeed);

		const el = element === document ? document.body : element;
		const height =
			el === document.body ? window.innerHeight : el.clientHeight;

		let verticalLookRatio = 1;
		verticalLookRatio = Math.PI / (verticalMax - verticalMin);
		let horizontalLookRatio = 1;
		horizontalLookRatio = Math.PI / (horizontalMax - horizontalMin);

		// console.log('verticalLookRatio', verticalLookRatio);
		// console.log('horizontalLookRatio', horizontalLookRatio);

		lon -= tempVec2b.x;
		lat -= tempVec2b.y * verticalLookRatio;
		lat = Math.max(-40, Math.min(40, lat));

		// console.log('lon', lon);
		// console.log('lat', lat);

		rotateStart.copy(tempVec2a);
	}

	const onMouseMove = (e) => {
		if (!enabled) return;

		// const x = e.clientX;
		// const y = e.clientY;
		const x = e.movementX;
		const y = e.movementY;

		console.log('x', x);
		// console.log('y', y);

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
