
import { webgl } from '#webgl/core';
import { Vector3 } from 'three';


export function screenToWorld(posIn, camera, zNeeded, posOut, camZ, updateMatrix = true) {
	if (updateMatrix) camera.updateMatrixWorld();

	const size = webgl.$viewport.size.value;
	const vector = Vector3
		.get()
		.set(
			(posIn.x / size.x) * 2 - 1,
			-(posIn.y / size.y) * 2 + 1,
			0
		);

	vector.unproject(camera);

	const dir = vector.sub(camera.position).normalize();
	const distance = (zNeeded - (camZ ?? 15)) / dir.z;
	vector.release();

	if (!posOut) posOut = new Vector3();

	posOut.copy(camera.position)
		.add(dir.multiplyScalar(distance));

	return posOut;
}

export default screenToWorld;
