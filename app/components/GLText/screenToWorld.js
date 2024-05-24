
import { webgl } from '#webgl/core';
import { Vector3 } from 'three';


export function screenToWorld({
	position,
	camera = null,
	zNeeded = 0,
	out = new Vector3(),
	forcedZ = null,
	updateMatrix = true
} = {}) {
	if (!position) throw new Error('No position provided');

	const { $scenes, $viewport } = webgl;

	const scn = $scenes.current.component;
	camera = camera ?? scn._cam.current.base;
	updateMatrix && camera.updateMatrixWorld();
	forcedZ = forcedZ ?? camera.position.z;

	const size = $viewport.size.value;
	const vector = Vector3
		.get()
		.set(
			(position.x / size.x) * 2 - 1,
			-(position.y / size.y) * 2 + 1,
			0
		);

	vector.unproject(camera);

	const dir = vector.sub(camera.position).normalize();
	const distance = (zNeeded - forcedZ) / dir.z;
	vector.release();

	out
		.copy(camera.position)
		.add(dir.multiplyScalar(distance));

	return out;
}

export default screenToWorld;
