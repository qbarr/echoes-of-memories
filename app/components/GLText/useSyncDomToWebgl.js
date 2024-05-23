import { Frustum, Matrix4, Object3D, Vector3 } from 'three';

import { webgl } from '#webgl/core';
import { debounce } from '#utils/async';
import screenToWorld from './screenToWorld';

const vec3 = new Vector3();
const F = new Frustum();
const object3d = new Object3D();

export function useSyncDomToWebgl(node, force = false) {
	if (!node) return;

	const nodeBounds = {};
	const api = {};

	const computeNodeBounds = () => {
		const { top, left, width, height } = node.getBoundingClientRect();
		const x = left + width / 2;
		const y = top + height / 2;
		return { x, y, width, height };
	};

	const resize = debounce(
		() => {
			Object.assign(nodeBounds, computeNodeBounds());
		},
		200
	);

	webgl.hooks.afterResize.watch(resize);
	resize();

	Object.assign(node, { sync: api });

	return Object.assign(api, {
		node,

		nodeBounds,
		position: new Vector3(),
		isInViewport: false,
		force,

		resize,
		update,
		destroy
	});


	function destroy() {
		webgl.hooks.afterResize.unwatch(resize);
		delete node.sync;
	}

	function update() {
		const { instance: renderer } = webgl.$renderer;
		const camera = webgl.$game.currentChapter?.camera?.base;
		if (!camera || !renderer) return;

		// Screen position
		object3d.updateMatrix();
		object3d.updateMatrixWorld(false);

		api.force && Object.assign(nodeBounds, computeNodeBounds());

		// World position
		screenToWorld(
			{ x: nodeBounds.x, y: nodeBounds.y },
			camera, 0, vec3, camera.position.z
		);

		object3d.localToWorld(vec3);

		// Check frustrum to avoid positions behind camera
		const mat4 = Matrix4.get();
		F.setFromProjectionMatrix(
			mat4.multiplyMatrices(
				camera.projectionMatrix,
				camera.matrixWorldInverse
			)
		);
		mat4.release();

		api.position.copy(vec3);

		api.isInViewport = F.containsPoint(vec3);
	}
}
